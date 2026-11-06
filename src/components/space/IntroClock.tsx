import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { intro } from './intro';

/** Starts the entrance fade when mounted (i.e. when the Suspense content is ready). */
export function IntroClock({ reduced }: { reduced: boolean }) {
  const clock = useThree((state) => state.clock);
  const invalidate = useThree((state) => state.invalidate);
  useLayoutEffect(() => {
    intro.duration = reduced ? 0.4 : 1.8;
    intro.start = clock.elapsedTime;
    // Demand frameloop (reduced motion): keep rendering through the short fade.
    const frames = setInterval(invalidate, 50);
    const stop = setTimeout(() => clearInterval(frames), (intro.duration + 0.2) * 1000);
    return () => {
      clearInterval(frames);
      clearTimeout(stop);
      intro.start = -1;
    };
  }, [clock, invalidate, reduced]);
  return null;
}
