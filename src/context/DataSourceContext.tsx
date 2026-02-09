import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Message, ParseProgress } from '../types';
import {
  detectFormatFromFileName,
  parseImportedRawData,
  type ImportedRawData,
} from '../utils/importParsers';

type DataSourceKind = 'sample' | 'imported';

interface DataSourceState {
  kind: DataSourceKind;
  sourceName: string;
  groupName: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  progress: ParseProgress;
  datasetId: string;
}

interface DataSourceContextType extends DataSourceState {
  importFile: (file: File) => Promise<void>;
  resetToSample: () => Promise<void>;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

const STORAGE_KEY = 'whatsapp-analytics-data-source-v1';

function initialProgress(): ParseProgress {
  return { current: 0, total: 0, percentage: 0 };
}

function buildDatasetId(kind: DataSourceKind, fileName: string) {
  return `${kind}:${fileName}:${Date.now()}`;
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o ficheiro.'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsText(file);
  });
}

function loadStoredRaw(): ImportedRawData | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as ImportedRawData;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.format !== 'txt' && parsed.format !== 'json' && parsed.format !== 'csv') return null;
    if (typeof parsed.fileName !== 'string') return null;
    if (typeof parsed.content !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataSourceState>(() => ({
    kind: 'sample',
    sourceName: 'cr.txt',
    groupName: null,
    messages: [],
    loading: true,
    error: null,
    progress: initialProgress(),
    datasetId: buildDatasetId('sample', 'cr.txt'),
  }));

  const loadSample = async () => {
    setState(prev => ({
      ...prev,
      kind: 'sample',
      sourceName: 'cr.txt',
      groupName: null,
      loading: true,
      error: null,
      progress: initialProgress(),
      datasetId: buildDatasetId('sample', 'cr.txt'),
    }));

    try {
      const response = await fetch('/cr.txt');
      if (!response.ok) {
        throw new Error(`Falha ao carregar ficheiro: ${response.status}`);
      }
      const text = await response.text();

      const raw: ImportedRawData = {
        format: 'txt',
        fileName: 'cr.txt',
        content: text,
      };

      const result = parseImportedRawData(raw, p => setState(prev => ({ ...prev, progress: p })));

      setState(prev => ({
        ...prev,
        groupName: result.groupName,
        messages: result.messages,
        loading: false,
        error: null,
        progress: { current: 100, total: 100, percentage: 100 },
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }));
    }
  };

  const loadImported = async (raw: ImportedRawData) => {
    setState(prev => ({
      ...prev,
      kind: 'imported',
      sourceName: raw.fileName,
      groupName: null,
      loading: true,
      error: null,
      progress: initialProgress(),
      datasetId: buildDatasetId('imported', raw.fileName),
    }));

    try {
      const result = parseImportedRawData(raw, p => setState(prev => ({ ...prev, progress: p })));

      setState(prev => ({
        ...prev,
        groupName: result.groupName,
        messages: result.messages,
        loading: false,
        error: null,
        progress: { current: 100, total: 100, percentage: 100 },
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }));
    }
  };

  useEffect(() => {
    const stored = loadStoredRaw();
    if (stored) {
      void loadImported(stored);
      return;
    }
    void loadSample();
  }, []);

  const importFile = async (file: File) => {
    const format = detectFormatFromFileName(file.name);
    const content = await readFileAsText(file);

    const raw: ImportedRawData = {
      format,
      fileName: file.name,
      content,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    await loadImported(raw);
  };

  const resetToSample = async () => {
    localStorage.removeItem(STORAGE_KEY);
    await loadSample();
  };

  const value = useMemo<DataSourceContextType>(() => ({
    ...state,
    importFile,
    resetToSample,
  }), [state]);

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const ctx = useContext(DataSourceContext);
  if (!ctx) throw new Error('useDataSource must be used within a DataSourceProvider');
  return ctx;
}
