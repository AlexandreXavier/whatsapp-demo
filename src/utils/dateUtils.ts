const DATE_PATTERNS = [
  /^(\d{2})\/(\d{2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
  /^(\d{2})-(\d{2})-(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
  /^(\d{4})-(\d{2})-(\d{2}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
  /^\[(\d{2})\/(\d{2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\]/,
];

export function parseDate(dateStr: string): Date | null {
  for (const pattern of DATE_PATTERNS) {
    const match = dateStr.match(pattern);
    if (match) {
      let day: number, month: number, year: number;
      const hours = parseInt(match[4], 10);
      const minutes = parseInt(match[5], 10);
      const seconds = match[6] ? parseInt(match[6], 10) : 0;

      if (pattern === DATE_PATTERNS[2]) {
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10) - 1;
        day = parseInt(match[3], 10);
      } else {
        day = parseInt(match[1], 10);
        month = parseInt(match[2], 10) - 1;
        year = parseInt(match[3], 10);
        if (year < 100) {
          year += 2000;
        }
      }

      const date = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  return null;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}min`;
  } else if (seconds < 86400) {
    return `${(seconds / 3600).toFixed(1)}h`;
  } else {
    return `${(seconds / 86400).toFixed(1)}d`;
  }
}

export function getDayName(dayIndex: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[dayIndex];
}

export function getMonthName(monthIndex: number): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[monthIndex];
}
