/** Theme-aware utility classes for status badges, alerts, and stat icons */

export type StatusTone = 'success' | 'warning' | 'destructive' | 'info' | 'neutral';

export function statusBadgeClass(tone: StatusTone): string {
  const map: Record<StatusTone, string> = {
    success: 'bg-success/15 text-success border border-success/25',
    warning: 'bg-warning/15 text-warning border border-warning/25',
    destructive: 'bg-destructive/15 text-destructive border border-destructive/25',
    info: 'bg-info/15 text-info border border-info/25',
    neutral: 'bg-muted text-muted-foreground border border-border',
  };
  return map[tone];
}

export function userRoleBadge(role: string): string {
  if (role === 'ADMIN') return statusBadgeClass('info');
  if (role === 'VENDOR') return statusBadgeClass('success');
  return statusBadgeClass('neutral');
}

export function userStatusBadge(status: string): string {
  return status === 'ACTIVE' ? statusBadgeClass('success') : statusBadgeClass('destructive');
}

export function propertyStatusBadge(status: string): string {
  switch (status) {
    case 'APPROVED':
      return statusBadgeClass('success');
    case 'PENDING':
      return statusBadgeClass('warning');
    case 'REJECTED':
      return statusBadgeClass('destructive');
    default:
      return statusBadgeClass('neutral');
  }
}

export function alertBoxClass(tone: StatusTone = 'destructive'): string {
  return `p-4 rounded-lg text-center font-medium ${statusBadgeClass(tone)}`;
}

export const statIconColors = {
  primary: 'text-primary',
  accent: 'text-accent',
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
} as const;

export function typeSectionClass(tone: 'info' | 'success' | 'warning'): string {
  const map = {
    info: 'space-y-4 p-6 rounded-xl border-2 bg-info/10 border-info/30',
    success: 'space-y-4 p-6 rounded-xl border-2 bg-success/10 border-success/30',
    warning: 'space-y-4 p-6 rounded-xl border-2 bg-warning/10 border-warning/30',
  };
  return map[tone];
}

export function typeSectionTitleClass(tone: 'info' | 'success' | 'warning'): string {
  const map = {
    info: 'text-lg font-semibold text-info',
    success: 'text-lg font-semibold text-success',
    warning: 'text-lg font-semibold text-warning',
  };
  return map[tone];
}
