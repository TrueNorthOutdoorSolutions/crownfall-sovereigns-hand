/** All match randomness is explicit and reproducible, independent of rendering. */
export function random(seed: number): [number, number] {
  let x = seed | 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return [(x >>> 0) / 4294967296, x >>> 0];
}
export function shuffle<T>(values: T[], seed: number): [T[], number] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const [value, next] = random(seed); seed = next;
    const j = Math.floor(value * (i + 1)); [result[i], result[j]] = [result[j], result[i]];
  }
  return [result, seed];
}
