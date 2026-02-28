/**
 * dom-helpers.ts — Lightweight DOM utilities.
 */

/** Remove all child nodes from an element. */
export function clear(node: HTMLElement): void {
  node.textContent = '';
}

/**
 * Announce a message to screen readers via the aria-live region.
 * Clears first to ensure re-reads when the message is repeated.
 */
export function announce(message: string): void {
  const live = document.getElementById('aria-announcer');
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => {
    live.textContent = message;
  });
}
