import type { ParseProgress } from '../types';

interface LoadingProgressProps {
  progress: ParseProgress;
}

export function LoadingProgress({ progress }: LoadingProgressProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          A carregar dados...
        </h2>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        
        <p className="text-center text-gray-600 dark:text-gray-400">
          {progress.percentage}%
        </p>
      </div>
    </div>
  );
}
