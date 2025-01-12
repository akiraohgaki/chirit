/**
 * Creates throttled function.
 *
 * Only invokes the provided function at most once per every wait time.
 *
 * This function also work in non-browser environment.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const throttledFunc = throttle(() => {
 *   //...
 * }, 1000);
 *
 * throttledFunc(); // Executed
 * throttledFunc(); // Canceled
 * setTimeout(() => {
 *   throttledFunc(); // Executed after 1500ms
 *   throttledFunc(); // Canceled
 * }, 1500);
 * ```
 *
 * @param func - The function to throttle.
 * @param wait - The number of milliseconds to wait.
 */
export default function throttle<T extends Array<unknown>>(
  func: (...args: T) => unknown,
  wait: number,
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  return (...args: T) => {
    if (timeoutId !== undefined) {
      return;
    }

    func(...args);
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
    }, wait);
  };
}
