/**
 * Compares two values for equality.
 *
 * This function handling nested objects and arrays.
 *
 * This function also work in non-browser environment.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const valueA = { a: { b: [0, 1] } };
 * const valueB = { a: { b: [0, 1, 2] } };
 *
 * if (!compareValues(valueA, valueB)) {
 *   //...
 * }
 * ```
 *
 * @param valueA - The first value to compare.
 * @param valueB - The second value to compare.
 * @param track - A WeakSet to track circular references.
 */
export default function compareValues(
  valueA: unknown,
  valueB: unknown,
  track: WeakSet<object> = new WeakSet(),
): boolean {
  if (typeof valueA !== typeof valueB) {
    return false;
  }

  if ((valueA !== null && typeof valueA === 'object') && (valueB !== null && typeof valueB === 'object')) {
    if (track.has(valueA)) {
      return track.has(valueB);
    }
    track.add(valueA);
    track.add(valueB);

    if (Array.isArray(valueA) && Array.isArray(valueB)) {
      if (valueA.length !== valueB.length) {
        return false;
      }

      for (let i = 0; i < valueA.length; i++) {
        if (!compareValues(valueA[i], valueB[i], track)) {
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
          !compareValues(
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
