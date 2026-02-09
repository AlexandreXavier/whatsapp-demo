interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Como exportar o chat do WhatsApp
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Android</h4>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Abrir o grupo no WhatsApp</li>
              <li>Carregar nos 3 pontos (menu) e escolher <strong>Mais</strong></li>
              <li>Escolher <strong>Exportar conversa</strong></li>
              <li>Selecionar <strong>Sem multimédia</strong></li>
              <li>Guardar/partilhar o ficheiro <strong>.txt</strong> para o computador</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">iPhone (iOS)</h4>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Abrir o grupo no WhatsApp</li>
              <li>Carregar no nome do grupo (topo)</li>
              <li>Descer e escolher <strong>Exportar conversa</strong></li>
              <li>Selecionar <strong>Sem multimédia</strong></li>
              <li>Guardar/partilhar o ficheiro <strong>.txt</strong> para o computador</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Como carregar aqui</h4>
            <ol className="list-decimal ml-5 space-y-1">
              <li>No topo do dashboard, clicar em <strong>Escolher ficheiro</strong></li>
              <li>Selecionar o ficheiro (.txt, .json ou .csv)</li>
              <li>Clicar em <strong>Importar</strong></li>
            </ol>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Nota: os dados ficam no teu browser (localStorage) para funcionar offline.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
