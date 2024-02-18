/**
 * A compare function for sorting strings based on their case-insensitive
 * alphabetical order.
 */
export function alphabetical(a: string, b: string) {
  return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
}
