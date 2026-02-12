import clsx from "clsx";
import { motion } from "framer-motion";

type Variant =
    | "lollipop"
    | "wrapped"
    | "gumdrop"
    | "strawberry"
    | "donut"
    | "choco"
    | "cookie"
    | "cupcake"
    | "soda";

export type Mood = "idle" | "happy" | "stressed" | "dizzy" | "victory" | "sad";

const VARIANT_EMOJI: Record<Variant, string> = {
    lollipop: "🍭",
    wrapped: "🍬",
    gumdrop: "🍡",
    strawberry: "🍓",
    donut: "🍩",
    choco: "🍫",
    soda: "🥤",
    cookie: "🍪",
    cupcake: "🧁",
};

const MOOD_EMOJI: Record<Mood, string> = {
    idle: "", // Uses variant emoji
    happy: "✨",
    stressed: "💢",
    dizzy: "😵‍💫",
    victory: "👑",
    sad: "😭",
};

export const Mascot = ({
    size = 64,
    className = "",
    variant = "lollipop",
    mood = "idle",
}: {
    size?: number;
    className?: string;
    variant?: Variant;
    mood?: Mood;
}) => {
    const baseEmoji = VARIANT_EMOJI[variant] || VARIANT_EMOJI.lollipop;
    const moodOverlay = MOOD_EMOJI[mood];

    const animationProps = () => {
        switch (mood) {
            case "happy":
                return {
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1],
                    transition: { duration: 0.5, repeat: Infinity }
                };
            case "stressed":
                return {
                    x: [-2, 2, -2, 2, 0],
                    rotate: [-5, 5, -5, 5, 0],
                    transition: { duration: 0.1, repeat: Infinity }
                };
            case "dizzy":
                return {
                    rotate: 360,
                    scale: [1, 0.8, 1],
                    transition: { duration: 2, repeat: Infinity, ease: "linear" }
                };
            case "victory":
                return {
                    scale: [1, 1.5, 1],
                    rotate: [0, 360],
                    transition: { duration: 1, repeat: Infinity }
                };
            case "sad":
                return {
                    y: [0, 10, 0],
                    rotate: [-10, 10, -10],
                    scale: [1, 0.9, 1],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                };
            default:
                return {
                    y: [0, -4, 0],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                };
        }
    };

    return (
        <motion.div
            aria-hidden
            className={clsx("mascot-wrapper select-none relative", className)}
            style={{ ["--mascot-size" as any]: `${size}px` }}
            animate={animationProps()}
        >
            <div
                className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-2xl shadow-lg candy-card relative overflow-hidden"
            >
                <div
                    className="mascot-emoji"
                    style={{ transform: "translateY(1px)" }}
                >
                    {baseEmoji}
                </div>

                {moodOverlay && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-1 right-1 text-sm pointer-events-none"
                    >
                        {moodOverlay}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Mascot;
