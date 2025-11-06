/**
 * Room Management
 * Handles multiple isolated canvas rooms
 */

import { DrawingState, User } from './drawing-state';

export class RoomManager {
  private rooms: Map<string, DrawingState> = new Map();
  private userToRoom: Map<string, string> = new Map();

  /**
   * Get or create a room
   */
  getRoom(roomId: string): DrawingState {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new DrawingState());
    }
    return this.rooms.get(roomId)!;
  }

  /**
   * Join a user to a room
   */
  joinRoom(userId: string, roomId: string, userName: string, userColor: string): User {
    const room = this.getRoom(roomId);
    this.userToRoom.set(userId, roomId);
    return room.addUser(userId, userName, userColor);
  }

  /**
   * Remove a user from their room
   */
  leaveRoom(userId: string): void {
    const roomId = this.userToRoom.get(userId);
    if (roomId) {
      const room = this.getRoom(roomId);
      room.removeUser(userId);
      this.userToRoom.delete(userId);

      // Clean up empty rooms (optional - you might want to keep them)
      // if (room.getUsers().length === 0) {
      //   this.rooms.delete(roomId);
      // }
    }
  }

  /**
   * Get the room ID for a user
   */
  getUserRoom(userId: string): string | undefined {
    return this.userToRoom.get(userId);
  }

  /**
   * Get all rooms (for admin/debugging)
   */
  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}

