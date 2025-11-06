/**
 * Main Application
 * Initializes the canvas and WebSocket connection
 */

import { CanvasManager } from './canvas.js';
import { WebSocketClient } from './websocket.js';

class App {
  private canvasManager!: CanvasManager;
  private wsClient!: WebSocketClient;
  private currentTool: 'brush' | 'eraser' = 'brush';
  private currentColor: string = '#000000';
  private currentStrokeWidth: number = 5;
  private currentOperationId: string | null = null;

  constructor() {
    console.log('🚀 Initializing application...');
    
    try {
      // Initialize canvas
      this.canvasManager = new CanvasManager('drawingCanvas', 'cursorCanvas');
      console.log('✅ Canvas initialized');
      
      // Initialize WebSocket client
      this.wsClient = new WebSocketClient(this.canvasManager);
      console.log('✅ WebSocket client initialized');
      
      // Setup UI event listeners
      this.setupUI();
      console.log('✅ UI event listeners setup');
      
      // Connect to server
      this.wsClient.connect();
      console.log('🔄 Attempting to connect to server...');
      
      // Setup canvas drawing handlers
      this.setupCanvasHandlers();
      console.log('✅ Canvas drawing handlers setup');
    } catch (error) {
      console.error('❌ Error initializing application:', error);
      const statusElement = document.getElementById('statusText');
      if (statusElement) {
        statusElement.textContent = 'Initialization Error: ' + (error as Error).message;
        statusElement.className = 'disconnected';
      }
    }
  }

  private setupUI(): void {
    // Tool selection
    const brushTool = document.getElementById('brushTool');
    const eraserTool = document.getElementById('eraserTool');

    brushTool?.addEventListener('click', () => {
      this.setTool('brush');
      brushTool.classList.add('active');
      eraserTool?.classList.remove('active');
    });

    eraserTool?.addEventListener('click', () => {
      this.setTool('eraser');
      eraserTool.classList.add('active');
      brushTool?.classList.remove('active');
    });

    // Color picker
    const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
    colorPicker?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.setColor(target.value);
    });

    // Stroke width
    const strokeWidth = document.getElementById('strokeWidth') as HTMLInputElement;
    const strokeWidthValue = document.getElementById('strokeWidthValue');
    
    strokeWidth?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const width = parseInt(target.value);
      this.setStrokeWidth(width);
      if (strokeWidthValue) {
        strokeWidthValue.textContent = width.toString();
      }
    });

    // Undo/Redo
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const clearBtn = document.getElementById('clearBtn');

    undoBtn?.addEventListener('click', () => {
      this.wsClient.sendUndo();
    });

    redoBtn?.addEventListener('click', () => {
      this.wsClient.sendRedo();
    });

    clearBtn?.addEventListener('click', () => {
      this.wsClient.sendClearCanvas();
    });

    // Room management
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomInput = document.getElementById('roomInput') as HTMLInputElement;

    joinRoomBtn?.addEventListener('click', () => {
      const roomId = roomInput?.value || 'default';
      this.wsClient.joinRoom(roomId);
    });

    // Allow Enter key to join room
    roomInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const roomId = roomInput.value || 'default';
        this.wsClient.joinRoom(roomId);
      }
    });
  }

  private setupCanvasHandlers(): void {
    const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    let isDrawing = false;
    let operationId: string | null = null;

    const generateOperationId = () => {
      return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const getPointFromEvent = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      const rect = canvas.getBoundingClientRect();
      
      if (e instanceof MouseEvent) {
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      } else if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      
      return null;
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;

      isDrawing = true;
      operationId = generateOperationId();
      this.wsClient.setCurrentOperationId(operationId);

      if (this.currentTool === 'brush') {
        this.wsClient.sendDrawStart(point, this.currentColor, this.currentStrokeWidth, operationId);
      } else {
        this.wsClient.sendEraseStart(point, this.currentStrokeWidth, operationId);
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = getPointFromEvent(e);
      if (!point) return;

      // Send cursor position
      this.wsClient.sendCursorMove(point);

      if (isDrawing && operationId) {
        if (this.currentTool === 'brush') {
          this.wsClient.sendDrawMove(point, operationId);
        } else {
          this.wsClient.sendEraseMove(point, operationId);
        }
      }
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (isDrawing && operationId) {
        if (this.currentTool === 'brush') {
          this.wsClient.sendDrawEnd(operationId);
        } else {
          this.wsClient.sendEraseEnd(operationId);
        }
        isDrawing = false;
        operationId = null;
      }
    };

    // Mouse events
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Touch events
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
  }

  private setTool(tool: 'brush' | 'eraser'): void {
    this.currentTool = tool;
    this.canvasManager.setTool(tool);
  }

  private setColor(color: string): void {
    this.currentColor = color;
    this.canvasManager.setColor(color);
  }

  private setStrokeWidth(width: number): void {
    this.currentStrokeWidth = width;
    this.canvasManager.setStrokeWidth(width);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}

