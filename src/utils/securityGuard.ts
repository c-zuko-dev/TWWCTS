/**
 * Client-Side Protection & Security Details
 * Prevents casual inspection (F12, right-click, dev shortcuts) to preserve the story surprise.
 */

export function setupSecurityGuard(onSecurityEvent?: (msg: string) => void) {
  // Prevent context menu (Right click)
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    if (onSecurityEvent) {
      onSecurityEvent('Nothing to see here ✨');
    }
  };

  // Prevent dev tools keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifier = isMac ? e.metaKey : e.ctrlKey;

    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      if (onSecurityEvent) onSecurityEvent('Nothing to see here ✨');
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    if ((isModifier && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) ||
        (isMac && e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73))) {
      e.preventDefault();
      e.stopPropagation();
      if (onSecurityEvent) onSecurityEvent('Nothing to see here ✨');
      return false;
    }

    // Ctrl+Shift+J / Cmd+Option+J (Console)
    if ((isModifier && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) ||
        (isMac && e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74))) {
      e.preventDefault();
      e.stopPropagation();
      if (onSecurityEvent) onSecurityEvent('Nothing to see here ✨');
      return false;
    }

    // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
    if ((isModifier && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) ||
        (isMac && e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67))) {
      e.preventDefault();
      e.stopPropagation();
      if (onSecurityEvent) onSecurityEvent('Nothing to see here ✨');
      return false;
    }

    // Ctrl+U / Cmd+Option+U (View Source)
    if (isModifier && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      if (onSecurityEvent) onSecurityEvent('Nothing to see here ✨');
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if (isModifier && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Attach window event listeners
  window.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('keydown', handleKeyDown, true);

  // Clear and post protective console message
  try {
    console.clear();
    console.log(
      '%c✦ Nothing to see here! ✨ A magical storybook crafted with care ✦',
      'color: #f59e0b; font-size: 16px; font-weight: bold; background: #020617; padding: 8px 16px; border: 1px solid #f59e0b; border-radius: 6px; font-family: serif;'
    );
  } catch {}

  return () => {
    window.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown, true);
  };
}
