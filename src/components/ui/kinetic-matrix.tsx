'use client';

import React, { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

interface MatrixNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
    col: number;
    row: number;
    radius: number;
    label: string;
    tension: number;
    pulsePhase: number;
}

interface SynapticPulse {
    fromNode: number;
    toNode: number;
    progress: number;
    speed: number;
}

interface GravitationalShockwave {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    power: number;
}

export interface KineticMatrixProps {
    title?: string;
    className?: string;
    titleClassName?: string;
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeColorScheme(onChange: () => void) {
    const mediaQuery = window.matchMedia(DARK_QUERY);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
}

function getColorScheme() {
    return window.matchMedia(DARK_QUERY).matches;
}

function drawLatticeLink(
    ctx: CanvasRenderingContext2D,
    n1: MatrixNode,
    n2: MatrixNode,
    restLen: number,
    isDark: boolean,
    nodeColor: string
) {
    const dx = n1.x - n2.x;
    const dy = n1.y - n2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const stretch = Math.min(1.2, Math.abs(dist - restLen) / restLen);
    const isTensioned = n1.tension > 0.05 || n2.tension > 0.05 || stretch > 0.08;

    if (isTensioned) {
        const glow = Math.min(1, Math.max(n1.tension, n2.tension, stretch));
        ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${Math.min(0.95, 0.25 + glow * 0.7)})`
            : `rgba(0, 0, 0, ${Math.min(0.95, 0.25 + glow * 0.7)})`;
        // Strictly capped line width so it never blooms into thick slabs
        ctx.lineWidth = Math.min(2.0, 0.7 + glow * 1.3);
    } else {
        ctx.strokeStyle = `rgba(${nodeColor}, ${isDark ? 0.09 : 0.06})`;
        ctx.lineWidth = 0.65;
    }

    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.stroke();
}

export function KineticMatrix({
    title = "TOPOLOGY",
    className = "",
    titleClassName = "",
}: KineticMatrixProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const isDarkMode = useSyncExternalStore(subscribeColorScheme, getColorScheme, () => true);

    // Pointer state with smooth inertia (mouse or touch)
    const pointerRef = useRef({
        x: -2000,
        y: -2000,
        prevX: -2000,
        prevY: -2000,
        vx: 0,
        vy: 0,
        radius: 200,
        isDown: false,
    });

    const nodesRef = useRef<MatrixNode[]>([]);
    const pulsesRef = useRef<SynapticPulse[]>([]);
    const shockwavesRef = useRef<GravitationalShockwave[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0, cols: 0, rows: 0, spacing: 52 });

    // Grid lattice initializer
    const buildLattice = useCallback((width: number, height: number) => {
        const spacing = 52;
        const cols = Math.ceil(width / spacing) + 1;
        const rows = Math.ceil(height / spacing) + 1;
        const nodes: MatrixNode[] = [];

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const x = c * spacing;
                const y = r * spacing;
                nodes.push({
                    x,
                    y,
                    vx: 0,
                    vy: 0,
                    baseX: x,
                    baseY: y,
                    col: c,
                    row: r,
                    radius: 1.4,
                    label: `0x${((c * 17 + r * 31) % 256).toString(16).padStart(2, '0').toUpperCase()}`,
                    tension: 0,
                    pulsePhase: Math.random() * Math.PI * 2,
                });
            }
        }

        dimensionsRef.current = { width, height, cols, rows, spacing };
        nodesRef.current = nodes;
        pulsesRef.current = [];
    }, []);

    // Canvas Resize Observer with subpixel rounding correction
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const rect = entry.contentRect;
                const dpr = Math.min(window.devicePixelRatio || 1, 2);

                canvas.width = Math.floor(rect.width * dpr);
                canvas.height = Math.floor(rect.height * dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                buildLattice(rect.width, rect.height);
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [buildLattice]);

    // Main High-Performance Simulation & Rendering Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animId = 0;
        let lastTime = performance.now();
        let running = false;

        const render = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.033);
            lastTime = now;

            const { width, height, cols, rows, spacing } = dimensionsRef.current;
            const nodes = nodesRef.current;
            const pulses = pulsesRef.current;
            const shockwaves = shockwavesRef.current;
            const pointer = pointerRef.current;

            // Pointer velocity interpolation
            pointer.vx = (pointer.x - pointer.prevX) / (dt * 1000 || 1);
            pointer.vy = (pointer.y - pointer.prevY) / (dt * 1000 || 1);
            pointer.prevX = pointer.x;
            pointer.prevY = pointer.y;
            const mouseSpeed = Math.min(600, Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy));

            // Adapt pointer radius dynamically to container width
            pointer.radius = width > 0 ? Math.max(140, Math.min(210, width * 0.44)) : 200;

            const isDark = document.documentElement.classList.contains('dark') || isDarkMode;
            const bgColor = isDark ? '#06070a' : '#f9fafb';
            const nodeColor = isDark ? '255, 255, 255' : '17, 24, 39';
            const accentGlow = isDark ? '255, 255, 255' : '0, 0, 0';

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            // 1. Propagate Shockwaves (calm, capped speed)
            for (let s = shockwaves.length - 1; s >= 0; s--) {
                const sw = shockwaves[s];
                sw.radius += 320 * dt;
                sw.power *= Math.pow(0.15, dt);
                if (sw.radius > sw.maxRadius || sw.power < 0.01) {
                    shockwaves.splice(s, 1);
                }
            }

            // 2. Stable Physics Step (Hooke's Spring-Mass Lattice with displacement clamping)
            const SPRING_K = 22;
            const DAMPING = 0.86;
            const maxDisplacement = spacing * 0.72; // strictly prevents nodes from overlapping or flying away

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.pulsePhase += dt * 2.2;

                // Pointer repulsion (only when pointer is inside container)
                if (pointer.x > -1000) {
                    const dx = pointer.x - n.x;
                    const dy = pointer.y - n.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < pointer.radius && dist > 0) {
                        const ratio = 1 - dist / pointer.radius;
                        const force = ratio * (950 + mouseSpeed * 0.45 + (pointer.isDown ? 1100 : 0));
                        const angle = Math.atan2(dy, dx);

                        n.vx -= Math.cos(angle) * force * dt;
                        n.vy -= Math.sin(angle) * force * dt;
                        n.tension = Math.min(1, n.tension + ratio * 0.4);
                    }
                }

                // Shockwave repulsion
                for (let s = 0; s < shockwaves.length; s++) {
                    const sw = shockwaves[s];
                    const swDx = n.x - sw.x;
                    const swDy = n.y - sw.y;
                    const swDist = Math.sqrt(swDx * swDx + swDy * swDy);
                    const delta = Math.abs(swDist - sw.radius);

                    if (delta < 45) {
                        const force = (1 - delta / 45) * sw.power * 1000;
                        const angle = Math.atan2(swDy, swDx);
                        n.vx += Math.cos(angle) * force * dt;
                        n.vy += Math.sin(angle) * force * dt;
                        n.tension = Math.min(1, n.tension + 0.5);
                    }
                }

                // Spring force back to rest position
                const hx = n.baseX - n.x;
                const hy = n.baseY - n.y;
                n.vx += hx * SPRING_K * dt;
                n.vy += hy * SPRING_K * dt;

                // Clamp velocities to guarantee stability
                n.vx = Math.max(-14, Math.min(14, n.vx * DAMPING));
                n.vy = Math.max(-14, Math.min(14, n.vy * DAMPING));

                // Position update with absolute displacement bounds
                n.x = Math.max(n.baseX - maxDisplacement, Math.min(n.baseX + maxDisplacement, n.x + n.vx * dt * 60));
                n.y = Math.max(n.baseY - maxDisplacement, Math.min(n.baseY + maxDisplacement, n.y + n.vy * dt * 60));

                n.tension = Math.max(0, n.tension - dt * 0.9);
            }

            // 3. Gentle Synaptic Traveling Pulses
            if (Math.random() < 0.25 && nodes.length > 0 && pulses.length < 30) {
                const fromIdx = Math.floor(Math.random() * nodes.length);
                const fromNode = nodes[fromIdx];
                const possibleDirections = [
                    { dc: 1, dr: 0 },
                    { dc: -1, dr: 0 },
                    { dc: 0, dr: 1 },
                    { dc: 0, dr: -1 },
                ];
                const dir = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                const targetCol = fromNode.col + dir.dc;
                const targetRow = fromNode.row + dir.dr;

                if (targetCol >= 0 && targetCol < cols && targetRow >= 0 && targetRow < rows) {
                    const toIdx = targetCol * rows + targetRow;
                    if (toIdx >= 0 && toIdx < nodes.length) {
                        pulses.push({
                            fromNode: fromIdx,
                            toNode: toIdx,
                            progress: 0,
                            speed: 1.4 + Math.random() * 1.6,
                        });
                    }
                }
            }

            // 4. Render Grid Tension Strands
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const idx = c * rows + r;
                    const n = nodes[idx];
                    if (!n) continue;

                    if (c < cols - 1) {
                        const rightIdx = (c + 1) * rows + r;
                        const nr = nodes[rightIdx];
                        if (nr) drawLatticeLink(ctx, n, nr, spacing, isDark, nodeColor);
                    }

                    if (r < rows - 1) {
                        const downIdx = c * rows + (r + 1);
                        const nd = nodes[downIdx];
                        if (nd) drawLatticeLink(ctx, n, nd, spacing, isDark, nodeColor);
                    }
                }
            }

            // 5. Render Synaptic Data Pulses
            for (let p = pulses.length - 1; p >= 0; p--) {
                const pulse = pulses[p];
                pulse.progress += dt * pulse.speed;

                const n1 = nodes[pulse.fromNode];
                const n2 = nodes[pulse.toNode];

                if (!n1 || !n2 || pulse.progress >= 1) {
                    if (n2) n2.tension = Math.min(1, n2.tension + 0.3);
                    pulses.splice(p, 1);
                    continue;
                }

                const px = n1.x + (n2.x - n1.x) * pulse.progress;
                const py = n1.y + (n2.y - n1.y) * pulse.progress;

                ctx.fillStyle = isDark ? '#ffffff' : '#000000';
                ctx.beginPath();
                ctx.arc(px, py, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }

            // 6. Render Nodes & HUD Elements
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const dx = pointer.x - n.x;
                const dy = pointer.y - n.y;
                const dist = pointer.x > -1000 ? Math.sqrt(dx * dx + dy * dy) : 9999;
                const isNear = dist < pointer.radius;

                const currentRadius = isNear
                    ? n.radius * 2.0 + n.tension * 1.3
                    : n.radius + Math.sin(n.pulsePhase) * 0.2;

                if (isNear || n.tension > 0.1) {
                    ctx.fillStyle = `rgba(${accentGlow}, ${Math.min(0.9, 0.25 + n.tension * 0.65)})`;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, currentRadius * 2.0, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = isNear || n.tension > 0.1
                    ? (isDark ? '#ffffff' : '#000000')
                    : `rgba(${nodeColor}, ${isDark ? 0.28 : 0.2})`;

                ctx.beginPath();
                ctx.arc(n.x, n.y, Math.max(0.8, currentRadius), 0, Math.PI * 2);
                ctx.fill();

                if (dist < 88) {
                    const radarRing = ((n.pulsePhase * 18) % 30) + 4;
                    const ringAlpha = (1 - radarRing / 34) * 0.35;

                    ctx.strokeStyle = `rgba(${accentGlow}, ${ringAlpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, radarRing, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace';
                    ctx.fillStyle = `rgba(${accentGlow}, 0.85)`;
                    ctx.fillText(n.label, n.x + 9, n.y - 9);
                }
            }

            animId = requestAnimationFrame(render);
        };

        // Only simulate while the canvas is on screen. Left running it burned
        // main-thread time every frame while the user scrolled through the
        // scroll-scrub hero above it, which made that section lag.
        const start = () => {
            if (running) return;
            running = true;
            lastTime = performance.now();
            animId = requestAnimationFrame(render);
        };
        const stop = () => {
            running = false;
            cancelAnimationFrame(animId);
        };

        const observer = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? start() : stop()),
            { rootMargin: '100px 0px' }
        );
        observer.observe(canvas);

        return () => {
            observer.disconnect();
            stop();
        };
    }, [isDarkMode]);

    // Mouse handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        pointerRef.current.x = e.clientX - rect.left;
        pointerRef.current.y = e.clientY - rect.top;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        pointerRef.current.isDown = true;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        shockwavesRef.current.push({
            x,
            y,
            radius: 6,
            maxRadius: 360,
            power: 1.0,
        });
    };

    const handleMouseUp = () => {
        pointerRef.current.isDown = false;
    };

    const handleMouseLeave = () => {
        pointerRef.current.x = -2000;
        pointerRef.current.y = -2000;
        pointerRef.current.isDown = false;
    };

    // Touch handlers (reacts smoothly to touch on mobile without hijacking vertical scroll)
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container || !e.touches[0]) return;

        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        pointerRef.current.isDown = true;
        pointerRef.current.x = x;
        pointerRef.current.y = y;
        pointerRef.current.prevX = x;
        pointerRef.current.prevY = y;

        shockwavesRef.current.push({
            x,
            y,
            radius: 6,
            maxRadius: Math.min(rect.width * 0.7, 280),
            power: 0.9,
        });
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container || !e.touches[0]) return;

        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        pointerRef.current.x = touch.clientX - rect.left;
        pointerRef.current.y = touch.clientY - rect.top;
    };

    const handleTouchEnd = () => {
        pointerRef.current.isDown = false;
        pointerRef.current.x = -2000;
        pointerRef.current.y = -2000;
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            style={{ touchAction: 'pan-y' }}
            className={cn(
                "group relative flex h-full w-full select-none flex-col justify-between overflow-hidden bg-neutral-50 transition-colors duration-700 dark:bg-[#06070a]",
                className
            )}
        >
            {/* Absolute Edge-to-Edge Canvas Viewport */}
            <canvas
                ref={canvasRef}
                style={{ touchAction: 'pan-y' }}
                className="absolute inset-0 block h-full w-full cursor-crosshair"
            />

            {/* Content Deck Wrapper with Safe Padding */}
            <div className="relative z-20 flex h-full w-full flex-col justify-center p-6 md:p-10 pointer-events-none">
                {/* Center Hero Stencil Typography */}
                <div className="flex flex-col items-center justify-center text-center">
                    <p
                        className={cn(
                            "font-mono text-5xl font-black tracking-tighter uppercase sm:text-7xl md:text-9xl text-neutral-900 dark:text-white",
                            titleClassName
                        )}
                    >
                        {title}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default KineticMatrix;
