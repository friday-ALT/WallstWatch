import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authFetch } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import {
  Alert,
  AlertEvent,
  AlertType,
  DEFAULT_LOCAL_ALERTS,
  mapAlertRow,
} from '../utils/alerts';

const LOCAL_KEY = 'ww_alerts';

async function loadLocalAlerts(): Promise<Alert[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    if (!raw) return DEFAULT_LOCAL_ALERTS;
    const parsed = JSON.parse(raw) as Alert[];
    return Array.isArray(parsed) ? parsed : DEFAULT_LOCAL_ALERTS;
  } catch {
    return DEFAULT_LOCAL_ALERTS;
  }
}

async function saveLocalAlerts(alerts: Alert[]) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(alerts));
}

export function useAlerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (token) {
      const rows = await authFetch<Record<string, unknown>[]>('/alerts', { token });
      setAlerts(rows.map(mapAlertRow));
      try {
        const ev = await apiFetch<AlertEvent[]>('/platform/alerts/events', token);
        setEvents(Array.isArray(ev) ? ev : []);
      } catch {
        setEvents([]);
      }
    } else {
      setAlerts(await loadLocalAlerts());
      setEvents([]);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const pullRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const addAlert = async (sym: string, type: AlertType, threshold: string) => {
    const symbol = sym.trim().toUpperCase();
    if (!symbol || !threshold.trim()) throw new Error('Symbol and threshold required');

    if (token) {
      const rows = await authFetch<Record<string, unknown>[]>('/alerts', {
        token,
        method: 'POST',
        body: { sym: symbol, type, threshold: threshold.trim() },
      });
      setAlerts(rows.map(mapAlertRow));
    } else {
      const next: Alert = {
        id: `local-${Date.now()}`,
        sym: symbol,
        type,
        threshold: threshold.trim(),
        active: true,
      };
      const updated = [next, ...alerts];
      setAlerts(updated);
      await saveLocalAlerts(updated);
    }
  };

  const toggleAlert = async (id: string) => {
    const target = alerts.find((a) => a.id === id);
    if (!target) return;

    if (token) {
      const rows = await authFetch<Record<string, unknown>[]>(`/alerts/${encodeURIComponent(id)}`, {
        token,
        method: 'PATCH',
        body: { active: !target.active },
      });
      setAlerts(rows.map(mapAlertRow));
    } else {
      const updated = alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
      setAlerts(updated);
      await saveLocalAlerts(updated);
    }
  };

  const removeAlert = async (id: string) => {
    if (token) {
      const rows = await authFetch<Record<string, unknown>[]>(`/alerts/${encodeURIComponent(id)}`, {
        token,
        method: 'DELETE',
      });
      setAlerts(rows.map(mapAlertRow));
    } else {
      const updated = alerts.filter((a) => a.id !== id);
      setAlerts(updated);
      await saveLocalAlerts(updated);
    }
  };

  return {
    alerts,
    events,
    loading,
    refreshing,
    refresh: pullRefresh,
    addAlert,
    toggleAlert,
    removeAlert,
    isSynced: !!token,
  };
}
