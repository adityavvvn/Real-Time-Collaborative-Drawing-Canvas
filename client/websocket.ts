/**
 * WebSocket Client
 * Handles real-time communication with the server
 */

// Socket.io client is loaded via script tag in HTML
declare const io: any;

import { DrawingOperation, Point } from '../shared/types.js';
import { CanvasManager } from './canvas.js';

export class WebSocketClient {
  private socket: any = null;
  private canvasManager: CanvasManager;
  private currentOperationId: string | null = null;
  private isConnected: boolean = false;
  private currentUsername: string = '';

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
  }

  /**
   * Set the current username
   */
  setUsername(username: string): void {
    this.currentUsername = username;
  }

  /**
   * Connect to the server
   */
  connect(serverUrl: string = window.location.origin): void {
    // Check if io is available (loaded from script tag)
    if (typeof io === 'undefined') {
      console.error('Socket.io client library not loaded. Make sure /socket.io/socket.io.js is accessible.');
      this.updateStatus('Socket.io not loaded', false);
      return;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) {
      console.error('Socket is null, cannot setup event listeners');
      return;
    }

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.isConnected = true;
      this.updateStatus('Connected', true);
      // Join default room with username
      this.joinRoom('default', this.currentUsername);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.updateStatus('Disconnected', false);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.updateStatus('Connection Error', false);
    });

    // State synchronization
    this.socket.on('state-sync', (data: {
      operations: DrawingOperation[];
      users: any[];
      sequenceNumber: number;
    }) => {
      console.log('Received state sync', data);
      // Clear current canvas and redraw all operations
      this.canvasManager.clear();
      for (const operation of data.operations) {
        this.canvasManager.drawRemoteOperation(operation);
      }
    });

    // Drawing events
    this.socket.on('draw-start', (data: DrawingOperation & { userColor?: string }) => {
      if (data.id !== this.currentOperationId) {
        this.canvasManager.drawRemoteOperation(data, data.userColor);
      }
    });

    this.socket.on('draw-move', (data: { operationId: string; point: Point }) => {
      this.canvasManager.addPointToOperation(data.operationId, data.point);
    });

    this.socket.on('draw-end', (data: { operationId: string }) => {
      // Operation complete
    });

    // Eraser events
    this.socket.on('erase-start', (data: DrawingOperation & { userColor?: string }) => {
      if (data.id !== this.currentOperationId) {
        this.canvasManager.drawRemoteOperation(data, data.userColor);
      }
    });

    this.socket.on('erase-move', (data: { operationId: string; point: Point }) => {
      this.canvasManager.addPointToOperation(data.operationId, data.point);
    });

    this.socket.on('erase-end', (data: { operationId: string }) => {
      // Operation complete
    });

    // Cursor movement
    this.socket.on('cursor-move', (data: {
      userId: string;
      point: Point;
      userColor: string;
    }) => {
      this.canvasManager.updateUserCursor(data.userId, data.point, data.userColor);
    });

    // Undo/Redo
    this.socket.on('undo', (data: { operationId: string; userId: string }) => {
      this.canvasManager.removeOperation(data.operationId);
    });

    this.socket.on('redo', (data: { operation: DrawingOperation }) => {
      this.canvasManager.drawRemoteOperation(data.operation);
    });

    // Clear canvas
    this.socket.on('clear-canvas', () => {
      this.canvasManager.clear();
    });

    // User management
    this.socket.on('user-joined', (user: any) => {
      console.log('User joined:', user);
      this.updateUserList();
    });

    this.socket.on('user-left', (data: { userId: string }) => {
      console.log('User left:', data.userId);
      this.canvasManager.removeUserCursor(data.userId);
      this.updateUserList();
    });

    this.socket.on('users-update', (users: any[]) => {
      this.updateUserList(users);
    });
  }

  /**
   * Join a room
   */
  joinRoom(roomId: string, userName?: string): void {
    if (!this.socket) return;
    this.socket.emit('join-room', { roomId, userName });
  }

  /**
   * Send drawing start event
   */
  sendDrawStart(point: Point, color: string, strokeWidth: number, operationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('draw-start', { point, color, strokeWidth, operationId });
  }

  /**
   * Send drawing move event
   */
  sendDrawMove(point: Point, operationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('draw-move', { point, operationId });
  }

  /**
   * Send drawing end event
   */
  sendDrawEnd(operationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('draw-end', { operationId });
    this.currentOperationId = null;
  }

  /**
   * Send eraser start event
   */
  sendEraseStart(point: Point, strokeWidth: number, operationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('erase-start', { point, strokeWidth, operationId });
  }

  /**
   * Send eraser move event
   */
  sendEraseMove(point: Point, operationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('erase-move', { point, operationId });
  }

  /**
   * Send eraser end event
   */
  sendEraseEnd(operationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('erase-end', { operationId });
    this.currentOperationId = null;
  }

  /**
   * Send cursor movement
   */
  sendCursorMove(point: Point): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('cursor-move', { point });
  }

  /**
   * Send undo request
   */
  sendUndo(): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('undo');
  }

  /**
   * Send redo request
   */
  sendRedo(): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('redo');
  }

  /**
   * Send clear canvas request
   */
  sendClearCanvas(): void {
    if (!this.socket || !this.isConnected) return;
    if (confirm('Are you sure you want to clear the canvas? This will affect all users.')) {
      this.socket.emit('clear-canvas');
    }
  }

  /**
   * Set current operation ID
   */
  setCurrentOperationId(id: string): void {
    this.currentOperationId = id;
  }

  /**
   * Update status text
   */
  private updateStatus(text: string, connected: boolean): void {
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
      statusElement.textContent = text;
      statusElement.className = connected ? 'connected' : 'disconnected';
    }
  }

  /**
   * Update user list display
   */
  private updateUserList(users?: any[]): void {
    const userListElement = document.getElementById('userList');
    if (!userListElement) return;

    // If users not provided, we'll need to get them from the server
    // For now, we'll just show a placeholder
    if (!users) {
      return;
    }

    // Clear existing badges (except label)
    const label = userListElement.querySelector('.label');
    userListElement.innerHTML = '';
    if (label) {
      userListElement.appendChild(label);
    } else {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'label';
      labelSpan.textContent = 'Online Users:';
      userListElement.appendChild(labelSpan);
    }

    // Add user badges
    for (const user of users) {
      const badge = document.createElement('div');
      badge.className = 'user-badge';
      badge.innerHTML = `
        <span class="color-dot" style="background-color: ${user.color}"></span>
        <span>${user.name}</span>
      `;
      userListElement.appendChild(badge);
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

