/**
 * WebSocket Server
 * Handles real-time communication for collaborative drawing
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { RoomManager } from './rooms';
import { DrawingOperation, Point, User } from '../shared/types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();
const PORT = process.env.PORT || 3000;

// Serve static files from client directory (for development)
// In production, serve from dist/client after compilation
app.use(express.static('client'));
app.use(express.static('dist/client'));
app.use(express.static('dist/shared'));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'client' }, (err) => {
    if (err) {
      res.sendFile('index.html', { root: 'dist/client' });
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  let currentRoomId: string = 'default';
  let currentUserId: string = socket.id;

  // Generate a random color for the user
  const userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80'
  ];
  const userColor = userColors[Math.floor(Math.random() * userColors.length)];

  // Join room
  socket.on('join-room', (data: { roomId?: string; userName?: string }) => {
    currentRoomId = data.roomId || 'default';
    const userName = data.userName || `User ${socket.id.slice(0, 6)}`;
    
    const room = roomManager.getRoom(currentRoomId);
    const user = roomManager.joinRoom(currentUserId, currentRoomId, userName, userColor);

    socket.join(currentRoomId);

    // Send current state to the new user
    const state = room.getStateSnapshot();
    socket.emit('state-sync', state);

    // Notify others in the room
    socket.to(currentRoomId).emit('user-joined', user);

    // Send list of current users to all in room
    const users = room.getUsers();
    socket.emit('users-update', users);
    socket.to(currentRoomId).emit('users-update', users);

    console.log(`User ${socket.id} joined room ${currentRoomId}`);
  });

  // Handle user list request
  socket.on('request-users', () => {
    const room = roomManager.getRoom(currentRoomId);
    const users = room.getUsers();
    socket.emit('users-list', users);
  });

  // Handle drawing operations
  socket.on('draw-start', (data: { point: Point; color: string; strokeWidth: number; operationId?: string }) => {
    const room = roomManager.getRoom(currentRoomId);
    const operation = room.addOperation({
      id: data.operationId, // Use client's operation ID if provided
      userId: currentUserId,
      type: 'draw',
      color: data.color,
      strokeWidth: data.strokeWidth,
      points: [data.point],
      timestamp: Date.now(),
    });

    // Broadcast to others in the room (but not to sender - they already have it locally)
    socket.to(currentRoomId).emit('draw-start', {
      ...operation,
      userColor: room.getUser(currentUserId)?.color,
    });
  });

  socket.on('draw-move', (data: { point: Point; operationId: string }) => {
    const room = roomManager.getRoom(currentRoomId);
    const operations = room.getOperations();
    const operation = operations.find(op => op.id === data.operationId);

    if (operation && operation.userId === currentUserId) {
      operation.points.push(data.point);
      socket.to(currentRoomId).emit('draw-move', {
        operationId: data.operationId,
        point: data.point,
      });
    }
  });

  socket.on('draw-end', (data: { operationId: string }) => {
    const room = roomManager.getRoom(currentRoomId);
    const operations = room.getOperations();
    const operation = operations.find(op => op.id === data.operationId);

    if (operation && operation.userId === currentUserId) {
      socket.to(currentRoomId).emit('draw-end', {
        operationId: data.operationId,
      });
    }
  });

  // Handle eraser operations
  socket.on('erase-start', (data: { point: Point; strokeWidth: number; operationId?: string }) => {
    const room = roomManager.getRoom(currentRoomId);
    const operation = room.addOperation({
      id: data.operationId, // Use client's operation ID if provided
      userId: currentUserId,
      type: 'erase',
      strokeWidth: data.strokeWidth,
      points: [data.point],
      timestamp: Date.now(),
    });

    socket.to(currentRoomId).emit('erase-start', {
      ...operation,
      userColor: room.getUser(currentUserId)?.color,
    });
  });

  socket.on('erase-move', (data: { point: Point; operationId: string }) => {
    const room = roomManager.getRoom(currentRoomId);
    const operations = room.getOperations();
    const operation = operations.find(op => op.id === data.operationId);

    if (operation && operation.userId === currentUserId) {
      operation.points.push(data.point);
      socket.to(currentRoomId).emit('erase-move', {
        operationId: data.operationId,
        point: data.point,
      });
    }
  });

  socket.on('erase-end', (data: { operationId: string }) => {
    const room = roomManager.getRoom(currentRoomId);
    const operations = room.getOperations();
    const operation = operations.find(op => op.id === data.operationId);

    if (operation && operation.userId === currentUserId) {
      socket.to(currentRoomId).emit('erase-end', {
        operationId: data.operationId,
      });
    }
  });

  // Handle cursor movement
  socket.on('cursor-move', (data: { point: Point }) => {
    const room = roomManager.getRoom(currentRoomId);
    room.updateUserCursor(currentUserId, data.point);
    
    socket.to(currentRoomId).emit('cursor-move', {
      userId: currentUserId,
      point: data.point,
      userColor: room.getUser(currentUserId)?.color,
    });
  });

  // Handle undo/redo
  socket.on('undo', () => {
    const room = roomManager.getRoom(currentRoomId);
    const undoneOp = room.undo();

    if (undoneOp) {
      // Broadcast undo to all clients
      io.to(currentRoomId).emit('undo', {
        operationId: undoneOp.id,
        userId: undoneOp.userId,
      });
    }
  });

  socket.on('redo', () => {
    const room = roomManager.getRoom(currentRoomId);
    const redoneOp = room.redo();

    if (redoneOp) {
      // Broadcast redo to all clients
      io.to(currentRoomId).emit('redo', {
        operation: redoneOp,
      });
    }
  });

  // Handle clear canvas
  socket.on('clear-canvas', () => {
    const room = roomManager.getRoom(currentRoomId);
    room.clear();
    io.to(currentRoomId).emit('clear-canvas');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const room = roomManager.getRoom(currentRoomId);
    room.setUserInactive(currentUserId);
    
    socket.to(currentRoomId).emit('user-left', { userId: currentUserId });
    roomManager.leaveRoom(currentUserId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

