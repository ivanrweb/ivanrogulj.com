export interface TourStep {
  readonly targetSelector: string;
  readonly title: string;
  readonly content: string;
  readonly tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
}
