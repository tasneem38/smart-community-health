export type AlertRecord = {
  id: string;
  type: string;
  description: string;
  risk: string;
  timestamp: string;
  village?: string;
  read?: number;
};
