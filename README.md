# Real-Time Collaborative Drawing Canvas

A modern, feature-rich multi-user drawing application where multiple people can draw simultaneously on the same canvas with real-time synchronization. Built with TypeScript, Socket.io, and HTML5 Canvas.

## ✨ Key Features

- 🎨 **Real-time Collaborative Drawing** - Multiple users drawing simultaneously with instant synchronization
- 🌓 **Dark Mode** - Toggle between light and dark themes for comfortable drawing
- 💾 **Export Functionality** - Save your artwork as PNG images
- 🔗 **Room Sharing** - Share room links to invite others to collaborate
- ⌨️ **Keyboard Shortcuts** - Powerful keyboard shortcuts for quick tool switching
- 📱 **Mobile Support** - Full touch support for drawing on mobile devices
- 👥 **User Management** - See who's online with color-coded user indicators
- 🎯 **Smart Input Handling** - Keyboard shortcuts don't interfere with text input

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Real-Time Collaborative Drawing Canvas"
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## 🌐 Live Deployment

The application is deployed and available at:

- **Render**: [https://real-time-collaborative-drawing-canvas.onrender.com](https://real-time-collaborative-drawing-canvas.onrender.com)
- **Railway**: [https://collaborative-canvas-production-c386.up.railway.app/](https://collaborative-canvas-production-c386.up.railway.app/)

Try it out with multiple browser tabs or devices to see real-time collaboration in action!

## 🎨 Complete Feature List

### Drawing Tools

#### Core Drawing Features
- **Brush Tool** 🖌️ - Draw with customizable colors and stroke width
  - Color picker for choosing any color
  - 8-color palette for quick color selection
  - Adjustable stroke width (1-50 pixels)
  - Real-time brush preview

- **Eraser Tool** 🧹 - Erase parts of the drawing
  - Same stroke width control as brush
  - Smooth erasing with proper compositing

#### Canvas Operations
- **Undo** ↶ - Undo last drawing operation (global, affects all users)
- **Redo** ↷ - Redo last undone operation (global, affects all users)
- **Clear Canvas** 🗑️ - Clear the entire canvas (affects all users)
- **Export Canvas** 💾 - Export canvas as PNG image (Ctrl+S)
  - Automatic file naming with timestamp
  - High-quality PNG export

### Real-time Collaboration

- **Live Drawing Synchronization** - See other users' strokes as they draw in real-time
- **User Cursors** - Visual indicators showing where other users are pointing
- **User List** - See who's online with:
  - Color-coded user badges
  - Auto-refresh every 3 seconds
  - Manual refresh button
  - User join/leave notifications

- **Room System** 🚪 - Multiple isolated canvases (rooms)
  - Create or join rooms with custom IDs
  - Room isolation (separate canvases per room)
  - Share room links to invite others
  - URL parameter support (`?room=room-id`)
  - Automatic room joining on connection

### User Interface Features

- **Dark Mode** 🌙 - Toggle between light and dark themes
  - Persistent preference (saved in localStorage)
  - Smooth theme transitions
  - Optimized for both light and dark environments

- **Username Management** 👤
  - Username modal on first visit
  - Change username anytime (✏️ button)
  - Username suggestions (Artist, Creator, Designer, Sketch)
  - Username persistence (auto-saved in localStorage)
  - Username validation (max 20 characters)
  - Visual feedback on username changes

- **Toast Notifications** 🔔
  - Success notifications (green)
  - Error notifications (red)
  - Info notifications (blue)
  - Auto-dismiss after 3 seconds
  - Smooth animations

- **Status Bar** 📊
  - Connection status indicator (Connected/Disconnected)
  - Stroke count display
  - FPS counter for performance monitoring
  - Keyboard shortcuts hint

### Keyboard Shortcuts

All shortcuts are available when not typing in input fields:

- **B** - Switch to Brush Tool
- **E** - Switch to Eraser Tool
- **D** - Toggle Dark Mode
- **Ctrl+Z** / **Cmd+Z** - Undo
- **Ctrl+Y** / **Cmd+Y** - Redo
- **Ctrl+S** / **Cmd+S** - Export Canvas
- **Ctrl+K** / **Cmd+K** - Clear Canvas
- **?** - Show Keyboard Shortcuts Modal

**Note**: Keyboard shortcuts are automatically disabled when typing in input fields (username, room ID) to prevent interference.

### Advanced Features

- **State Synchronization** - New users receive full canvas state when joining
- **Conflict Resolution** - Handles simultaneous drawing operations gracefully
- **Performance Optimization** - Efficient rendering with FPS monitoring
- **Mobile Support** 📱 - Full touch event support for drawing on mobile devices
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Connection Status** - Real-time connection status display
- **Auto-reconnection** - Automatic reconnection with username preservation
- **Room Persistence** - Maintains current room when changing username

## 🧪 Testing with Multiple Users

1. **Open the application** in your browser: `http://localhost:3000`

2. **Set a username** - Choose a username or use a suggested one

3. **Open multiple browser windows/tabs** or use different devices on the same network

4. **Join the same room** (default room is "default", or enter a custom room ID)

5. **Start drawing** - you should see:
   - Your drawings appear in real-time
   - Other users' drawings appear as they draw
   - Cursor positions of other users
   - User list showing who's online
   - Toast notifications for user joins/leaves

6. **Test features**:
   - Switch between brush and eraser tools (B/E keys or buttons)
   - Change colors using color picker or palette
   - Adjust stroke width with the slider
   - Try undo/redo (Ctrl+Z/Ctrl+Y or buttons)
   - Clear canvas (Ctrl+K or button)
   - Export canvas (Ctrl+S or button)
   - Toggle dark mode (D key or button)
   - Share room link (🔗 button)
   - Change username (✏️ button)
   - Join different rooms to test isolation
   - Test keyboard shortcuts (press ? to see all)

## 📁 Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html          # Main HTML file with UI
│   ├── style.css           # Styles and dark mode
│   ├── main.ts             # App initialization and event handlers
│   ├── canvas.ts           # Canvas drawing logic
│   ├── websocket.ts        # WebSocket client communication
│   └── utils.ts            # Utility functions (Toast, export, clipboard)
├── server/
│   ├── server.ts           # Express + WebSocket server
│   ├── rooms.ts            # Room management and isolation
│   └── drawing-state.ts    # Canvas state management
├── shared/
│   └── types.ts            # Shared TypeScript types
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json           # Server TypeScript config
├── tsconfig.client.json    # Client TypeScript config
├── README.md
├── ARCHITECTURE.md         # Detailed architecture documentation
├── DEPLOYMENT.md           # Deployment instructions
└── TROUBLESHOOTING.md      # Troubleshooting guide
```

## 🔧 Technical Stack

- **Frontend**: 
  - Vanilla TypeScript (no frameworks)
  - HTML5 Canvas for drawing
  - Modern CSS with dark mode support
  - Responsive design
  
- **Backend**: 
  - Node.js + Express
  - Socket.io for WebSocket communication
  - TypeScript for type safety
  
- **Real-time Communication**: 
  - WebSockets (Socket.io)
  - Event-based architecture
  - State synchronization

## 🏗️ Architecture

### System Architecture

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

### Data Flow

#### Drawing Event Flow

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

#### State Synchronization Flow

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
- **Server Layer**: Express server with Socket.io for WebSocket communication
- **Room Manager**: Handles room isolation, user tracking, and room state management
- **Drawing State**: Per-room state management with operations array, undo/redo stack, and state snapshots
- **Real-time Sync**: Event-based communication for instant collaboration across all clients

## 📝 Recent Changes & Improvements

### Version 1.0.0 (Current)

- ✅ **Fixed keyboard shortcut interference** - Shortcuts no longer interfere with text input in username and room fields
- ✅ **Fixed change username functionality** - Change username button now works correctly even after initial setup
- ✅ **Improved username management** - Username changes properly reconnect with room preservation
- ✅ **Enhanced WebSocket handling** - Prevented duplicate connections, improved reconnection logic
- ✅ **Added comprehensive features**:
  - Dark mode with persistent preference
  - Canvas export functionality
  - Room link sharing
  - Keyboard shortcuts with modal
  - Color palette for quick color selection
  - Toast notifications system
  - FPS monitoring
  - User list with auto-refresh
  - Connection status indicators

## ⚠️ Known Limitations

1. **No Persistence**: Canvas state is not saved to disk. All drawings are lost when the server restarts.

2. **No Authentication**: Users are identified by socket ID and username only. No user accounts or authentication system.

3. **Limited Scalability**: The current implementation stores all operations in memory. For many users or very long sessions, this could consume significant memory.

4. **Browser Compatibility**: Requires modern browsers with ES2020 support and WebSocket support (Chrome, Firefox, Safari, Edge).

5. **Network Issues**: Basic reconnection handling. If connection is lost, the app will attempt to reconnect, but users may need to refresh the page in some cases.

## 🐛 Known Issues

1. **Cursor Position**: Cursor indicators may not update smoothly on very fast mouse movements.

2. **Touch Drawing**: Touch drawing on mobile devices may have slight lag compared to mouse input due to touch event processing.

3. **Undo/Redo Conflicts**: In rare cases with very fast operations, undo/redo may not sync perfectly across all clients.

## 🔮 Future Enhancements

- [ ] Canvas persistence (save/load drawings)
- [ ] User authentication and accounts
- [ ] Drawing history timeline
- [ ] More drawing tools (shapes, text, images)
- [ ] Layer support
- [ ] Drawing templates
- [ ] Collaborative cursors with names
- [ ] Chat functionality
- [ ] Drawing permissions (view-only, draw-only, admin)
- [ ] Export in multiple formats (SVG, PDF, JPG)

## 📚 Documentation

- **ARCHITECTURE.md** - Detailed architecture and design decisions
- **README.md** - Readme file about this project


## ⏱️ Development Time

- **Initial Setup**: 1 hour
- **Backend Development**: 3 hours
- **Frontend Development**: 4 hours
- **Real-time Synchronization**: 2 hours
- **Undo/Redo Implementation**: 2 hours
- **UI/UX Enhancements**: 3 hours
- **Dark Mode & Export**: 2 hours
- **Keyboard Shortcuts & Features**: 2 hours
- **Testing & Bug Fixes**: 3 hours
- **Documentation**: 2 hours

**Total**: ~24 hours

