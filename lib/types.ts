export const PIPELINE_STATUSES = ['Passed', 'Cold', 'Active', 'Hot', 'Closed'] as const;

export type PipelineStatus = typeof PIPELINE_STATUSES[number] | null;

export interface Target {
  id: number;
  name: string;
  description: string;
  pipelineStatus: PipelineStatus;
  markets: string[];
  lastUpdated: string;
}
