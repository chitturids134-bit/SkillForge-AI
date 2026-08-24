/**
 * SkillForge AI - JavaScript Closure Utility Modules
 * 
 * Demonstrates real-world JavaScript closures by encapsulating state
 * inside outer function scopes.
 */

/**
 * Closure 1: Debounce Handler Factory
 * Encapsulates 'timeoutId' inside outer function lexical environment.
 */
export function createDebounceHandler(fn, delayMs = 300) {
  let timeoutId = null; // Encapsulated in closure scope
  
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await fn.apply(this, args);
        resolve(result);
      }, delayMs);
    });
  };
}

/**
 * Closure 2: Role Permission Checker Factory
 * Encapsulates 'allowedRolesSet' in closed scope to avoid recalculating Set on every request.
 */
export function createRolePermissionChecker(allowedRoles = []) {
  const allowedRolesSet = new Set(allowedRoles.map(r => String(r).toLowerCase())); // Encapsulated
  
  return function(userRole) {
    if (!userRole) return false;
    return allowedRolesSet.has(String(userRole).toLowerCase());
  };
}
