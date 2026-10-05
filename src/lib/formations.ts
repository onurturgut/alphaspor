export const formationIds = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "3-4-2-1",
  "3-5-2",
  "5-3-2",
] as const;

export type FormationId = (typeof formationIds)[number];

export type FormationSlot = {
  id: string;
  label: string;
  x: number;
  y: number;
};

const slot = (
  id: string,
  label: string,
  x: number,
  y: number,
): FormationSlot => ({
  id,
  label,
  x,
  y,
});

export const formations: Record<FormationId, FormationSlot[]> = {
  "4-3-3": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("lcm", "OS", 25, 49),
    slot("cm", "OS", 50, 56),
    slot("rcm", "OS", 75, 49),
    slot("lw", "SLA", 18, 25),
    slot("st", "SNT", 50, 18),
    slot("rw", "SĞA", 82, 25),
  ],
  "4-2-3-1": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("ldm", "DOS", 35, 56),
    slot("rdm", "DOS", 65, 56),
    slot("lw", "SLA", 18, 34),
    slot("am", "OOS", 50, 36),
    slot("rw", "SĞA", 82, 34),
    slot("st", "SNT", 50, 16),
  ],
  "4-4-2": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("lm", "SLO", 15, 48),
    slot("lcm", "OS", 39, 52),
    slot("rcm", "OS", 61, 52),
    slot("rm", "SĞO", 85, 48),
    slot("lst", "F", 38, 21),
    slot("rst", "F", 62, 21),
  ],
  "3-4-2-1": [
    slot("gk", "KL", 50, 88),
    slot("lcb", "STP", 24, 72),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 76, 72),
    slot("lwb", "SLK", 13, 50),
    slot("lcm", "OS", 39, 55),
    slot("rcm", "OS", 61, 55),
    slot("rwb", "SĞK", 87, 50),
    slot("lam", "OOS", 34, 33),
    slot("ram", "OOS", 66, 33),
    slot("st", "SNT", 50, 14),
  ],
  "3-5-2": [
    slot("gk", "KL", 50, 88),
    slot("lcb", "STP", 24, 72),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 76, 72),
    slot("lwb", "SLK", 12, 48),
    slot("lcm", "OS", 34, 54),
    slot("cm", "OS", 50, 43),
    slot("rcm", "OS", 66, 54),
    slot("rwb", "SĞK", 88, 48),
    slot("lst", "F", 38, 20),
    slot("rst", "F", 62, 20),
  ],
  "5-3-2": [
    slot("gk", "KL", 50, 88),
    slot("lwb", "SLB", 10, 65),
    slot("lcb", "STP", 30, 73),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 70, 73),
    slot("rwb", "SĞB", 90, 65),
    slot("lcm", "OS", 28, 47),
    slot("cm", "OS", 50, 54),
    slot("rcm", "OS", 72, 47),
    slot("lst", "F", 38, 20),
    slot("rst", "F", 62, 20),
  ],
};

export function isFormationId(value: string | undefined): value is FormationId {
  return formationIds.includes(value as FormationId);
}

export function formationSlots(value: string | undefined) {
  return formations[isFormationId(value) ? value : "4-3-3"];
}

/**
 * Project top-down tactical coordinates onto cinematic-pitch.webp.
 *
 * Measured against the 1000 x 1500 source image, the playing-area lines are:
 * - far goal line:  (228, 473) -> (773, 473)
 * - halfway line:   (124, 700) -> (877, 700)
 * - near goal line: (  0,1148) -> (999,1148)
 *
 * The vertical transform is projective rather than linear because the camera
 * looks down the length of the field. The horizontal limits then follow the
 * two touchlines, keeping wide players inside the visible pitch at every row.
 */
export function cinematicPitchPosition(x: number, y: number) {
  const depth = Math.min(1, Math.max(0, y / 100));
  const lateral = Math.min(1, Math.max(0, x / 100));

  // Homography through y=473 (far), y=700 (halfway), and y=1148 (near).
  const imageY = (0.0734 * depth + 0.3153) / (1 - 0.4926 * depth);
  const fieldDepth = (imageY - 473 / 1500) / ((1148 - 473) / 1500);
  const leftTouchline = 228 / 1000 + (0 / 1000 - 228 / 1000) * fieldDepth;
  const rightTouchline = 773 / 1000 + (999 / 1000 - 773 / 1000) * fieldDepth;
  const imageX = leftTouchline + lateral * (rightTouchline - leftTouchline);

  return {
    left: `${imageX * 100}%`,
    top: `${imageY * 100}%`,
  };
}
