// Joins class names, dropping falsy entries so conditional classes stay readable in JSX.

export type ClassValue = string | false | null | undefined

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
