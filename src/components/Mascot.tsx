import clsx from "clsx";

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

export const Mascot = ({
    size = 64,
    className = "",
    variant = "lollipop",
}: {
    size?: number;
    className?: string;
    variant?: Variant;
}) => {
    const emoji = VARIANT_EMOJI[variant] || VARIANT_EMOJI.lollipop;

    return (
        <div
            aria-hidden
            className={clsx("mascot-wrapper select-none", className)}
            style={{ ["--mascot-size" as any]: `${size}px` }}
        >
            <div
                className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-2xl shadow-lg candy-card"
                style={{ transform: "translateY(-4px)" }}
            >
                <div
                    className="mascot-emoji"
                    style={{ transform: "translateY(1px)" }}
                >
                    {emoji}
                </div>
            </div>
        </div>
    );
};

export default Mascot;
