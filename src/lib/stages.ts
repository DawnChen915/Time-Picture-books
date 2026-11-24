/**
 * "时光" stages: every book belongs to the stage of childhood it is written for, and the bookshelf
 * shows each family's books along the child's own timeline.
 */
export type StageId = "babble" | "curious" | "growing";

export interface Stage {
  id: StageId;
  name: string;
  /** Inclusive age range in whole years. */
  ages: [number, number];
  tagline: string;
}

export const STAGES: Stage[] = [
  { id: "babble", name: "咿呀时光", ages: [0, 3], tagline: "认形状、认颜色，一页一句话，读给小小的你听" },
  { id: "curious", name: "好奇时光", ages: [4, 6], tagline: "小小的探险，大大的心情，主角就是你" },
  { id: "growing", name: "成长时光", ages: [7, 12], tagline: "更长的故事，陪你一起慢慢长大" },
];

export function getStage(id: StageId) {
  return STAGES.find((s) => s.id === id)!;
}

export function stageForAge(age: number): Stage {
  return STAGES.find((s) => age >= s.ages[0] && age <= s.ages[1]) ?? STAGES[STAGES.length - 1];
}

export function stageAgeLabel(stage: Stage) {
  return stage.ages[1] >= 12 ? `${stage.ages[0]} 岁以上` : `${stage.ages[0]}–${stage.ages[1]} 岁`;
}

export function ageLabel(age: number) {
  return age === 0 ? "不满 1 岁" : `${age} 岁`;
}

export function rangeLabel([min, max]: [number, number]) {
  return min === max ? `${min} 岁` : `${min}–${max} 岁`;
}
