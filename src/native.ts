import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface MonetWidgetPlugin {
  getInsets(): Promise<Insets>;
  setBarStyle(opts: { dark: boolean }): Promise<void>;
  updateWidget(data: Record<string, string>): Promise<void>;
  pinWidget(): Promise<{ supported: boolean }>;
  getLaunchAction(): Promise<{ quickAdd: boolean }>;
  addListener(event: 'insets', fn: (i: Insets) => void): Promise<PluginListenerHandle>;
  addListener(event: 'quickAdd', fn: () => void): Promise<PluginListenerHandle>;
}

export const isNative = Capacitor.isNativePlatform();
const Native = isNative ? registerPlugin<MonetWidgetPlugin>('MonetWidget') : null;

function applyInsets(i: Insets) {
  const s = document.documentElement.style;
  s.setProperty('--sat', `${i.top || 0}px`);
  s.setProperty('--sab', `${i.bottom || 0}px`);
  s.setProperty('--sal', `${i.left || 0}px`);
  s.setProperty('--sar', `${i.right || 0}px`);
}

/** Wire up safe-area insets and widget "quick add" launches. Returns a cleanup fn. */
export function initNative(onQuickAdd: () => void): () => void {
  if (!Native) return () => {};
  const handles: Promise<PluginListenerHandle>[] = [];
  Native.getInsets().then(applyInsets).catch(() => {});
  handles.push(Native.addListener('insets', applyInsets));
  handles.push(Native.addListener('quickAdd', onQuickAdd));
  Native.getLaunchAction()
    .then((r) => r.quickAdd && onQuickAdd())
    .catch(() => {});
  return () => handles.forEach((h) => h.then((x) => x.remove()).catch(() => {}));
}

export function openExternal(url: string) {
  import('@capacitor/browser')
    .then((m) => m.Browser.open({ url }))
    .catch(() => window.open(url, '_blank'));
}

export function setBarStyle(dark: boolean) {
  Native?.setBarStyle({ dark }).catch(() => {});
}

export function updateHomeWidget(data: Record<string, string>) {
  Native?.updateWidget(data).catch(() => {});
}

export async function pinHomeWidget(): Promise<boolean> {
  if (!Native) return false;
  try {
    return (await Native.pinWidget()).supported;
  } catch {
    return false;
  }
}
