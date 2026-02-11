import { useEffect, useRef } from "react";
import Mascot from "./Mascot";

type MascotSpec = {
    id: number;
    size: number;
    variant?:
    | "lollipop"
    | "wrapped"
    | "gumdrop"
    | "strawberry"
    | "donut"
    | "choco"
    | "cookie"
    | "cupcake"
    | "soda";
};

const DEFAULTS: MascotSpec[] = [
    { id: 1, size: 320, variant: "lollipop" },
    { id: 2, size: 260, variant: "wrapped" },
    { id: 3, size: 300, variant: "gumdrop" },
    { id: 4, size: 220, variant: "strawberry" },
    { id: 5, size: 240, variant: "donut" },
    { id: 6, size: 200, variant: "choco" },
    { id: 7, size: 180, variant: "cookie" },
    { id: 8, size: 160, variant: "cupcake" },
    { id: 9, size: 200, variant: "soda" },
];

function randRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export default function RoamingMascots({
    specs = DEFAULTS,
}: {
    specs?: MascotSpec[];
}) {
    const rafRef = useRef<number | null>(null);
    const stateRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const w = () => window.innerWidth;
        const h = () => window.innerHeight;

        const mascots = specs.map((s) => {
            const radius = s.size / 2;
            return {
                id: s.id,
                x: randRange(radius, Math.max(200, w() - radius)),
                y: randRange(radius, Math.max(200, h() - radius)),
                vx: randRange(-20, 20), // px per second, keep slow
                vy: randRange(-20, 20),
                radius,
                size: s.size,
                variant: s.variant,
            };
        });

        stateRef.current = { mascots, last: performance.now() };

        const tick = (t: number) => {
            const s = stateRef.current;
            if (!s) return;
            const dt = Math.min(0.05, (t - s.last) / 1000); // clamp dt
            s.last = t;

            // move
            for (let i = 0; i < s.mascots.length; i++) {
                const m = s.mascots[i];
                m.x += m.vx * dt;
                m.y += m.vy * dt;

                // bounds
                if (m.x - m.radius < 0) {
                    m.x = m.radius;
                    m.vx *= -1;
                }
                if (m.y - m.radius < 0) {
                    m.y = m.radius;
                    m.vy *= -1;
                }
                if (m.x + m.radius > w()) {
                    m.x = w() - m.radius;
                    m.vx *= -1;
                }
                if (m.y + m.radius > h()) {
                    m.y = h() - m.radius;
                    m.vy *= -1;
                }
            }

            // collisions
            for (let i = 0; i < s.mascots.length; i++) {
                for (let j = i + 1; j < s.mascots.length; j++) {
                    const a = s.mascots[i];
                    const b = s.mascots[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.hypot(dx, dy) || 0.0001;
                    const minDist = a.radius + b.radius;
                    if (dist < minDist) {
                        // simple elastic collision response: swap velocities along collision normal
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const p =
                            (2 *
                                (a.vx * nx +
                                    a.vy * ny -
                                    b.vx * nx -
                                    b.vy * ny)) /
                            2; // equal mass
                        a.vx = a.vx - p * nx + randRange(-2, 2);
                        a.vy = a.vy - p * ny + randRange(-2, 2);
                        b.vx = b.vx + p * nx + randRange(-2, 2);
                        b.vy = b.vy + p * ny + randRange(-2, 2);

                        // separate overlap
                        const overlap = (minDist - dist) / 2 + 0.5;
                        a.x -= nx * overlap;
                        a.y -= ny * overlap;
                        b.x += nx * overlap;
                        b.y += ny * overlap;
                    }
                }
            }

            // apply to DOM
            if (containerRef.current) {
                const children = Array.from(
                    containerRef.current.children,
                ) as HTMLElement[];
                for (let i = 0; i < s.mascots.length; i++) {
                    const el = children[i];
                    if (!el) continue;
                    const m = s.mascots[i];
                    el.style.transform = `translate(${m.x - m.radius}px, ${m.y - m.radius}px)`;
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        const onResize = () => {
            // clamp positions inside new viewport
            const s = stateRef.current;
            for (const m of s.mascots) {
                m.x = Math.max(
                    m.radius,
                    Math.min(window.innerWidth - m.radius, m.x),
                );
                m.y = Math.max(
                    m.radius,
                    Math.min(window.innerHeight - m.radius, m.y),
                );
            }
        };

        window.addEventListener("resize", onResize);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", onResize);
            stateRef.current = null;
        };
    }, [specs]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
        >
            {specs.map((d) => (
                <div
                    key={d.id}
                    style={{ position: "absolute", left: 0, top: 0 }}
                >
                    <Mascot
                        size={d.size}
                        variant={d.variant}
                        className="roaming-mascot"
                    />
                </div>
            ))}
        </div>
    );
}
