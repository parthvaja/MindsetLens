import { TeachingRecommendation } from '@/types/api.types';
import { categoryIcon } from '@/lib/utils/formatters';

interface RecommendationCardProps {
  rec: TeachingRecommendation;
}

const categoryColors: Record<string, string> = {
  communication: 'bg-blue-50 border-blue-200',
  feedback: 'bg-purple-50 border-purple-200',
  challenge: 'bg-emerald-50 border-emerald-200',
  motivation: 'bg-amber-50 border-amber-200',
  general: 'bg-gray-50 border-gray-200',
};

export default function RecommendationCard({ rec }: RecommendationCardProps) {
  const confidencePct = Math.round(rec.confidence_score * 100);
  const colorClass = categoryColors[rec.category] || categoryColors.general;

  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl">{categoryIcon(rec.category)}</span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {rec.category}
            </span>
            <p className="mt-1 text-sm text-gray-800 leading-relaxed">{rec.recommendation_text}</p>
          </div>
        </div>
        <span className="flex-shrink-0 text-xs font-medium text-gray-400">{confidencePct}%</span>
      </div>
    </div>
  );
}
