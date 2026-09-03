// ============================================
// Network Monitor Service
// Uses window online/offline events + Capacitor Network plugin
// ============================================

type NetworkCallback = (online: boolean) => void;

class NetworkMonitorService {
  private _isOnline: boolean = navigator.onLine;
  private _listeners: Set<NetworkCallback> = new Set();
  private _capacitorAvailable: boolean = false;

  constructor() {
    this._setupBrowserEvents();
    this._setupCapacitorEvents();
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  onChange(callback: NetworkCallback): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  private _notify(online: boolean) {
    this._isOnline = online;
    this._listeners.forEach((cb) => {
      try {
        cb(online);
      } catch (e) {
        console.error('[NetworkMonitor] Listener error:', e);
      }
    });
  }

  private _setupBrowserEvents() {
    window.addEventListener('online', () => {
      console.log('[NetworkMonitor] Browser: online');
      this._notify(true);
    });

    window.addEventListener('offline', () => {
      console.log('[NetworkMonitor] Browser: offline');
      this._notify(false);
    });
  }

  private async _setupCapacitorEvents() {
    try {
      const { Network } = await import('@capacitor/network');
      this._capacitorAvailable = true;

      // Get initial status
      const status = await Network.getStatus();
      this._isOnline = status.connected;
      console.log('[NetworkMonitor] Capacitor initial:', status.connected, status.connectionType);

      // Listen for changes
      Network.addListener('networkStatusChange', (status) => {
        console.log('[NetworkMonitor] Capacitor:', status.connected, status.connectionType);
        this._notify(status.connected);
      });
    } catch {
      this._capacitorAvailable = false;
      console.log('[NetworkMonitor] Capacitor Network not available, using browser events only');
    }
  }

  get isCapacitorAvailable(): boolean {
    return this._capacitorAvailable;
  }
}

// Singleton
export const networkMonitor = new NetworkMonitorService();
