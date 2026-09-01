import { useEffect } from 'react';

// Warn before leaving a page with unsaved changes.
// Works with BrowserRouter (no data router): guards tab close/refresh (beforeunload),
// in-app link clicks (capture-phase click on <a>), and the browser Back button (popstate).
export function useUnsavedGuard(dirty: boolean, message = 'You have unsaved changes. Discard them and leave this page?') {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('http') || href.startsWith('#') || a.target === '_blank') return;
      if (!window.confirm(message)) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('click', onClick, true);

    // Trap the browser Back button.
    const onPop = () => {
      if (!window.confirm(message)) { history.pushState(null, '', location.href); }
    };
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', onPop);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
    };
  }, [dirty, message]);
}

// Confirm helper for programmatic navigations (e.g. an in-page Back button).
export function confirmDiscard(dirty: boolean, message = 'You have unsaved changes. Discard them and leave this page?') {
  return !dirty || window.confirm(message);
}
