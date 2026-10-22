import { defaults, presets, read, type Section, type Settings } from '../features/settings';
import { bindTheme, setTheme } from './theme';

let settings: Settings = { ...defaults };
const previous = { intro: 5, outro: 5 };
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const nonstop = document.querySelector<HTMLInputElement>('#nonstop')!;

function render(): void {
  setTheme(settings.theme);
  nonstop.checked = settings.nonstop;
  for (const section of document.querySelectorAll<HTMLElement>('[data-section]')) {
    const key = section.dataset.section as Section;
    const value = settings[key];
    section.querySelector<HTMLInputElement>('.switch input')!.checked = value > 0;
    const group = section.querySelector<HTMLDivElement>('.presets')!;
    group.replaceChildren();
    for (const duration of [...presets, null]) {
      const button = document.createElement('button');
      const custom = duration === null;
      const selected = custom ? value > 0 && !presets.some(preset => preset === value) : value === duration;
      button.textContent = custom ? selected ? `${value}s` : '+' : `${duration}s`;
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', custom ? 'Set custom seconds' : `Skip ${duration} seconds`);
      button.addEventListener('click', () => {
        if (custom) {
          const form = section.querySelector<HTMLFormElement>('form')!;
          form.hidden = !form.hidden;
          const input = form.querySelector('input')!;
          input.value = String(value || previous[key]);
          if (!form.hidden) { input.focus(); input.select(); }
        } else {
          section.querySelector<HTMLFormElement>('form')!.hidden = true;
          void save({ [key]: duration });
        }
      });
      group.append(button);
    }
  }
}

async function save(change: Partial<Settings>): Promise<void> {
  try {
    await chrome.storage.sync.set(change);
    settings = { ...settings, ...change };
    if (settings.intro) previous.intro = settings.intro;
    if (settings.outro) previous.outro = settings.outro;
    render();
    status.textContent = 'Saved | Applies to YouTube videos';
  } catch {
    status.textContent = 'Could not save. Please try again.';
    render();
  }
}

async function start(): Promise<void> {
  settings = await read();
  if (settings.intro) previous.intro = settings.intro;
  if (settings.outro) previous.outro = settings.outro;
  render();
  bindTheme(theme => void save({ theme }));
  nonstop.addEventListener('change', () => void save({ nonstop: nonstop.checked }));
  for (const section of document.querySelectorAll<HTMLElement>('[data-section]')) {
    const key = section.dataset.section as Section;
    section.querySelector<HTMLInputElement>('.switch input')!.addEventListener('change', event => {
      void save({ [key]: (event.target as HTMLInputElement).checked ? previous[key] : 0 });
    });
    const form = section.querySelector<HTMLFormElement>('form')!;
    form.querySelector<HTMLButtonElement>('[data-cancel]')!.addEventListener('click', () => {
      form.hidden = true;
      section.querySelector<HTMLButtonElement>('.presets button:last-child')!.focus();
    });
    form.addEventListener('click', event => {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-step]');
      if (!button) return;
      const input = form.querySelector('input')!;
      if (button.dataset.step === 'up') input.stepUp();
      else input.stepDown();
      input.focus();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const value = Number(form.querySelector('input')!.value);
      form.hidden = true;
      void save({ [key]: value });
    });
  }
}

void start().catch(() => { status.textContent = 'Could not load settings. Reopen to retry.'; });
