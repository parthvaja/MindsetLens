import { TeachingRecommendation } from '@/types/api.types';
import RecommendationCard from './RecommendationCard';

interface RecommendationsListProps {
  recommendations: TeachingRecommendation[];
  lastAssessed: string | null;
}

export default function RecommendationsList({
  recommendations,
  lastAssessed,
}: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {lastAssessed
          ? 'AI recommendations are being generated…'
          : 'Complete a survey to receive AI-generated teaching recommendations.'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
    </div>
  );
}
