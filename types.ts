
export enum ZoneType {
  SAFE = 'Safe Zone',
  HIGH_RISK = 'High Risk Zone',
  UNKNOWN = 'Unknown'
}

export interface DetectionResult {
  workerPresent: boolean;
  helmetPresent: boolean;
  zoneType: ZoneType;
  reasoning: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  timestamp: number;
  message: string;
  severity: 'warning' | 'danger';
  context: string;
}
