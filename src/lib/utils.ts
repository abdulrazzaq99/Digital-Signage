export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function img(seed: string, w = 640, h = 360) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
