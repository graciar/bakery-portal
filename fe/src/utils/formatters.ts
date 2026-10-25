/**
 * Format currency in Indonesian Rupiah (IDR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date string into human readable localized date and time
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Convert string to Title Case (e.g. 'DKI JAKARTA' -> 'DKI Jakarta', 'KOTA JAKARTA SELATAN' -> 'Kota Jakarta Selatan')
 */
export function toTitleCase(str: string): string {
  if (!str) return ''
  
  // Specific acronyms to keep uppercase
  const acronyms = new Set(['DKI', 'DI'])

  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      const upper = word.toUpperCase()
      if (acronyms.has(upper)) return upper
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Normalize location text for resilient fuzzy comparison between external API names and database store names
 */
export function cleanLocationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(daerah khusus ibukota|kota administrasi|kabupaten administrasi|kota|kabupaten|provinsi|dki)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

