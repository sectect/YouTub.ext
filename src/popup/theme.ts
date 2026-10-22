import type { Theme } from '../features/settings';

const options = [...document.querySelectorAll<HTMLButtonElement>('.theme-tabs button')];

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  for (const option of options) {
    option.setAttribute('aria-pressed', String(option.dataset.theme === theme));
  }
}

export function bindTheme(save: (theme: Theme) => void): void {
  for (const [index, option] of options.entries()) {
    option.addEventListener('click', () => save(option.dataset.theme as Theme));
    option.addEventListener('keydown', event => {
      let next: number;
      switch (event.key) {
        case 'ArrowRight': next = (index + 1) % options.length; break;
        case 'ArrowLeft': next = (index - 1 + options.length) % options.length; break;
        case 'Home': next = 0; break;
        case 'End': next = options.length - 1; break;
        default: return;
      }
      event.preventDefault();
      options[next]?.focus();
      options[next]?.click();
    });
  }
}
