/**
 * Asserts a value's type based on a runtime guarantee (like prior validation).
 * This function performs a simple, controlled type cast.
 * @param value The value to cast.
 * @returns The value, but now with the type T.
 */
export function assertType<T>(value: any): T {
  return value as T;
}
