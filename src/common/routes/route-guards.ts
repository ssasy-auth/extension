import { useVaultStore, useSessionStore, useNotificationStore } from '~/common/stores'
import type { LocationQuery, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

type RedirectRoutes = '/setup' | '/auth';

interface Location {
  path: string;
  query: LocationQuery;
}

/**
 * Makes sure the user has a vault key before allowing them to access the route
 */
async function KeyGuard(
  to: RouteLocationNormalized, 
  from: RouteLocationNormalized, 
  next: NavigationGuardNext
) {
  const vaultStore = useVaultStore();
  const notificationStore = useNotificationStore();

  const hasKey: boolean = await vaultStore.hasKey();

  // save the current route and query params for redirecting
  const location: Location = {
    path: to.path,
    query: to.query
  };
  
  let redirectPath: '/setup' | '/auth' | undefined = undefined;

  try {
    // redirect the user to the setup page if they are missing a vault key
    if(!hasKey && !inSetupPath(location.path)) {
      redirectPath = '/setup';
      notificationStore.error('Router Guard - Authentication', 'Vault key is empty or invalid')
    }

  } catch (error) {
    redirectPath = '/setup'
    notificationStore.error('Router Guard - Error', (error as Error).message || 'Failed to authenticate')
  }
  
  // continue to the route if no redirect path is set
  if(redirectPath === undefined) {
    return next();
  }

  // redirect to the appropriate page
  else {
    return next({
      path: redirectPath,
      query: {
        redirect: location.path,
        ...location.query
      }
    });
  }
}

/**
 * Makes sure the user has a session before allowing them to access the route
 */
async function SessionGaurd(
  to: RouteLocationNormalized, 
  from: RouteLocationNormalized, 
  next: NavigationGuardNext
) {
  const sessionStore = useSessionStore();
  const notificationStore = useNotificationStore();
  const hasSession = await sessionStore.hasSession();

  // save the current route and query params for redirecting
  const location: Location = {
    path: to.path,
    query: to.query
  };
  
  let redirectPath: RedirectRoutes | undefined = undefined;

  try {
    if(!hasSession && !inAuthPath(location.path)) {
      redirectPath = '/auth';
      notificationStore.error('Router Guard - Authentication', 'Session is empty or invalid')
    }

  } catch (error) {
    redirectPath = '/setup'
    notificationStore.error('Router Guard - Error', (error as Error).message || 'Failed to authenticate')
  }
  
  // continue to the route if no redirect path is set
  if(redirectPath === undefined) {
    return next();
  }

  // redirect to the appropriate page
  else {
    return next({
      path: redirectPath,
      query: {
        redirect: location.path,
        ...location.query
      }
    });
  }
}

/**
 * Redirects the user to the specified page based on the route query.
 * 
 * Note: this guard is specifically for messenger usecases - when the messenger
 * opens a popup window for user approval
 */
function MessengerGuard(
  to: RouteLocationNormalized, 
  from: RouteLocationNormalized, 
  next: NavigationGuardNext
) {
  if(!to.query.route) {
    return next();
  }

  const route = to.query.route as string;
    
  // remove the route query
  delete to.query.route;
  
  // route to the appropriate page
  return next({ path: route, query: to.query });
}


function inSetupPath(path: string): boolean {
  return (
    path === '/setup' ||
    path === '/setup/key' ||
    path === '/setup/import' ||
    path === '/setup/storage'
  )
}

function inAuthPath(path: string): boolean {
  return (path === '/auth')
}

export {
  KeyGuard,
  SessionGaurd,
  MessengerGuard
}