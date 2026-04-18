import Badge from '@/components/ui/Badge';
import { MindsetClassification } from '@/types/student.types';

interface MindsetBadgeProps {
  classification: MindsetClassification | null;
  score?: number | null;
}

export default function MindsetBadge({ classification, score }: MindsetBadgeProps) {
  if (!classification) {
    return <Badge variant="gray">Not assessed</Badge>;
  }

  const variant = classification as 'growth' | 'mixed' | 'fixed';
  const label = classification.charAt(0).toUpperCase() + classification.slice(1);

  return (
    <Badge variant={variant}>
      {label}{score !== undefined && score !== null ? ` · ${score.toFixed(0)}` : ''}
    </Badge>
  );
}
