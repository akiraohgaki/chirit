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
 * }, 50);
 *
 * throttledFunc(); // Executed
 * throttledFunc(); // Canceled
 * await sleep(100);
 * throttledFunc(); // Executed
 * throttledFunc(); // Canceled
 * ```
 *
 * @param func - The function to throttle.
 * @param ms - The number of milliseconds to wait.
 */
export default function throttle<T extends Array<unknown>>(
  func: (...args: T) => unknown,
  ms: number,
): (...args: T) => void {
  let isRunning = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  return (...args: T) => {
    if (isRunning || timeoutId !== undefined) {
      return;
    }

    isRunning = true;
    Promise.resolve(func(...args)).finally(() => {
      isRunning = false;
    });

    timeoutId = setTimeout(() => {
      timeoutId = undefined;
    }, ms);
  };
}
