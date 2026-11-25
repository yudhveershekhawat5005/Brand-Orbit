"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

// Scroll-scrub hero — sticky + tall-wrapper pattern, drawn from an image
// sequence on a <canvas>.
//
// Why not scrub a <video>? The source clip has a single keyframe, so every
// `video.currentTime` seek made the browser decode all frames from the start
// up to that point. That is what made scrolling through this section lag, and
// on phones it also meant network seeks. Instead, pre-extracted WebP frames are
// downloaded once, a small window of them around the scroll position is decoded
// off the main thread (createImageBitmap), and the scroll handler just blits
// one bitmap onto the canvas.
//
// A wrapper div extends beyond the viewport by `scrubDistance` pixels. The
// visible section is `position: sticky` and stays in view while the user
// scrolls through the wrapper. Scroll position picks the frame and drives the
// text overlays. Everything is idle (no rAF loop) while the user isn't
// scrolling or the hero is off screen.
//
// Frames live in /public/hero-frames/<version>/{desktop,mobile}/f-001.webp …
// `desktop` is 1280x720, `mobile` is a centre-cropped 540x960 portrait slice.
// The folder is versioned and served with immutable cache headers
// (see next.config.ts), so bump the version if the frames ever change.

export interface MetroHeroProps {
  /** Public folder holding `desktop/` and `mobile/` frame sets. */
  framesBase?: string
  /** Number of frames in each set (f-001.webp … f-NNN.webp). */
  frameCount?: number
  title?: string
  subtitle?: string
  scrollHint?: string
  tagline?: string
  signature?: { name: string; url: string } | false
  /** Extra scroll distance (px) the wrapper extends beyond the viewport. */
  scrubDistance?: number
  className?: string
  style?: React.CSSProperties
}

type FrameSet = "desktop" | "mobile"

const SANS =
  "var(--font-heading), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const COL_BG = "#05070d"
const COL_TEXT = "#f2f4f8"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
// Phones and any portrait viewport get the cropped portrait frames.
const MOBILE_QUERY = "(max-width: 767px), (orientation: portrait)"
const LOAD_CONCURRENCY = 6
// Frames kept decoded on each side of the scroll position (13 bitmaps ≈ 25–50 MB).
const DECODE_WINDOW = 6
// How quickly the shown frame catches up with the scroll position (per second).
const SMOOTHING = 14

function subscribeReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  mediaQuery.addEventListener("change", onChange)
  return () => mediaQuery.removeEventListener("change", onChange)
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function frameUrl(base: string, set: FrameSet, index: number) {
  return `${base}/${set}/f-${String(index + 1).padStart(3, "0")}.webp`
}

// Coarse-to-fine load order (ends first, then every 16th, 8th, 4th … frame) so
// scrubbing works almost immediately and sharpens as the rest streams in.
function loadOrder(count: number) {
  const seen = new Set<number>()
  const order: number[] = []
  const add = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
  add(0)
  add(count - 1)
  for (let stride = 16; stride >= 1; stride /= 2) {
    for (let i = 0; i < count; i += stride) add(i)
  }
  return order
}

const fillStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  pointerEvents: "none",
}

export default function MetroHero({
  framesBase = "/hero-frames/v1",
  frameCount = 96,
  title = "THE CITY OPENS",
  subtitle,
  scrollHint = "SCROLL",
  tagline = "Every door in the city is already open.",
  signature = false,
  scrubDistance = 4000,
  className,
  style,
}: MetroHeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const skipScrub = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)

  const { height: sectionHeight = "100dvh", ...restStyle } = style || {}

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const set: FrameSet = window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop"
    let alive = true

    // ---- reduced motion: no scrubbing, just a still of the "open" frame ----
    if (skipScrub) {
      const img = new Image()
      img.onload = () => {
        if (!alive) return
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
      }
      img.src = frameUrl(framesBase, set, Math.round(0.92 * (frameCount - 1)))
      return () => {
        alive = false
      }
    }

    // Every frame is downloaded once as a Blob (cheap to keep: ~5 MB in total).
    // Only a small window of frames around the scroll position is decoded into
    // ImageBitmaps. createImageBitmap(blob) decodes off the main thread, so the
    // scroll handler only ever blits an already-decoded bitmap.
    const blobs: (Blob | undefined)[] = new Array(frameCount)
    const bitmaps = new Map<number, ImageBitmap>()
    const decoding = new Set<number>()
    const canDecode = typeof createImageBitmap === "function"
    let center = 0 // frame the user is scrolling towards: the decode window follows it
    let drawn = -1

    async function fetchFrame(index: number) {
      try {
        const res = await fetch(frameUrl(framesBase, set, index), {
          priority: index === 0 ? "high" : "low",
        })
        if (res.ok) {
          const blob = await res.blob()
          if (alive) blobs[index] = blob
        }
      } catch {
        // A missing frame just means the nearest decoded one is shown instead.
      }
    }

    function requestBitmap(index: number) {
      const blob = blobs[index]
      if (!blob || bitmaps.has(index) || decoding.has(index)) return
      decoding.add(index)
      createImageBitmap(blob).then(
        (bitmap) => {
          decoding.delete(index)
          if (alive) {
            bitmaps.set(index, bitmap)
            kick()
          } else {
            bitmap.close()
          }
        },
        () => decoding.delete(index),
      )
    }

    function nearestBy(index: number, has: (i: number) => unknown) {
      for (let d = 0; d < frameCount; d++) {
        if (has(index - d)) return index - d
        if (has(index + d)) return index + d
      }
      return -1
    }

    // Decode the window nearest-first, and free bitmaps that fell out of it.
    function syncWindow() {
      if (!canDecode) return
      let requested = false
      for (let d = 0; d <= DECODE_WINDOW; d++) {
        for (const i of d === 0 ? [center] : [center + d, center - d]) {
          if (blobs[i]) {
            requestBitmap(i)
            requested = true
          }
        }
      }
      // Still streaming in and nothing near the scroll position yet: decode
      // whichever downloaded frame is closest so something sensible is shown.
      if (!requested) {
        const nearest = nearestBy(center, (i) => blobs[i])
        if (nearest !== -1) requestBitmap(nearest)
      }
      // Only free far-away bitmaps once something inside the window is ready.
      let haveNearby = false
      for (const i of bitmaps.keys()) {
        if (Math.abs(i - center) <= DECODE_WINDOW + 2) haveNearby = true
      }
      if (!haveNearby) return
      for (const [i, bitmap] of bitmaps) {
        if (Math.abs(i - center) > DECODE_WINDOW + 2) {
          bitmap.close()
          bitmaps.delete(i)
        }
      }
    }

    const drawFrame = (index: number) => {
      const bitmap = bitmaps.get(index)
      if (!bitmap) return
      // The canvas keeps the frame's own size; CSS `object-fit: cover` does the
      // scaling on the GPU, so nothing is resized or re-scaled while scrolling.
      if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
        canvas.width = bitmap.width
        canvas.height = bitmap.height
      }
      ctx.drawImage(bitmap, 0, 0)
      drawn = index
    }

    // ---- overlays (transform / opacity only, so they stay on the compositor) ----
    let paintedProgress = -1
    function paintOverlays(p: number) {
      if (p === paintedProgress) return
      paintedProgress = p
      if (canvas) canvas.style.transform = `scale(${1 + p * 0.06})`
      if (titleRef.current) {
        const t = 1 - clamp(p / 0.35, 0, 1)
        titleRef.current.style.opacity = String(t)
        titleRef.current.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = p > 0.01 ? "0" : "1"
      }
      if (taglineRef.current) {
        const t = clamp((p - 0.82) / 0.18, 0, 1)
        taglineRef.current.style.opacity = String(t)
        taglineRef.current.style.transform = `translateY(${(1 - t) * 20}px) scale(${0.97 + t * 0.03})`
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p})`
      }
    }

    function paint(p: number, target: number) {
      center = Math.round(target * (frameCount - 1))
      syncWindow()
      const best = nearestBy(Math.round(p * (frameCount - 1)), (i) => bitmaps.has(i))
      if (best !== -1 && best !== drawn) drawFrame(best)
      paintOverlays(p)
    }

    // ---- scroll-driven loop: only runs while there is something to animate ----
    const readTarget = () =>
      clamp(-wrapper.getBoundingClientRect().top / scrubDistance, 0, 1)

    let current = readTarget()
    let inView = true
    let raf = 0
    let last = 0

    function step(now: number) {
      raf = 0
      if (!inView || !alive) return
      const dt = clamp((now - last) / 1000, 0, 0.05)
      last = now
      const target = readTarget()
      const diff = target - current
      current =
        Math.abs(diff) < 0.0004 ? target : current + diff * (1 - Math.exp(-dt * SMOOTHING))
      paint(current, target)
      if (current !== target) raf = requestAnimationFrame(step)
    }

    function kick() {
      if (raf || !inView || !alive) return
      last = performance.now()
      raf = requestAnimationFrame(step)
    }

    paintOverlays(current)

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView) kick()
      },
      { rootMargin: "200px 0px" },
    )
    io.observe(wrapper)
    window.addEventListener("scroll", kick, { passive: true })
    window.addEventListener("resize", kick)

    // ---- stream the frames in, a few at a time ----
    const order = loadOrder(frameCount)
    let cursor = 0
    function pump() {
      if (!alive || cursor >= order.length) return
      fetchFrame(order[cursor++]).then(() => {
        kick()
        pump()
      })
    }
    for (let w = 0; w < LOAD_CONCURRENCY; w++) pump()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("scroll", kick)
      window.removeEventListener("resize", kick)
      for (const bitmap of bitmaps.values()) bitmap.close()
      bitmaps.clear()
    }
  }, [skipScrub, scrubDistance, frameCount, framesBase])

  const heightStr =
    typeof sectionHeight === "number" ? `${sectionHeight}px` : sectionHeight
  const wrapperHeight = skipScrub
    ? sectionHeight
    : `calc(${heightStr} + ${scrubDistance}px)`

  return (
    <div ref={wrapperRef} style={{ height: wrapperHeight }}>
      <div
        className={className}
        style={{
          position: skipScrub ? "relative" : "sticky",
          top: 0,
          height: sectionHeight,
          width: "100%",
          overflow: "hidden",
          background: COL_BG,
          ...restStyle,
        }}
      >
        {/* ---- first frame as a real <img>: paints instantly, before any JS ---- */}
        <picture>
          <source media={MOBILE_QUERY} srcSet={frameUrl(framesBase, "mobile", 0)} />
          <img
            src={frameUrl(framesBase, "desktop", 0)}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            style={fillStyle}
          />
        </picture>

        {/* ---- scrubbed frames (transparent until the first frame is drawn) ---- */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            ...fillStyle,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        />

        {/* ---- gradient overlay ---- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,7,13,0.55), rgba(5,7,13,0.25) 35%, rgba(5,7,13,0.3) 70%, rgba(5,7,13,0.7))",
            pointerEvents: "none",
          }}
        />

        {/* ---- title / subtitle ---- */}
        <div
          ref={titleRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(14px, 2.4vw, 28px)",
            padding: "0 6%",
            textAlign: "center",
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}
        >
          <h1
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: "clamp(30px, 6.2vw, 88px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: COL_TEXT,
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
              maxWidth: "16ch",
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: "clamp(14px, 1.6vw, 20px)",
                lineHeight: 1.5,
                color: "rgba(242,244,248,0.82)",
                textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                maxWidth: "46ch",
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* ---- end-of-scrub tagline ---- */}
        {tagline && (
          <div
            ref={taglineRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8%",
              textAlign: "center",
              opacity: 0,
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: "clamp(20px, 3.4vw, 40px)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                color: COL_TEXT,
                textShadow: "0 4px 24px rgba(0,0,0,0.5)",
                maxWidth: "26ch",
              }}
            >
              {tagline}
            </span>
          </div>
        )}

        {/* ---- scroll hint ---- */}
        <div
          ref={hintRef}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "clamp(20px, 6vh, 48px)",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            color: "rgba(240,244,248,0.75)",
            fontFamily: SANS,
            fontSize: "clamp(10px, 1.4vw, 12px)",
            fontWeight: 600,
            letterSpacing: "0.3em",
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }}
        >
          <span>{scrollHint}</span>
          <svg
            width="14"
            height="18"
            viewBox="0 0 14 18"
            style={{
              animation: "metro-hero-bounce 1.6s ease-in-out infinite",
            }}
          >
            <style>{`
              @keyframes metro-hero-bounce {
                0%, 100% { transform: translateY(0); opacity: 0.5; }
                50% { transform: translateY(5px); opacity: 1; }
              }
            `}</style>
            <path
              d="M7 1 L7 17 M2 12 L7 17 L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ---- progress bar ---- */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: "100%",
              width: "100%",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.95))",
              transform: "scaleX(0)",
              transformOrigin: "left center",
            }}
          />
        </div>

        {/* ---- signature ---- */}
        {signature && (
          <span
            style={{
              position: "absolute",
              right: "clamp(12px, 2.5vw, 24px)",
              bottom: "clamp(10px, 2vw, 18px)",
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: "clamp(11px, 1.4vw, 13px)",
              color: "rgba(220,224,232,0.6)",
              zIndex: 2,
            }}
          >
            by{" "}
            <a
              href={signature.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {signature.name}
            </a>
          </span>
        )}
      </div>
    </div>
  )
}
