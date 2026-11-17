export function useFormatters() {
  function formatPrice(amount, currency = 'USD') {
    const val = Number(amount || 0);
    if (val === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: val % 1 === 0 ? 0 : 2
    }).format(val);
  }

  function formatDuration(seconds) {
    const total = Number(seconds || 0);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  function formatDate(dateInput) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatDateTime(dateInput) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return {
    formatPrice,
    formatDuration,
    formatDate,
    formatDateTime
  };
}
