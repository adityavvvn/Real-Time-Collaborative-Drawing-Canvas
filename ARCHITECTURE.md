# Architecture Documentation

## Overview

This document describes the architecture, data flow, and technical decisions for the Real-Time Collaborative Drawing Canvas application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Browser 1  │  │   Browser 2  │  │   Browser N  │        │
│  │  (User A)    │  │  (User B)    │  │  (User C)    │        │
│  │              │  │              │  │              │        │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │        │
│  │ │  Canvas  │ │  │ │  Canvas  │ │  │ │  Canvas  │ │        │
│  │ │ Manager  │ │  │ │ Manager  │ │  │ │ Manager  │ │        │
│  │ └────┬─────┘ │  │ └────┬─────┘ │  │ └────┬─────┘ │        │
│  │      │       │  │      │       │  │      │       │        │
│  │ ┌────┴─────┐ │  │ ┌────┴─────┐ │  │ ┌────┴─────┐ │        │
│  │ │WebSocket │ │  │ │WebSocket │ │  │ │WebSocket │ │        │
│  │ │  Client  │ │  │ │  Client  │ │  │ │  Client  │ │        │
│  │ └────┬─────┘ │  │ └────┬─────┘ │  │ └────┬─────┘ │        │
│  └──────┼───────┘  └──────┼───────┘  └──────┼───────┘        │
│         │                 │                 │                 │
│         └─────────────────┼─────────────────┘                 │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                    WebSocket (Socket.io)
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                           ▼                                   │
│                    Server Layer                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Express + Socket.io Server                   │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  Event Handlers                                    │  │ │
│  │  │  • draw-start, draw-move, draw-end                 │  │ │
│  │  │  • erase-start, erase-move, erase-end              │  │ │
│  │  │  • undo, redo, clear-canvas                        │  │ │
│  │  │  • cursor-move, join-room                          │  │ │
│  │  └───────────────────┬────────────────────────────────┘  │ │
│  └──────────────────────┼────────────────────────────────────┘ │
│                         │                                      │
│  ┌──────────────────────┴────────────────────────────────────┐ │
│  │              Room Manager                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Room Storage: Map<roomId, DrawingState>             │ │ │
│  │  │  User Tracking: Map<userId, roomId>                  │ │ │
│  │  │  • joinRoom(roomId, userId)                          │ │ │
│  │  │  • leaveRoom(userId)                                 │ │ │
│  │  │  • getRoomState(roomId)                              │ │ │
│  │  └───────────────────┬──────────────────────────────────┘ │ │
│  └──────────────────────┼────────────────────────────────────┘ │
│                         │                                      │
│  ┌──────────────────────┴────────────────────────────────────┐ │
│  │           Drawing State Manager (Per Room)                 │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  • operations: DrawingOperation[]                    │ │ │
│  │  │  • undoStack: DrawingOperation[]                     │ │ │
│  │  │  • addOperation(op)                                  │ │ │
│  │  │  • undo()                                            │ │ │
│  │  │  • redo()                                            │ │ │
│  │  │  • clear()                                           │ │ │
│  │  │  • getStateSnapshot()                                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Drawing Event Flow

```
User Action (Mouse/Touch)
    │
    ▼
┌───────────────────────┐
│  Canvas Manager       │  • Captures drawing events
│  (Client)             │  • Applies to local canvas
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  WebSocket Client     │  • Sends draw events
│  (Socket.io)          │  • Receives remote events
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Socket.io Server     │  • Receives events
│  • Event validation   │  • Room routing
│  • State management   │  • Broadcast to room
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Drawing State        │  • Stores operations
│  • Add operation      │  • Maintains sequence
│  • Update state       │  • Room isolation
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Broadcast to Room    │  • All clients in room
│  • Real-time sync     │  • Event propagation
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Other Clients        │  • Receive events
│  • Render on canvas   │  • Update UI
│  • Show user cursors  │  • Sync state
└───────────────────────┘
```

### State Synchronization Flow

```
New Client Connects
    │
    ▼
┌───────────────────────┐
│  Join Room Request    │  • roomId, userName
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Room Manager         │  • Create/join room
│  • Assign room        │  • Track user
│  • Get room state     │  • User list update
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Drawing State        │  • Get all operations
│  • State snapshot     │  • Current sequence
│  • User list          │  • Room data
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  State Sync Event     │  • Full state transfer
│  • All operations     │  • User information
│  • Sequence numbers   │  • Room metadata
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Client Initialization│  • Clear canvas
│  • Redraw all ops     │  • Render state
│  • Update UI          │  • Join complete
└───────────────────────┘
```

### Key Components

- **Client Layer**: Multiple browser clients with HTML5 Canvas, WebSocket connections, and local state management
  - Canvas Manager handles drawing operations and local rendering
  - WebSocket Client manages real-time communication with the server
  - UI components for tools, colors, and user interface

- **Server Layer**: Express server with Socket.io for WebSocket communication
  - Event handlers process drawing events, undo/redo, and room management
  - Handles client connections and disconnections
  - Manages WebSocket message routing

- **Room Manager**: Handles room isolation, user tracking, and room state management
  - Maintains a map of room IDs to DrawingState instances
  - Tracks which users are in which rooms
  - Creates rooms on-demand when first user joins
  - Manages user join/leave events

- **Drawing State**: Per-room state management with operations array, undo/redo stack, and state snapshots
  - Stores all drawing operations in sequential order
  - Maintains undo stack for redo functionality
  - Provides state snapshots for new client synchronization
  - Ensures room isolation (each room has independent state)

- **Real-time Sync**: Event-based communication for instant collaboration across all clients
  - Broadcasts drawing events to all clients in the same room
  - Synchronizes state changes (undo, redo, clear)
  - Handles cursor movement updates
  - Manages user presence (join/leave notifications)

## WebSocket Protocol

### Client → Server Events

#### `join-room`
```typescript
{
  roomId?: string;      // Optional, defaults to "default"
  userName?: string;    // Optional, auto-generated if not provided
}
```

#### `draw-start`
```typescript
{
  point: { x: number, y: number };
  color: string;
  strokeWidth: number;
}
```

#### `draw-move`
```typescript
{
  point: { x: number, y: number };
  operationId: string;  // ID returned from draw-start
}
```

#### `draw-end`
```typescript
{
  operationId: string;
}
```

#### `erase-start`
```typescript
{
  point: { x: number, y: number };
  strokeWidth: number;
}
```

#### `erase-move`
```typescript
{
  point: { x: number, y: number };
  operationId: string;
}
```

#### `erase-end`
```typescript
{
  operationId: string;
}
```

#### `cursor-move`
```typescript
{
  point: { x: number, y: number };
}
```

#### `undo`
```typescript
// No payload
```

#### `redo`
```typescript
// No payload
```

#### `clear-canvas`
```typescript
// No payload
```

### Server → Client Events

#### `state-sync`
```typescript
{
  operations: DrawingOperation[];
  users: User[];
  sequenceNumber: number;
}
```

#### `draw-start`
```typescript
DrawingOperation & {
  userColor?: string;  // Color assigned to the user
}
```

#### `draw-move`
```typescript
{
  operationId: string;
  point: { x: number, y: number };
}
```

#### `draw-end`
```typescript
{
  operationId: string;
}
```

#### `undo`
```typescript
{
  operationId: string;
  userId: string;
}
```

#### `redo`
```typescript
{
  operation: DrawingOperation;
}
```

#### `user-joined`
```typescript
User
```

#### `user-left`
```typescript
{
  userId: string;
}
```

#### `users-update`
```typescript
User[]
```

#### `cursor-move`
```typescript
{
  userId: string;
  point: { x: number, y: number };
  userColor: string;
}
```

## Undo/Redo Strategy

### Global Undo/Redo Implementation

The undo/redo system is **global** - when one user undoes an operation, it affects all users in the room.

#### How It Works:

1. **Operation Storage**: All drawing operations are stored in a sequential array in `DrawingState`
2. **Undo Stack**: When an operation is undone, it's moved from the operations array to an undo stack
3. **Broadcast**: When a user triggers undo, the server:
   - Removes the last operation from the operations array
   - Broadcasts the undo event to all clients
   - All clients remove that operation from their canvas

4. **Redo**: When redo is triggered:
   - The server moves an operation from the undo stack back to the operations array
   - Broadcasts the operation to all clients
   - All clients redraw that operation

#### Conflict Resolution:

- **Last-Write-Wins**: The most recent operation is always the one that gets undone
- **Sequence Numbers**: Each operation has a sequence number to maintain order
- **User Ownership**: Operations are tagged with userId, but undo affects the last operation regardless of who created it

#### Limitations:

- If two users undo simultaneously, there may be race conditions
- The undo stack is per-room, not per-user
- No per-user undo history

## Performance Decisions

### 1. Canvas Rendering Strategy

**Decision**: Use two separate canvas layers
- `drawingCanvas`: Main drawing layer (z-index: 1)
- `cursorCanvas`: Cursor indicators layer (z-index: 2, pointer-events: none)

**Rationale**: 
- Separating cursors from drawing allows efficient redrawing
- Cursor layer can be cleared and redrawn without affecting the main canvas
- Better performance when many users are moving cursors

### 2. Event Batching

**Decision**: Send individual point events for each mouse move

**Rationale**:
- Provides real-time feel (users see strokes as they're drawn)
- Simpler implementation than batching
- Socket.io handles message queuing automatically

**Trade-off**: Higher network traffic, but acceptable for drawing applications

### 3. State Synchronization

**Decision**: Send full state snapshot to new clients

**Rationale**:
- Ensures new clients have complete canvas state
- Simpler than incremental sync
- Acceptable for typical canvas sizes (operations array)

**Alternative Considered**: Incremental sync with sequence numbers (implemented but not used for initial sync)

### 4. Operation Storage

**Decision**: Store operations as arrays of points in memory

**Rationale**:
- Fast access and rendering
- Simple undo/redo implementation
- Sufficient for real-time collaboration

**Limitation**: Memory usage grows with number of operations (not suitable for very long sessions)

### 5. Path Optimization

**Decision**: Store all mouse move points, no path simplification

**Rationale**:
- Simpler implementation
- Preserves drawing accuracy
- Modern browsers handle many points efficiently

**Alternative Considered**: Bezier curve fitting or point reduction (not implemented)

## Conflict Resolution

### Simultaneous Drawing

**Problem**: Multiple users draw at the same time in overlapping areas

**Solution**: 
- Each operation has a unique ID and sequence number
- Operations are applied in sequence number order
- Canvas rendering uses proper compositing (source-over for draw, destination-out for erase)
- Last operation "wins" visually (standard canvas behavior)

### Undo Conflicts

**Problem**: User A undoes while User B is drawing

**Solution**:
- Undo removes the last operation from the array
- If User B's operation is in progress, it continues
- When User B finishes, their operation is added (may be out of order, but visually correct)

### Network Latency

**Problem**: Network delays cause operations to arrive out of order

**Solution**:
- Operations include sequence numbers
- Server maintains strict order
- Clients apply operations as received (Socket.io ensures message order per connection)

### Client Disconnection

**Problem**: Client disconnects mid-drawing

**Solution**:
- Server removes user on disconnect
- Incomplete operations remain in state (points already sent)
- Other clients see the partial drawing
- No automatic cleanup of incomplete operations

## Room System

### Implementation

- Each room has its own `DrawingState` instance
- Users can join different rooms by specifying a room ID
- Rooms are isolated - operations in one room don't affect others
- Rooms persist until server restart (no automatic cleanup)

### Room Management

```typescript
RoomManager {
  rooms: Map<roomId, DrawingState>
  userToRoom: Map<userId, roomId>
}
```

- Rooms are created on-demand when first user joins
- Users are tracked per room
- Leaving a room removes the user but keeps the room (for persistence)

## Error Handling

### Client-Side

- Connection errors: Status bar shows "Disconnected"
- Missing canvas elements: Throws error on initialization
- WebSocket errors: Logged to console, status updated

### Server-Side

- Invalid events: Ignored (no error thrown)
- Missing operations: Checked before processing
- Room errors: Default room used as fallback

## Security Considerations

### Current Implementation

- **No Authentication**: Anyone can join any room
- **No Input Validation**: Room IDs and user names are not sanitized
- **CORS**: Open to all origins (for development)

### Production Considerations

- Add authentication/authorization
- Validate and sanitize all inputs
- Rate limiting for WebSocket events
- Room access control
- Input size limits

## Scalability

### Current Limitations

- **Memory**: All operations stored in memory (grows with usage)
- **Single Server**: No horizontal scaling
- **No Persistence**: State lost on restart

### Scaling Strategies

1. **Operation Cleanup**: Periodically remove old operations
2. **State Persistence**: Save to database (Redis, MongoDB)
3. **Horizontal Scaling**: Use Redis adapter for Socket.io
4. **Operation Compression**: Compress point arrays
5. **Canvas Snapshots**: Periodically create image snapshots, clear old operations

## Testing Strategy

### Manual Testing

1. Open multiple browser windows
2. Test drawing synchronization
3. Test undo/redo across users
4. Test room isolation
5. Test mobile touch events
6. Test disconnection/reconnection

### Automated Testing (Not Implemented)

- Unit tests for DrawingState
- Integration tests for WebSocket events
- Performance tests for many operations
- Load tests for many concurrent users

## Future Enhancements

1. **Persistence**: Save canvas state to database
2. **Image Export**: Download canvas as PNG/JPG
3. **Shapes**: Add rectangle, circle tools
4. **Text Tool**: Add text input
5. **Layers**: Multiple drawing layers
6. **History**: Per-user undo history
7. **Reconnection**: Automatic reconnection with state sync
8. **Performance**: Operation batching, path optimization
9. **Authentication**: User accounts and room permissions
10. **Analytics**: Track usage, performance metrics

