import type { UserStats } from '../types';
import { useFilter } from '../context/FilterContext';
import { formatTime } from '../utils/dateUtils';

interface UserDetailsPanelProps {
  allUserStats: UserStats[];
}

export function UserDetailsPanel({ allUserStats }: UserDetailsPanelProps) {
  const { selectedUsers } = useFilter();

  if (selectedUsers.length === 0) return null;

  const selectedStats = selectedUsers
    .map(name => allUserStats.find(u => u.name === name))
    .filter((u): u is UserStats => Boolean(u));

  if (selectedStats.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informação do Utilizador
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedStats.length === 1 ? selectedStats[0].name : `${selectedStats.length} selecionados`}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {selectedStats.map(stats => (
          <div key={stats.name} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats.name}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Mensagens enviadas</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.messageCount}</p>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Respostas recebidas</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.repliesReceived}</p>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Tempo médio de resposta</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatTime(stats.avgResponseTime)}</p>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Iniciações</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.initiations}</p>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Respostas</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.responses}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
