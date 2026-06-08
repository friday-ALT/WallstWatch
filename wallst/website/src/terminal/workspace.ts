/** Routes that are part of the unified Market Map + Terminal workspace */

export const WORKSPACE_ROUTES = ['/map', '/dashboard', '/report'] as const;

export function isWorkspaceRoute(path: string): boolean {
  if (WORKSPACE_ROUTES.includes(path as (typeof WORKSPACE_ROUTES)[number])) return true;
  return path.startsWith('/equity/');
}

/** Leaving workspace for marketing — confirm unless auth pages */
export function shouldConfirmLeave(from: string, to: string): boolean {
  if (!isWorkspaceRoute(from)) return false;
  if (isWorkspaceRoute(to)) return false;
  if (to === '/login' || to === '/signup') return false;
  return true;
}

export function workspaceTabForPath(path: string): '/map' | '/dashboard' | '/report' | null {
  if (path === '/map') return '/map';
  if (path === '/dashboard' || path.startsWith('/equity/')) return '/dashboard';
  if (path === '/report') return '/report';
  return null;
}
