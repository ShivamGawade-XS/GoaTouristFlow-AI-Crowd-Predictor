import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useCDSWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'CDS_UPDATE') {
        queryClient.setQueryData(['beaches'], (old: any) => {
          if (!old) return old;
          return old.map((beach: any) => {
            const update = message.data.find((u: any) => u.id === beach.id);
            return update ? { ...beach, cds: Math.round(update.cds) } : beach;
          });
        });
      }
    };

    return () => ws.close();
  }, [queryClient]);
}
