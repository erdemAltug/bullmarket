'use client';

import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { DashboardWidgetId } from '@/types';

export const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  'fear-greed',
  'smart-radar',
  'metrics',
  'chart-fx',
  'watchlist',
  'news',
  'signals',
  'calendar',
];

const KEY = 'bullmarket:dashboard-layout';

export function useDashboardLayout() {
  const [order, setOrder, ready] = useLocalStorage<DashboardWidgetId[]>(
    KEY + ':order',
    DEFAULT_WIDGET_ORDER
  );
  const [hidden, setHidden] = useLocalStorage<DashboardWidgetId[]>(
    KEY + ':hidden',
    []
  );
  const [editing, setEditing] = useLocalStorage<boolean>(
    KEY + ':editing',
    false
  );

  const visible = order.filter((id) => !hidden.includes(id));

  const toggleHidden = useCallback(
    (id: DashboardWidgetId) => {
      setHidden((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setHidden]
  );

  const move = useCallback(
    (activeId: DashboardWidgetId, overId: DashboardWidgetId) => {
      setOrder((prev) => {
        const oldIndex = prev.indexOf(activeId);
        const newIndex = prev.indexOf(overId);
        if (oldIndex < 0 || newIndex < 0) return prev;
        const next = [...prev];
        next.splice(oldIndex, 1);
        next.splice(newIndex, 0, activeId);
        return next;
      });
    },
    [setOrder]
  );

  const reset = useCallback(() => {
    setOrder(DEFAULT_WIDGET_ORDER);
    setHidden([]);
  }, [setOrder, setHidden]);

  return {
    order,
    hidden,
    visible,
    editing,
    setEditing,
    toggleHidden,
    move,
    reset,
    ready,
  };
}
