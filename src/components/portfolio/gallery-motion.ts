export type GalleryMotionPolicyInput = {
  width: number;
  reducedMotion: boolean;
};

export function getGalleryMotionPolicy({
  width,
  reducedMotion,
}: GalleryMotionPolicyInput) {
  const enhanced = width >= 768 && !reducedMotion;

  return {
    fan: enhanced,
    hover: enhanced,
    flip: enhanced,
  } as const;
}
