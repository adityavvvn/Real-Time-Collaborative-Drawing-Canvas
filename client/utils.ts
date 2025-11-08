/**
 * Utility Functions
 * Toast notifications, helpers, etc.
 */

export class Toast {
  static show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  static success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  static error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  static info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text).then(() => {
    Toast.success('Copied to clipboard!');
  }).catch(() => {
    Toast.error('Failed to copy');
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'canvas.png'): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      Toast.error('Failed to export canvas');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    Toast.success('Canvas exported successfully!');
  }, 'image/png');
}

