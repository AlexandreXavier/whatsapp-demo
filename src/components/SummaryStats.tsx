import type { SummaryData } from '../types';
import { formatDate } from '../utils/dateUtils';

interface SummaryStatsProps {
  data: SummaryData;
}

export function SummaryStats({ data }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Mensagens</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalMessages.toLocaleString('pt-PT')}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Participantes</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalParticipants}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Período</h3>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dia Mais Ativo</h3>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {formatDate(data.mostActiveDay.date)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.mostActiveDay.count} mensagens
        </p>
      </div>
    </div>
  );
}
