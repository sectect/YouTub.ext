let observer: MutationObserver | undefined;
let clicked = new WeakSet<Element>();

function confirm(): void {
  for (const dialog of document.querySelectorAll<HTMLElement>('yt-confirm-dialog-renderer')) {
    if (!dialog.getClientRects().length || dialog.closest('[hidden], [aria-hidden="true"]')) {
      clicked.delete(dialog);
      continue;
    }
    if (clicked.has(dialog)) continue;
    const message = dialog.querySelector('#content')?.textContent ?? '';
    if (!/video paused[.\s]*continue watching\s*\?/i.test(message)) continue;
    const button = dialog.querySelector<HTMLElement>('#confirm-button button, button#confirm-button, #confirm-button [role="button"]');
    if (!button || button.matches(':disabled, [disabled], [aria-disabled="true"]')) continue;
    clicked.add(dialog);
    button.click();
  }
}

export function nonstop(enabled: boolean): void {
  observer?.disconnect();
  observer = undefined;
  clicked = new WeakSet();
  if (!enabled) return;

  const watch = (): void => {
    const container = document.querySelector('ytd-popup-container');
    if (container) {
      observer!.disconnect();
      observer!.observe(container, {
        childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ['hidden', 'aria-hidden', 'opened', 'style', 'class', 'disabled', 'aria-disabled'],
      });
    }
    confirm();
  };

  observer = new MutationObserver(watch);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  watch();
}
