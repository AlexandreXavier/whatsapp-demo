import { useState, useEffect } from 'react';
import type { Message, ParseProgress } from '../types';
import { parseWhatsAppChat } from '../utils/parser';

export function useWhatsAppParser(url: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ParseProgress>({ current: 0, total: 0, percentage: 0 });

  useEffect(() => {
    async function loadAndParse() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Falha ao carregar ficheiro: ${response.status}`);
        }

        const text = await response.text();
        
        const parsed = parseWhatsAppChat(text, (current, total) => {
          setProgress({
            current,
            total,
            percentage: Math.round((current / total) * 100),
          });
        });

        setMessages(parsed);
        setProgress({ current: 100, total: 100, percentage: 100 });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadAndParse();
  }, [url]);

  return { messages, loading, error, progress };
}
