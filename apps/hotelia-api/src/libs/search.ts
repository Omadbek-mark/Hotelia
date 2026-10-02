// Treat search input as text, including regex operators such as '[' or '+'.
export function escapeSearchText(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
