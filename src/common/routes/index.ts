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
  
  enum RedirectPath {
    Setup = '/setup',
    Auth = '/auth'
  }

  if(
    to.path === RedirectPath.Auth ||
    to.path === RedirectPath.Setup ||
    to.path === '/setup/key' ||
    to.path === '/setup/import' ||
    to.path === '/setup/storage'
  ) {
    return next();
  }

  // save the current route and query params for redirecting
  const location: Location = {
    path: to.path,
    query: to.query
  };
  
  const vaultStore = useVaultStore();
  const sessionStore = useSessionStore();
  const notificationStore = useNotificationStore();
  
  let redirectPath: RedirectPath.Setup | RedirectPath.Auth | undefined = undefined;
  
  try {
    // if vault key is empty, redirect to setup
    if(!vaultStore.hasKey){
      redirectPath = RedirectPath.Setup;
      notificationStore.error('Authentication Router Guard', 'Vault key is empty or invalid')
    } 
    
    // if session key is empty, redirect to login
    else if(!sessionStore.verifySession()) {
      redirectPath = RedirectPath.Auth;
      notificationStore.error('Authentication Router Guard', 'Session is empty or invalid')
    }
  } catch (error) {
    redirectPath = RedirectPath.Setup;
    notificationStore.error('Authentication Router Guard', (error as Error).message || 'Failed to authenticate')
  }
  
  // if no redirect path is set, continue to the next route
  if(redirectPath === undefined) {
    return next();
  } 
  
  // redirect to the redirect path
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