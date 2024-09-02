export interface Filter {
  id: string;
  type: BiquadFilterType;
  frequency: number;
  Q?: number;
  node: BiquadFilterNode;
}
