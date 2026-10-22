export const presets = [5, 10, 30, 60] as const;
export type Section = 'intro' | 'outro';
export type Theme = 'system' | 'light' | 'dark';
export interface Settings {
  intro: number;
  outro: number;
  theme: Theme;
  nonstop: boolean;
}

export const defaults: Settings = { intro: 5, outro: 0, theme: 'system', nonstop: true };

export function seconds(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(86400, Math.max(0, Math.floor(value)))
    : 0;
}

export async function read(): Promise<Settings> {
  const stored = await chrome.storage.sync.get({ ...defaults });
  return {
    intro: seconds(stored.intro),
    outro: seconds(stored.outro),
    theme: stored.theme === 'dark' || stored.theme === 'light' ? stored.theme : 'system',
    nonstop: stored.nonstop !== false,
  };
}
