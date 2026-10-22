let p: Promise<any> | null = null;
export default function lottieLoader() {
  if (!p) p = import("lottie-web/build/player/lottie_light").then((m: any) => m.default || m);
  return p;
}
