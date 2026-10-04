export function readBookmarks(value: string | null): string[] {
  try {
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length < 200))].slice(0, 500) : [];
  } catch { return []; }
}
