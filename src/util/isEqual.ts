/**
 * Compares two values for equality.
 *
 * It also compares nested objects and arrays recursively.
 *
 * @remarks
 * This also works in non-browser environments.
 *
 * @example Basic usage
 * ```ts
 * const valueA = { a: { b: [0, 1] } };
 * const valueB = { a: { b: [0, 1, 2] } };
 *
 * if (!isEqual(valueA, valueB)) {
 *   //...
 * }
 * ```
 *
 * @param valueA - The first value to compare.
 * @param valueB - The second value to compare.
 */
export function isEqual(valueA: unknown, valueB: unknown): boolean {
  return isDeepEqual(valueA, valueB, new WeakSet());
}

/**
 * Compares two values for equality.
 *
 * It also compares nested objects and arrays recursively.
 *
 * @param valueA - The first value to compare.
 * @param valueB - The second value to compare.
 * @param track - A WeakSet used to track circular references.
 */
function isDeepEqual(valueA: unknown, valueB: unknown, track: WeakSet<object>): boolean {
  if (typeof valueA !== typeof valueB) {
    return false;
  }

  if ((valueA !== null && typeof valueA === 'object') && (valueB !== null && typeof valueB === 'object')) {
    if (track.has(valueA) || track.has(valueB)) {
      return track.has(valueA) && track.has(valueB);
    }
    track.add(valueA);
    track.add(valueB);

    if (Array.isArray(valueA) && Array.isArray(valueB)) {
      if (valueA.length !== valueB.length) {
        return false;
      }

      for (let i = 0; i < valueA.length; i++) {
        if (!isDeepEqual(valueA[i], valueB[i], track)) {
          return false;
        }
      }

      return true;
    }

    if (valueA.constructor === Object && valueB.constructor === Object) {
      const keysA = Object.keys(valueA);
      const keysB = Object.keys(valueB);

      if (keysA.length !== keysB.length) {
        return false;
      }

      for (const key of keysA) {
        if (
          !isDeepEqual(
            (valueA as Record<string, unknown>)[key],
            (valueB as Record<string, unknown>)[key],
            track,
          )
        ) {
          return false;
        }
      }

      return true;
    }
  }

  return valueA === valueB;
}
