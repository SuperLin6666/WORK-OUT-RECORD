
export type WorkoutType = 'RUN' | 'PULL_UP';
export type GripType = 'OVERHAND' | 'UNDERHAND';

export interface WorkoutRecord {
  id: string;
  type: WorkoutType;
  date: string; // ISO String
  startTime: string; // HH:mm format
  durationMinutes: number;
  grip?: GripType;
  reps?: number;
}

export interface WorkoutState {
  timeLeft: number;
  isActive: boolean;
  selectedDuration: number;
}
