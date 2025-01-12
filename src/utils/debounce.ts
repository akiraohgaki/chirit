/**
 * Creates debounced function.
 *
 * Delays invoking the provided function until the specified wait time has passed.
 *
 * This function also work in non-browser environment.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const debouncedFunc = debounce(() => {
 *   //...
 * }, 1000);
 *
 * debouncedFunc(); // Canceled
 * debouncedFunc(); // Canceled
 * debouncedFunc(); // Canceled
 * debouncedFunc(); // Executed after 1000ms
 * ```
 *
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to wait.
 */
export default function debounce<T extends Array<unknown>>(
  func: (...args: T) => unknown,
  wait: number,
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
