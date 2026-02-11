import { useEffect, useState } from 'react';

interface CollectAnimationProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  emoji: string;
  onComplete?: () => void;
}

/**
 * CollectAnimation: animates a particle flying from source to destination
 * Used when completing words/tiles to show collect-to-HUD feedback
 */
export function CollectAnimation({
  fromX,
  fromY,
  toX,
  toY,
  emoji,
  onComplete
}: CollectAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="collect-particle fixed pointer-events-none"
      style={{
        left: `${fromX}px`,
        top: `${fromY}px`,
        '--collect-delta-x': `${deltaX}px`,
        '--collect-delta-y': `${deltaY}px`,
        '--collect-scale-end': '0.5'
      } as React.CSSProperties & { '--collect-delta-x': string; '--collect-delta-y': string; '--collect-scale-end': string }}
    >
      {emoji}
    </div>
  );
}

export default CollectAnimation;
