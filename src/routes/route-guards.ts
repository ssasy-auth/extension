import { useVaultStore, useSessionStore, useNotificationStore } from '~/stores'
import type { LocationQuery, RouteLocationNormalized, NavigationGuardNext, RouteLocationRaw } from 'vue-router'

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

  // save the current route and query params for redirecting
  const location: Location = {
    path: to.path,
    query: to.query
  };
  
  let hasKey: boolean = false;
  
  try {
    hasKey = await vaultStore.hasKey();
  } catch (error) {
    notificationStore.error('Router Guard - Error', (error as Error).message || 'Failed to authenticate')

    return next({
      path: '/setup',
      query: {
        redirect: location.path,
        ...location.query
      }
    });
  }

  // redirect the user to the setup page if they are missing a vault key
  if(!hasKey && !inSetupPath(location.path)) {
    notificationStore.error('Router Guard - Authentication', 'You are missing your authentication key. Please setup your key to continue.')

    return next({
      path: '/setup',
      query: {
        redirect: location.path,
        ...location.query
      }
    });
  }
  
  // continue to the route if no redirect path is set
  return next();
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

  // save the current route and query params for redirecting
  const location: Location = {
    path: to.path,
    query: to.query
  };
  
  let hasSession: boolean = false;
  
  try {
    hasSession = await sessionStore.hasSession();  
  } catch (error) {
    notificationStore.error('Router Guard - Error', (error as Error).message || 'Failed to authenticate')

    return next({
      path: '/setup',
      query: {
        redirect: location.path,
        ...location.query
      }
    });
  }
  
  if(!hasSession && !inAuthPath(location.path)) {
    notificationStore.error('Router Guard', 'Your session has timed out. Please login and renew your session to continue.')

    const nextLocation: RouteLocationRaw = {
      path: '/auth',
      query: {
        redirect: location.path,
        ...location.query
      }
    }

    if(location.query.newUser !== 'true') {
      nextLocation.query = {
        ...nextLocation.query,
        timeout: 'true'
      };
      
      // set the timeout query to true
      nextLocation.query!.timeout = 'true';
    }

    return next(nextLocation);
  }

  // continue to the route if no redirect path is set
  return next();
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