import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, type Texture } from 'three';

export type Tier = 'hd' | 'sd';

/** Texture URL for a tier (Solar System Scope, CC BY 4.0, see public/textures/CREDITS.md). */
export const textureUrl = (tier: Tier, name: string) => `/textures/${tier}/${name}.webp`;

/** Loads colour textures (sRGB, max anisotropy). Suspends until ready. */
export function useColorTextures<T extends string>(
  tier: Tier,
  names: readonly T[],
): Record<T, Texture> {
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const loaded = useTexture(names.map((name) => textureUrl(tier, name))) as Texture[];
  const result = {} as Record<T, Texture>;
  names.forEach((name, i) => {
    const texture = loaded[i];
    if (!name.endsWith('clouds')) texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, anisotropy);
    result[name] = texture;
  });
  return result;
}
