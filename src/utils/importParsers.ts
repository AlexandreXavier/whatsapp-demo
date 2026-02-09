import type { Message, ParseProgress } from '../types';
import { parseWhatsAppChat } from './parser';

export type ImportedFormat = 'txt' | 'json' | 'csv';

export interface ImportedRawData {
  format: ImportedFormat;
  fileName: string;
  content: string;
}

export interface ParseResult {
  messages: Message[];
  groupName: string | null;
}

function safeJsonParse(content: string): unknown {
  return JSON.parse(content);
}

function parseJsonMessages(content: string): Message[] {
  const raw = safeJsonParse(content);
  if (!Array.isArray(raw)) {
    throw new Error('JSON inválido: esperado um array de mensagens.');
  }

  return raw.map((item, idx) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`JSON inválido na posição ${idx}.`);
    }

    const record = item as Record<string, unknown>;
    const ts = record.timestamp;
    const sender = record.sender;
    const contentField = record.content;
    const replyTo = record.replyTo;
    const isSystemMessage = record.isSystemMessage;

    if (typeof ts !== 'string') throw new Error(`timestamp inválido na posição ${idx}.`);
    if (typeof sender !== 'string') throw new Error(`sender inválido na posição ${idx}.`);
    if (typeof contentField !== 'string') throw new Error(`content inválido na posição ${idx}.`);

    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`timestamp inválido (ISO) na posição ${idx}.`);
    }

    return {
      timestamp: date,
      sender: sender.trim(),
      content: contentField,
      replyTo: typeof replyTo === 'string' ? replyTo : undefined,
      isSystemMessage: typeof isSystemMessage === 'boolean' ? isSystemMessage : false,
    } satisfies Message;
  });
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function parseCsvMessages(content: string): Message[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]).map(h => h.trim());
  const idxTimestamp = header.findIndex(h => h === 'timestamp');
  const idxSender = header.findIndex(h => h === 'sender');
  const idxContent = header.findIndex(h => h === 'content');
  const idxReplyTo = header.findIndex(h => h === 'replyTo');
  const idxIsSystem = header.findIndex(h => h === 'isSystemMessage');

  if (idxTimestamp === -1 || idxSender === -1 || idxContent === -1) {
    throw new Error('CSV inválido: colunas obrigatórias: timestamp,sender,content');
  }

  const messages: Message[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);

    const ts = cols[idxTimestamp] ?? '';
    const sender = (cols[idxSender] ?? '').trim();
    const contentField = cols[idxContent] ?? '';
    const replyTo = idxReplyTo >= 0 ? cols[idxReplyTo] : undefined;
    const isSystemRaw = idxIsSystem >= 0 ? cols[idxIsSystem] : undefined;

    if (!ts || !sender) continue;

    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`CSV inválido: timestamp não é ISO (linha ${i + 1}).`);
    }

    const isSystem = typeof isSystemRaw === 'string'
      ? ['true', '1', 'yes'].includes(isSystemRaw.trim().toLowerCase())
      : false;

    messages.push({
      timestamp: date,
      sender,
      content: contentField,
      replyTo: typeof replyTo === 'string' && replyTo.trim() ? replyTo.trim() : undefined,
      isSystemMessage: isSystem,
    });
  }

  return messages;
}

export function extractGroupNameFromWhatsAppText(text: string): string | null {
  const lines = text.split(/\r?\n/);

  const ptPattern = /criou o grupo\s+"([^"]+)"/i;
  const enPattern = /created group\s+"([^"]+)"/i;

  for (const line of lines) {
    const pt = line.match(ptPattern);
    if (pt?.[1]) return pt[1].trim();

    const en = line.match(enPattern);
    if (en?.[1]) return en[1].trim();
  }

  return null;
}

export function parseImportedRawData(
  raw: ImportedRawData,
  onProgress?: (progress: ParseProgress) => void,
): ParseResult {
  if (raw.format === 'txt') {
    const groupName = extractGroupNameFromWhatsAppText(raw.content);
    const messages = parseWhatsAppChat(raw.content, (current, total) => {
      if (!onProgress) return;
      onProgress({
        current,
        total,
        percentage: total > 0 ? Math.round((current / total) * 100) : 0,
      });
    });
    return { messages, groupName };
  }

  if (raw.format === 'json') {
    if (onProgress) onProgress({ current: 100, total: 100, percentage: 100 });
    return { messages: parseJsonMessages(raw.content), groupName: null };
  }

  if (raw.format === 'csv') {
    if (onProgress) onProgress({ current: 100, total: 100, percentage: 100 });
    return { messages: parseCsvMessages(raw.content), groupName: null };
  }

  throw new Error('Formato não suportado.');
}

export function detectFormatFromFileName(fileName: string): ImportedFormat {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.txt')) return 'txt';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.csv')) return 'csv';
  throw new Error('Formato não suportado. Use .txt, .json ou .csv.');
}
