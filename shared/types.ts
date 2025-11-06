/**
 * Shared Types
 * Types used by both client and server
 */

export interface Point {
  x: number;
  y: number;
}

export interface DrawingOperation {
  id: string;
  userId: string;
  type: 'draw' | 'erase' | 'clear';
  color?: string;
  strokeWidth?: number;
  points: Point[];
  timestamp: number;
  sequenceNumber: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
  cursorPosition?: Point;
  isActive: boolean;
}

