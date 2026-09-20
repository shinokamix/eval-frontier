interface ScatterPoint {
  readonly id: string;
  readonly model: string;
  readonly effort: string | null;
  readonly harness: string;
  readonly efficiency: number;
  readonly quality: number;
}

export type { ScatterPoint };
