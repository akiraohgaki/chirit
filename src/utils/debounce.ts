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
 * }, 50);
 *
 * debouncedFunc(); // Canceled
 * debouncedFunc(); // Executed
 * await new Promise((resolve) => setTimeout(resolve, 100));
 * debouncedFunc(); // Canceled
 * debouncedFunc(); // Executed
 * ```
 *
 * @param func - The function to debounce.
 * @param ms - The number of milliseconds to wait.
 */
export default function debounce<T extends Array<unknown>>(
  func: (...args: T) => unknown,
  ms: number,
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, ms);
  };
}
