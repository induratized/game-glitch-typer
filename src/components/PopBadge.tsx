import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface PopBadgeProps {
  text: string;
  type: 'combo' | 'good' | 'unstoppable' | 'levelup' | 'collect';
  x: number;
  y: number;
  onComplete?: () => void;
}

/**
 * PopBadge: floating feedback text that appears and fades away
 * Used for combo hits, score increments, and level-ups
 */
export function PopBadge({ text, type, x, y, onComplete }: PopBadgeProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={clsx(
        'pop-badge fixed pointer-events-none font-bold select-none',
        type === 'combo' && 'text-pink-400',
        type === 'good' && 'text-cyan-300',
        type === 'unstoppable' && 'text-purple-400',
        type === 'levelup' && 'text-yellow-300 text-3xl',
        type === 'collect' && 'text-emerald-300'
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        animation: `pop-float-fade 800ms ease-out forwards`
      }}
    >
      {text}
    </div>
  );
}

export default PopBadge;
