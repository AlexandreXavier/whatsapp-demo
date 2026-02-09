export interface Message {
  timestamp: Date;
  sender: string;
  content: string;
  replyTo?: string;
  isSystemMessage: boolean;
}

export interface UserStats {
  name: string;
  messageCount: number;
  repliesReceived: number;
  avgResponseTime: number;
  initiations: number;
  responses: number;
}

export interface HeatmapCell {
  dayOfWeek: number;
  hour: number;
  count: number;
  topUsers: { name: string; count: number }[];
}

export interface FilterState {
  selectedUsers: string[];
}

export interface SummaryData {
  totalMessages: number;
  totalParticipants: number;
  dateRange: { start: Date; end: Date };
  mostActiveDay: { date: Date; count: number };
}

export interface WordFrequency {
  text: string;
  size: number;
  count: number;
}

export interface ParseProgress {
  current: number;
  total: number;
  percentage: number;
}

export interface ResponseTimeData {
  name: string;
  avgTime: number;
  color: string;
}

export interface ThreadFlow {
  source: string;
  target: string;
  value: number;
}
