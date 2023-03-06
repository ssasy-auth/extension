export const ERROR_MESSAGE = {
  KEY_NOT_FOUND: "key for value not found",
  KEY_NOT_STRING: "value is not a string",
  VALUE_NOT_STRING: "value is not a string",
  STORAGE_NOT_AVAILABLE: "local storage is not available"
}

/**
 * Returns true if local storage is available
 * 
 * @returns - true if local storage is available, false otherwise 
 */
function storageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = "__storage_test__";
    const value = "__storage_test__";
    localStorage.setItem(key, value);
    localStorage.removeItem(key);
    return true;
  } catch(e) {
    return false;
  }
}

/**
 * Saves a key value pair to the local storage
 * 
 * @param key - key value
 * @param value - value to store
 * @returns boolean
 */
export function save(key: string, value: string): boolean {
  if (!storageAvailable()) throw new Error(ERROR_MESSAGE.STORAGE_NOT_AVAILABLE);
  if (typeof key !== "string") throw new Error(ERROR_MESSAGE.KEY_NOT_STRING);
  if(typeof value !== "string") throw new Error(ERROR_MESSAGE.VALUE_NOT_STRING);

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Retrieves a value from the local storage
 * 
 * @param key - key value
 * @returns value
 * */
export function get(key: string): string | null {
  if (!storageAvailable()) throw new Error(ERROR_MESSAGE.STORAGE_NOT_AVAILABLE);
  if (typeof key !== "string") throw new Error(ERROR_MESSAGE.KEY_NOT_STRING);

  return localStorage.getItem(key);
}

/**
 * Removes a key value pair from the local storage
 * 
 * @param key - key value
 * @returns - confirmation
 * */
export function remove(key: string): boolean {
  if (!storageAvailable()) throw new Error(ERROR_MESSAGE.STORAGE_NOT_AVAILABLE);
  if (typeof key !== "string") throw new Error(ERROR_MESSAGE.KEY_NOT_STRING);

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}