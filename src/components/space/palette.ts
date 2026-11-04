import { Color } from 'three';

export type ThemeName = 'dark' | 'light';

export interface Palette {
  surface: Color;
  ink: Color;
  plasma: Color;
  signal: Color;
  amp: Color;
  star: Color;
  nebulaA: Color;
  nebulaB: Color;
  nebula: number;
  /** Page background, used as fog colour. */
  background: Color;
}

/** Mirrors the CSS tokens. Light theme = "astronomical chart": ink stars, no nebula glow. */
export const palettes: Record<ThemeName, Palette> = {
  dark: {
    surface: new Color('#1a1f5c'),
    ink: new Color('#e8ecff'),
    plasma: new Color('#ff4fd8'),
    signal: new Color('#5ef2ff'),
    amp: new Color('#ffb347'),
    star: new Color('#e8ecff'),
    nebulaA: new Color('#ff4fd8'),
    nebulaB: new Color('#5ef2ff'),
    nebula: 0.22,
    background: new Color('#05060f'),
  },
  light: {
    surface: new Color('#d9cfb8'),
    ink: new Color('#14163a'),
    plasma: new Color('#a3127f'),
    signal: new Color('#00626e'),
    amp: new Color('#8a4b00'),
    star: new Color('#14163a'),
    nebulaA: new Color('#a3127f'),
    nebulaB: new Color('#00626e'),
    nebula: 0.08,
    background: new Color('#f6f1e7'),
  },
};
