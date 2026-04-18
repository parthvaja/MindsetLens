import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { MindsetClassification } from '@/types/student.types';

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

export function formatRelativeDate(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

export function formatScore(score: number | null): string {
  if (score === null) return '—';
  return score.toFixed(1);
}

export function classificationLabel(c: MindsetClassification | null): string {
  if (!c) return 'Not assessed';
  return c.charAt(0).toUpperCase() + c.slice(1) + ' Mindset';
}

export function classificationColor(c: MindsetClassification | null): string {
  switch (c) {
    case 'growth': return 'text-emerald-700 bg-emerald-100';
    case 'mixed': return 'text-amber-700 bg-amber-100';
    case 'fixed': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

export function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-500';
  if (score >= 70) return 'text-emerald-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    communication: '💬',
    feedback: '📝',
    challenge: '🎯',
    motivation: '⚡',
    general: '📚',
  };
  return icons[category] ?? '📌';
}
