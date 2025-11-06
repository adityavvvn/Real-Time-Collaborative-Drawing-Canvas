/**
 * Canvas Drawing Logic
 * Handles all canvas operations, drawing, erasing, and rendering
 */

import { DrawingOperation, Point } from '../shared/types.js';

export class CanvasManager {
  private drawingCanvas: HTMLCanvasElement;
  private cursorCanvas: HTMLCanvasElement;
  private drawingCtx: CanvasRenderingContext2D;
  private cursorCtx: CanvasRenderingContext2D;
  
  private isDrawing: boolean = false;
  private currentOperation: DrawingOperation | null = null;
  private currentTool: 'brush' | 'eraser' = 'brush';
  private currentColor: string = '#000000';
  private currentStrokeWidth: number = 5;
  
  private operations: Map<string, DrawingOperation> = new Map();
  private userCursors: Map<string, { point: Point; color: string }> = new Map();
  
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;

  constructor(drawingCanvasId: string, cursorCanvasId: string) {
    this.drawingCanvas = document.getElementById(drawingCanvasId) as HTMLCanvasElement;
    this.cursorCanvas = document.getElementById(cursorCanvasId) as HTMLCanvasElement;

    if (!this.drawingCanvas || !this.cursorCanvas) {
      throw new Error('Canvas elements not found');
    }

    const drawingCtx = this.drawingCanvas.getContext('2d');
    const cursorCtx = this.cursorCanvas.getContext('2d');

    if (!drawingCtx || !cursorCtx) {
      throw new Error('Could not get canvas context');
    }

    this.drawingCtx = drawingCtx;
    this.cursorCtx = cursorCtx;

    this.setupCanvas();
    this.setupEventListeners();
    this.startFPSMonitor();
  }

  private setupCanvas(): void {
    const container = this.drawingCanvas.parentElement;
    if (!container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      this.drawingCanvas.width = rect.width;
      this.drawingCanvas.height = rect.height;
      this.cursorCanvas.width = rect.width;
      this.cursorCanvas.height = rect.height;
      
      // Redraw all operations
      this.redrawAll();
    };

    resize();
    window.addEventListener('resize', resize);
  }

  private setupEventListeners(): void {
    // Mouse events
    this.drawingCanvas.addEventListener('mousedown', this.handleStart.bind(this));
    this.drawingCanvas.addEventListener('mousemove', this.handleMove.bind(this));
    this.drawingCanvas.addEventListener('mouseup', this.handleEnd.bind(this));
    this.drawingCanvas.addEventListener('mouseleave', this.handleEnd.bind(this));

    // Touch events for mobile
    this.drawingCanvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.drawingCanvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.drawingCanvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private getPointFromEvent(e: MouseEvent | TouchEvent): Point | null {
    const rect = this.drawingCanvas.getBoundingClientRect();
    
    if (e instanceof MouseEvent) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    } else if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return null;
  }

  private handleStart(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    const point = this.getPointFromEvent(e);
    if (!point) return;

    this.isDrawing = true;
    this.startDrawing(point);
  }

  private handleMove(e: MouseEvent | TouchEvent): void {
    const point = this.getPointFromEvent(e);
    if (!point) return;

    if (this.isDrawing && this.currentOperation) {
      this.continueDrawing(point);
    }
  }

  private handleEnd(e: MouseEvent | TouchEvent): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.endDrawing();
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    this.handleStart(e);
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    this.handleMove(e);
  }

  private handleTouchEnd(e: TouchEvent): void {
    this.handleEnd(e);
  }

  private startDrawing(point: Point): void {
    const opType: 'draw' | 'erase' = this.currentTool === 'brush' ? 'draw' : 'erase';
    this.currentOperation = {
      id: '',
      userId: '',
      type: opType,
      color: this.currentColor,
      strokeWidth: this.currentStrokeWidth,
      points: [point],
      timestamp: Date.now(),
      sequenceNumber: 0,
    };

    this.drawPoint(point, this.currentTool === 'brush');
  }

  private continueDrawing(point: Point): void {
    if (!this.currentOperation) return;

    const lastPoint = this.currentOperation.points[this.currentOperation.points.length - 1];
    this.currentOperation.points.push(point);

    // Draw line from last point to current point
    this.drawLine(lastPoint, point, this.currentTool === 'brush');
  }

  private endDrawing(): void {
    if (this.currentOperation) {
      // The operation will be sent via WebSocket
      this.currentOperation = null;
    }
  }

  private drawPoint(point: Point, isDraw: boolean): void {
    this.drawingCtx.beginPath();
    this.drawingCtx.arc(point.x, point.y, (this.currentStrokeWidth || 5) / 2, 0, Math.PI * 2);
    
    if (isDraw) {
      this.drawingCtx.fillStyle = this.currentColor;
      this.drawingCtx.fill();
    } else {
      this.drawingCtx.globalCompositeOperation = 'destination-out';
      this.drawingCtx.fill();
      this.drawingCtx.globalCompositeOperation = 'source-over';
    }
  }

  private drawLine(from: Point, to: Point, isDraw: boolean): void {
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(from.x, from.y);
    this.drawingCtx.lineTo(to.x, to.y);
    this.drawingCtx.lineWidth = this.currentStrokeWidth || 5;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';

    if (isDraw) {
      this.drawingCtx.strokeStyle = this.currentColor;
      this.drawingCtx.globalCompositeOperation = 'source-over';
    } else {
      this.drawingCtx.globalCompositeOperation = 'destination-out';
    }

    this.drawingCtx.stroke();
  }

  /**
   * Draw a remote operation (from another user)
   */
  drawRemoteOperation(operation: DrawingOperation, userColor?: string): void {
    this.operations.set(operation.id, operation);

    if (operation.points.length === 0) return;

    const color = operation.type === 'draw' ? (operation.color || userColor || '#000000') : undefined;
    const strokeWidth = operation.strokeWidth || 5;
    const isDraw = operation.type === 'draw';

    // Save current context state
    const prevStrokeStyle = this.drawingCtx.strokeStyle;
    const prevLineWidth = this.drawingCtx.lineWidth;
    const prevComposite = this.drawingCtx.globalCompositeOperation;

    // Set operation properties
    this.drawingCtx.lineWidth = strokeWidth;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';

    if (isDraw && color) {
      this.drawingCtx.strokeStyle = color;
      this.drawingCtx.globalCompositeOperation = 'source-over';
    } else {
      this.drawingCtx.globalCompositeOperation = 'destination-out';
    }

    // Draw the path
    if (operation.points.length === 1) {
      const point = operation.points[0];
      this.drawingCtx.beginPath();
      this.drawingCtx.arc(point.x, point.y, strokeWidth / 2, 0, Math.PI * 2);
      if (isDraw && color) {
        this.drawingCtx.fillStyle = color;
        this.drawingCtx.fill();
      } else {
        this.drawingCtx.fill();
      }
    } else {
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(operation.points[0].x, operation.points[0].y);
      
      for (let i = 1; i < operation.points.length; i++) {
        this.drawingCtx.lineTo(operation.points[i].x, operation.points[i].y);
      }
      
      this.drawingCtx.stroke();
    }

    // Restore context state
    this.drawingCtx.strokeStyle = prevStrokeStyle;
    this.drawingCtx.lineWidth = prevLineWidth;
    this.drawingCtx.globalCompositeOperation = prevComposite;
  }

  /**
   * Add a point to an existing remote operation
   */
  addPointToOperation(operationId: string, point: Point): void {
    const operation = this.operations.get(operationId);
    if (!operation) return;

    const lastPoint = operation.points[operation.points.length - 1];
    operation.points.push(point);

    const color = operation.type === 'draw' ? (operation.color || '#000000') : undefined;
    const strokeWidth = operation.strokeWidth || 5;
    const isDraw = operation.type === 'draw';

    const prevStrokeStyle = this.drawingCtx.strokeStyle;
    const prevLineWidth = this.drawingCtx.lineWidth;
    const prevComposite = this.drawingCtx.globalCompositeOperation;

    this.drawingCtx.lineWidth = strokeWidth;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';

    if (isDraw && color) {
      this.drawingCtx.strokeStyle = color;
      this.drawingCtx.globalCompositeOperation = 'source-over';
    } else {
      this.drawingCtx.globalCompositeOperation = 'destination-out';
    }

    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(lastPoint.x, lastPoint.y);
    this.drawingCtx.lineTo(point.x, point.y);
    this.drawingCtx.stroke();

    this.drawingCtx.strokeStyle = prevStrokeStyle;
    this.drawingCtx.lineWidth = prevLineWidth;
    this.drawingCtx.globalCompositeOperation = prevComposite;
  }

  /**
   * Remove an operation (for undo)
   */
  removeOperation(operationId: string): void {
    this.operations.delete(operationId);
    this.redrawAll();
  }

  /**
   * Redraw all operations
   */
  redrawAll(): void {
    // Clear canvas
    this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

    // Redraw all operations
    for (const operation of this.operations.values()) {
      this.drawRemoteOperation(operation);
    }
  }

  /**
   * Clear the entire canvas
   */
  clear(): void {
    this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    this.operations.clear();
  }

  /**
   * Update user cursor position
   */
  updateUserCursor(userId: string, point: Point, color: string): void {
    this.userCursors.set(userId, { point, color });
    this.redrawCursors();
  }

  /**
   * Remove user cursor
   */
  removeUserCursor(userId: string): void {
    this.userCursors.delete(userId);
    this.redrawCursors();
  }

  /**
   * Redraw all user cursors
   */
  private redrawCursors(): void {
    this.cursorCtx.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);

    for (const [userId, cursor] of this.userCursors.entries()) {
      this.cursorCtx.fillStyle = cursor.color;
      this.cursorCtx.beginPath();
      this.cursorCtx.arc(cursor.point.x, cursor.point.y, 8, 0, Math.PI * 2);
      this.cursorCtx.fill();

      // Draw a ring
      this.cursorCtx.strokeStyle = cursor.color;
      this.cursorCtx.lineWidth = 2;
      this.cursorCtx.beginPath();
      this.cursorCtx.arc(cursor.point.x, cursor.point.y, 12, 0, Math.PI * 2);
      this.cursorCtx.stroke();
    }
  }

  /**
   * Get current operation (for sending via WebSocket)
   */
  getCurrentOperation(): DrawingOperation | null {
    return this.currentOperation;
  }

  /**
   * Set tool
   */
  setTool(tool: 'brush' | 'eraser'): void {
    this.currentTool = tool;
  }

  /**
   * Set color
   */
  setColor(color: string): void {
    this.currentColor = color;
  }

  /**
   * Set stroke width
   */
  setStrokeWidth(width: number): void {
    this.currentStrokeWidth = width;
  }

  /**
   * FPS monitoring
   */
  private startFPSMonitor(): void {
    const updateFPS = (currentTime: number) => {
      this.frameCount++;
      
      if (currentTime - this.lastFrameTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
        
        const fpsElement = document.getElementById('fpsCounter');
        if (fpsElement) {
          fpsElement.textContent = `FPS: ${this.fps}`;
        }
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    requestAnimationFrame(updateFPS);
  }

  /**
   * Get FPS
   */
  getFPS(): number {
    return this.fps;
  }
}

