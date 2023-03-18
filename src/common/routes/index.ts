import { useSessionStore, useVaultStore, useNotificationStore } from '~/common/stores'
import type { LocationQuery, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

interface Location {
  path: string;
  query: LocationQuery;
}

/**
 * Redirects the user to the login page if they don't have a session
 * timestamp or if the session timestamp is expired
 */
export function AuthenticationGaurd(
  to: RouteLocationNormalized, 
  from: RouteLocationNormalized, 
  next: NavigationGuardNext
) {
  // save the current route and query params for redirecting
  const location: Location = {
    path: to.path,
    query: to.query
  };
  
  let redirectPath: '/setup' | '/auth' | undefined = undefined;

  const vaultStore = useVaultStore();
  const sessionStore = useSessionStore();
  const notificationStore = useNotificationStore();
  
  try {
    // if vault key is missing and route is not setup, redirect to setup
    if(
      !vaultStore.hasKey && 
      !inSetupPath(location.path)
    ) {
      redirectPath = '/setup';
      notificationStore.error('Authentication Router Guard', 'Vault key is empty or invalid')
    }

    // if session key is missing and route is not login, redirect to login
    else if(
      !sessionStore.verifySession() && 
      !inAuthPath(location.path)
    ) {
      redirectPath = '/auth';
      notificationStore.error('Authentication Router Guard', 'Session is empty or invalid')
    }

  } catch (error) {
    redirectPath = '/setup'
    notificationStore.error('Authentication Router Guard', (error as Error).message || 'Failed to authenticate')
  }

  console.log('redirectPath', redirectPath);
  
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
export function MessengerGuard(
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