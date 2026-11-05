import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { SRGBColorSpace, TextureLoader, type Texture } from 'three';

export type Tier = 'hd' | 'sd';

/** Texture URL for a tier (credits: public/textures/CREDITS.md). */
export const textureUrl = (tier: Tier, name: string) => `/textures/${tier}/${name}.webp`;

function prepare(texture: Texture, name: string, anisotropy: number) {
  if (!name.endsWith('clouds')) texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(8, anisotropy);
  return texture;
}

/**
 * Progressive textures: suspends on the light "sd" set (2k, fast), then, on the "hd" tier,
 * streams the high-resolution set in the background and swaps it in when ready.
 */
export function useColorTextures<T extends string>(
  tier: Tier,
  names: readonly T[],
): Record<T, Texture> {
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const maxSize = useThree((state) => state.gl.capabilities.maxTextureSize);
  const low = useTexture(names.map((name) => textureUrl('sd', name))) as Texture[];
  const [high, setHigh] = useState<Texture[] | null>(null);
  const key = names.join();

  useEffect(() => {
    // 8k maps need an 8k-capable GPU; otherwise the light set stays.
    if (tier !== 'hd' || maxSize < 8192) return;
    let cancelled = false;
    const loader = new TextureLoader();
    Promise.all(names.map((name) => loader.loadAsync(textureUrl('hd', name))))
      .then((textures) => {
        if (cancelled) textures.forEach((t) => t.dispose());
        else setHigh(textures);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // `key` stands for `names`.
  }, [tier, maxSize, key]);

  const result = {} as Record<T, Texture>;
  names.forEach((name, i) => {
    result[name] = prepare((high ?? low)[i], name, anisotropy);
  });
  return result;
}
