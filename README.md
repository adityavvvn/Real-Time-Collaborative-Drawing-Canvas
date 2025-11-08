# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously on the same canvas with real-time synchronization.

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

## 🧪 Testing with Multiple Users

1. **Open the application** in your browser: `http://localhost:3000`

2. **Open multiple browser windows/tabs** or use different devices on the same network

3. **Join the same room** (default room is "default", or enter a custom room ID)

4. **Start drawing** - you should see:
   - Your drawings appear in real-time
   - Other users' drawings appear as they draw
   - Cursor positions of other users
   - User list showing who's online

5. **Test features**:
   - Switch between brush and eraser tools
   - Change colors and stroke width
   - Try undo/redo (affects all users)
   - Clear canvas (affects all users)
   - Join different rooms to test isolation

## 🎨 Features

### Drawing Tools
- **Brush**: Draw with customizable colors and stroke width
- **Eraser**: Erase parts of the drawing
- **Color Picker**: Choose any color for drawing
- **Stroke Width**: Adjustable from 1-50 pixels

### Real-time Collaboration
- **Live Drawing**: See other users' strokes as they draw (not after completion)
- **User Cursors**: Visual indicators showing where other users are
- **User Management**: See who's online with color-coded badges
- **Room System**: Multiple isolated canvases (rooms)

### Advanced Features
- **Global Undo/Redo**: Undo/redo operations affect all users
- **Conflict Resolution**: Handles simultaneous drawing operations
- **State Synchronization**: New users receive full canvas state
- **Mobile Support**: Touch events for drawing on mobile devices
- **Performance Monitoring**: FPS counter for performance tracking

## 📁 Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Styles
│   ├── canvas.ts           # Canvas drawing logic
│   ├── websocket.ts        # WebSocket client
│   └── main.ts             # App initialization
├── server/
│   ├── server.ts           # Express + WebSocket server
│   ├── rooms.ts            # Room management
│   └── drawing-state.ts    # Canvas state management
├── shared/
│   └── types.ts            # Shared TypeScript types
├── package.json
├── tsconfig.json           # Server TypeScript config
├── tsconfig.client.json    # Client TypeScript config
├── README.md
└── ARCHITECTURE.md
```

## 🔧 Technical Stack

- **Frontend**: Vanilla TypeScript + HTML5 Canvas
- **Backend**: Node.js + Express + Socket.io
- **Language**: TypeScript
- **Real-time**: WebSockets (Socket.io)

## ⚠️ Known Limitations

1. **No Persistence**: Canvas state is not saved to disk. All drawings are lost when the server restarts.

2. **No Authentication**: Users are identified by socket ID only. No user accounts or authentication.

3. **Limited Scalability**: The current implementation stores all operations in memory. For many users or long sessions, this could consume significant memory.

4. **Image Export**: ✅ Now available! Use the export button (💾) or Ctrl+S.

5. **Browser Compatibility**: Requires modern browsers with ES2020 support and WebSocket support.

6. **Network Issues**: No automatic reconnection handling. If connection is lost, users need to refresh the page. (Note: Connection status is displayed in real-time)

## 🐛 Known Bugs

1. **Cursor Position**: Cursor indicators may not update smoothly on very fast mouse movements.

2. **Touch Drawing**: Touch drawing on mobile devices may have slight lag compared to mouse input.

3. **Undo/Redo Conflicts**: In rare cases with very fast operations, undo/redo may not sync perfectly across all clients.

## ⏱️ Time Spent

- **Initial Setup**: 1 hour
- **Backend Development**: 3 hours
- **Frontend Development**: 4 hours
- **Real-time Synchronization**: 2 hours
- **Undo/Redo Implementation**: 2 hours
- **Testing & Bug Fixes**: 2 hours
- **Documentation**: 1 hour

**Total**: ~15 hours

## 📝 License

MIT

## 🤝 Contributing

This is an assignment project. For questions or issues, please refer to the ARCHITECTURE.md file for technical details.

