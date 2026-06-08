import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { openExternalUrl } from './openUrl';

export function useNotificationRouting() {
  const router = useRouter();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    const route = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handledRef.current === id) return;
      handledRef.current = id;

      const data = response.notification.request.content.data as Record<string, string | undefined>;
      if (data.type === 'price_alert') {
        router.push('/(tabs)/insider');
        return;
      }
      if (data.type === 'news') {
        if (data.url) {
          void openExternalUrl(data.url);
        } else {
          router.push('/(tabs)/credit');
        }
      }
    };

    const sub = Notifications.addNotificationResponseReceivedListener(route);
    Notifications.getLastNotificationResponseAsync().then(route).catch(() => {});
    return () => sub.remove();
  }, [router]);
}
