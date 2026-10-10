export function readBookmarks(value: string | null): string[] {
  try {
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 1 && id.length < 200 && id !== 'undefined' && id !== 'null' && id !== '1'))].slice(0, 500)
      : [];
  } catch { return []; }
}
