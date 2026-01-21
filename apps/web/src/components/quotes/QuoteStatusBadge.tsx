import { Badge } from '@/components/ui/badge';
import type { QuoteStatus } from '@csz/types';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
}

const statusConfig: Record<QuoteStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Függőben', variant: 'secondary' },
  quoted: { label: 'Árajánlat kész', variant: 'default' },
  converted: { label: 'Elfogadva', variant: 'default' },
  declined: { label: 'Elutasítva', variant: 'destructive' },
  expired: { label: 'Lejárt', variant: 'outline' },
};

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
