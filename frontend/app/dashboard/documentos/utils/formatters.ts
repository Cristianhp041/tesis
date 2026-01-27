export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getFilenameFromUrl(url: string): string {
  const parts = url.split(/[/\\]/);
  return parts[parts.length - 1] || '';
}

export function formatMonthYear(monthString: string): string {
  if (!monthString || monthString === 'Sin mes') {
    return 'Sin mes asignado';
  }

  if (/^\d{4}-\d{2}$/.test(monthString)) {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  }

  try {
    const date = new Date(monthString);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long'
      }).format(date);
    }
  } catch {
    return monthString;
  }

  return monthString;
}