import { motion } from "framer-motion";
import clsx from "clsx";

interface PopBadgeProps {
  text: string;
  type?: "score" | "combo" | "level" | "error";
  x: number;
  y: number;
  onComplete: () => void;
}

export const PopBadge = ({ text, type = "score", x, y, onComplete }: PopBadgeProps) => {
  const colors = {
    score: "text-candy-mint shadow-[0_0_8px_rgba(122,246,217,0.6)]",
    combo: "text-candy-pink shadow-[0_0_8px_rgba(255,122,182,0.6)]",
    level: "text-candy-lemon shadow-[0_0_8px_rgba(255,243,189,0.6)]",
    error: "text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, x, y }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: y - 100,
        rotate: [0, -10, 10, 0]
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className={clsx(
        "fixed pointer-events-none z-[100] font-black italic text-2xl drop-shadow-lg score-level-font",
        colors[type]
      )}
    >
      {text}
    </motion.div>
  );
};

export default PopBadge;
