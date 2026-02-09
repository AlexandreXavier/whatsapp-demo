import { useFilter } from '../context/FilterContext';

export function FilterControls() {
  const { selectedUsers, clearFilters } = useFilter();

  if (selectedUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <span className="text-sm text-blue-700 dark:text-blue-300">
        Filtrado por: <strong>{selectedUsers.join(', ')}</strong>
      </span>
      <button
        onClick={clearFilters}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Limpar Filtros
      </button>
    </div>
  );
}
