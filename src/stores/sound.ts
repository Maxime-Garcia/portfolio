import { atom } from 'nanostores';

const KEY = 'orbite:sound';

function initial(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

/** Sound is off by default; the choice is remembered. Audio starts only after a user action. */
export const soundEnabled = atom<boolean>(typeof localStorage === 'undefined' ? false : initial());

soundEnabled.listen((on) => {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* storage blocked */
  }
});
