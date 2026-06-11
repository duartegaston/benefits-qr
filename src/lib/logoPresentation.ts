export function getContainedLogoPaddingClass(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return "p-1";
  }

  const ratio = width / height;
  const normalizedRatio = ratio >= 1 ? ratio : 1 / ratio;

  if (normalizedRatio < 1.08) {
    return "p-0.5";
  }

  if (normalizedRatio < 1.35) {
    return "p-1";
  }

  if (normalizedRatio < 1.8) {
    return "p-1.5";
  }

  return "p-2";
}
