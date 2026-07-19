export type MotionPolicyInput = {
  width: number;
  reducedMotion: boolean;
};

export function getMotionPolicy({ width, reducedMotion }: MotionPolicyInput) {
  if (reducedMotion) {
    return {
      reveal: false,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    } as const;
  }

  if (width < 768) {
    return {
      reveal: false,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    } as const;
  }

  return {
    reveal: true,
    pinDecisionSpine: true,
    scrubDecisionSpine: true,
  } as const;
}
