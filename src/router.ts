// ============================================
// Simple Hash-based SPA Router
// ============================================

type RouteHandler = (params?: Record<string, string>) => void;

interface Route {
  pattern: RegExp;
  handler: RouteHandler;
  paramNames: string[];
}

class Router {
  private routes: Route[] = [];
  private _currentRoute: string = '';

  get currentRoute(): string {
    return this._currentRoute;
  }

  /**
   * Register a route. Supports :param syntax.
   * e.g., '/detail/:id' matches '/detail/abc-123'
   */
  on(path: string, handler: RouteHandler): this {
    const paramNames: string[] = [];
    const patternStr = path.replace(/:([^/]+)/g, (_match, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    const pattern = new RegExp(`^${patternStr}$`);
    this.routes.push({ pattern, handler, paramNames });
    return this;
  }

  /**
   * Navigate to a route
   */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Start listening for hash changes
   */
  start(): void {
    window.addEventListener('hashchange', () => this._resolve());
    // Handle initial route
    this._resolve();
  }

  private _resolve(): void {
    const hash = window.location.hash.slice(1) || '/';
    this._currentRoute = '#' + hash;

    for (const route of this.routes) {
      const match = hash.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        route.handler(params);
        return;
      }
    }

    // Default: redirect to home
    this.navigate('/');
  }
}

export const router = new Router();
