import { TeachingRecommendation } from '@/types/api.types';
import RecommendationCard from './RecommendationCard';
import { Sparkles } from 'lucide-react';
import { OrbitalLoader } from '@/components/ui/orbital-loader';

interface RecommendationsListProps {
  recommendations: TeachingRecommendation[];
  lastAssessed: string | null;
}

export default function RecommendationsList({
  recommendations,
  lastAssessed,
}: RecommendationsListProps) {
  if (recommendations.length === 0) {
    if (lastAssessed) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <OrbitalLoader size="sm" message="Generating recommendations…" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
          <Sparkles size={16} className="text-[var(--text-muted)]" />
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Complete a survey to receive AI-generated teaching recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
    </div>
  );
}
