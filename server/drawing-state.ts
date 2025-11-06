/**
 * Drawing State Management
 * Handles canvas state, operation history, and conflict resolution
 */

import { v4 as uuidv4 } from 'uuid';
import { Point, DrawingOperation, User } from '../shared/types';

export { Point, DrawingOperation, User };

export class DrawingState {
  private operations: DrawingOperation[] = [];
  private users: Map<string, User> = new Map();
  private sequenceCounter: number = 0;
  private undoStack: DrawingOperation[] = [];
  private redoStack: DrawingOperation[] = [];

  /**
   * Add a new drawing operation
   */
  addOperation(operation: Omit<DrawingOperation, 'id' | 'sequenceNumber'> & { id?: string }): DrawingOperation {
    const fullOperation: DrawingOperation = {
      ...operation,
      id: operation.id || uuidv4(),
      sequenceNumber: this.sequenceCounter++,
    };

    this.operations.push(fullOperation);
    this.redoStack = []; // Clear redo stack when new operation is added

    return fullOperation;
  }

  /**
   * Get all operations
   */
  getOperations(): DrawingOperation[] {
    return [...this.operations];
  }

  /**
   * Get operations since a specific sequence number (for incremental sync)
   */
  getOperationsSince(sequenceNumber: number): DrawingOperation[] {
    return this.operations.filter(op => op.sequenceNumber > sequenceNumber);
  }

  /**
   * Undo the last operation
   */
  undo(): DrawingOperation | null {
    if (this.operations.length === 0) {
      return null;
    }

    const lastOp = this.operations.pop()!;
    this.undoStack.push(lastOp);
    return lastOp;
  }

  /**
   * Redo the last undone operation
   */
  redo(): DrawingOperation | null {
    if (this.undoStack.length === 0) {
      return null;
    }

    const op = this.undoStack.pop()!;
    this.operations.push(op);
    return op;
  }

  /**
   * Remove a specific operation (for conflict resolution)
   */
  removeOperation(operationId: string): boolean {
    const index = this.operations.findIndex(op => op.id === operationId);
    if (index !== -1) {
      const removed = this.operations.splice(index, 1)[0];
      this.undoStack.push(removed);
      return true;
    }
    return false;
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.operations = [];
    this.undoStack = [];
    this.redoStack = [];
    this.sequenceCounter = 0;
  }

  /**
   * User management
   */
  addUser(userId: string, name: string, color: string): User {
    const user: User = {
      id: userId,
      name,
      color,
      isActive: true,
    };
    this.users.set(userId, user);
    return user;
  }

  removeUser(userId: string): boolean {
    return this.users.delete(userId);
  }

  updateUserCursor(userId: string, position: Point): void {
    const user = this.users.get(userId);
    if (user) {
      user.cursorPosition = position;
      user.isActive = true;
    }
  }

  setUserInactive(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.isActive = false;
    }
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get current state snapshot for new clients
   */
  getStateSnapshot(): {
    operations: DrawingOperation[];
    users: User[];
    sequenceNumber: number;
  } {
    return {
      operations: [...this.operations],
      users: this.getUsers(),
      sequenceNumber: this.sequenceCounter,
    };
  }
}

