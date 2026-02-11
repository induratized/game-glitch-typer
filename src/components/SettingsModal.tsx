import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    music: boolean;
    shake: boolean;
    vibrate: boolean;
    soundFX: boolean;
  };
  onSettingsChange: (key: string, value: boolean) => void;
}

function IconMusic() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="6" height="10" rx="2" fill="#FFD6E0" />
      <path d="M9 9v6l8-3V6" stroke="#FF9AC2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShake() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="12" height="12" rx="2" fill="#BDE5FF" />
      <path d="M20 8l-2 8" stroke="#7FC3FF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6l1-2" stroke="#7FC3FF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconVibrate() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="8" height="16" rx="2" fill="#FFF3BD" />
      <path d="M4 7v10" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 7v10" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSFX() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12h4l5-5v10l-5-5H3z" fill="#DDEBFF" />
      <path d="M18 8c1.5 1.5 1.5 5 0 6.5" stroke="#9EC9FF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}: SettingsModalProps) {
  const toggle = (k: keyof SettingsModalProps['settings']) => {
    onSettingsChange(k, !settings[k]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-gradient-to-br from-white/6 to-white/3 rounded-2xl p-6 shadow-2xl border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-white/95 flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  Settings
                </h3>
                <button onClick={onClose} aria-label="Close settings" className="text-white/80">✕</button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                  <div className="flex items-center gap-3">
                    <IconMusic />
                    <div>
                      <div className="font-semibold text-white">Music</div>
                      <div className="text-xs text-white/70">Play background loop</div>
                    </div>
                  </div>
                  <button onClick={() => toggle('music')} className={clsx('relative inline-flex h-8 w-14 items-center rounded-full transition-colors', settings.music ? 'bg-candy-mint' : 'bg-gray-600')}>
                    <motion.span layout className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg" animate={{ x: settings.music ? 24 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                  <div className="flex items-center gap-3">
                    <IconShake />
                    <div>
                      <div className="font-semibold text-white">Screen Shake</div>
                      <div className="text-xs text-white/70">Enable shaking effects</div>
                    </div>
                  </div>
                  <button onClick={() => toggle('shake')} className={clsx('relative inline-flex h-8 w-14 items-center rounded-full transition-colors', settings.shake ? 'bg-candy-coral' : 'bg-gray-600')}>
                    <motion.span layout className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg" animate={{ x: settings.shake ? 24 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                  <div className="flex items-center gap-3">
                    <IconVibrate />
                    <div>
                      <div className="font-semibold text-white">Vibration</div>
                      <div className="text-xs text-white/70">Vibrate on events (mobile)</div>
                    </div>
                  </div>
                  <button onClick={() => toggle('vibrate')} className={clsx('relative inline-flex h-8 w-14 items-center rounded-full transition-colors', settings.vibrate ? 'bg-candy-lemon' : 'bg-gray-600')}>
                    <motion.span layout className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg" animate={{ x: settings.vibrate ? 24 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                  <div className="flex items-center gap-3">
                    <IconSFX />
                    <div>
                      <div className="font-semibold text-white">Sound Fx</div>
                      <div className="text-xs text-white/70">Game sound effects</div>
                    </div>
                  </div>
                  <button onClick={() => toggle('soundFX')} className={clsx('relative inline-flex h-8 w-14 items-center rounded-full transition-colors', settings.soundFX ? 'bg-candy-violet' : 'bg-gray-600')}>
                    <motion.span layout className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg" animate={{ x: settings.soundFX ? 24 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <motion.button whileTap={{ scale: 0.98 }} onClick={onClose} className="w-full px-4 py-3 rounded-lg bg-white/8 text-white font-semibold">Done</motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
