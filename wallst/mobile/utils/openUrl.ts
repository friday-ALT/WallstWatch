import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

/** Open https links in an in-app browser; fall back to the system handler. */
export async function openExternalUrl(url: string | undefined | null): Promise<void> {
  if (!url || !/^https?:\/\//i.test(url)) return;

  try {
    await WebBrowser.openBrowserAsync(url);
    return;
  } catch {
    /* WebBrowser unavailable or failed — try system Linking */
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) await Linking.openURL(url);
  } catch {
    /* No handler — avoid unhandled promise rejection */
  }
}
