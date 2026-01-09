import { cn } from '@/lib/utils';

type Status = 'compliant' | 'due_soon' | 'overdue' | 'missing' | 'complete' | 'in_progress' | 'not_started' | 'awaiting_signoff';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  compliant: {
    label: 'Compliant',
    className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  },
  complete: {
    label: 'Complete',
    className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  },
  due_soon: {
    label: 'Due Soon',
    className: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  },
  awaiting_signoff: {
    label: 'Awaiting Sign-off',
    className: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-500/15 text-red-700 border-red-500/30',
  },
  missing: {
    label: 'Missing',
    className: 'bg-gray-500/15 text-gray-600 border-gray-500/30',
  },
  not_started: {
    label: 'Not Started',
    className: 'bg-gray-500/15 text-gray-600 border-gray-500/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      data-testid={`status-${status}`}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
