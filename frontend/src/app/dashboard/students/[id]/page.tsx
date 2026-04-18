'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getStudent } from '@/lib/api/students';
import { getMindsetTrends, getRecommendations, getNotes } from '@/lib/api/analytics';
import { getSurveys } from '@/lib/api/surveys';
import Card from '@/components/ui/Card';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import TrendChart from '@/components/charts/TrendChart';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import { ArrowLeftIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { formatDate, formatRelativeDate } from '@/lib/utils/formatters';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
  });

  const { data: trendsData } = useQuery({
    queryKey: ['trends', id],
    queryFn: () => getMindsetTrends(id),
    enabled: !!student,
  });

  const { data: recsData } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: () => getRecommendations(id),
    enabled: !!student,
  });

  const { data: surveysData } = useQuery({
    queryKey: ['surveys', id],
    queryFn: () => getSurveys(id),
    enabled: !!student,
  });

  if (studentLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Student not found.</p>
        <Link href="/dashboard/students">
          <Button variant="secondary" className="mt-4">Back to Students</Button>
        </Link>
      </div>
    );
  }

  const trends = trendsData?.results ?? [];
  const recommendations = recsData?.results ?? [];
  const surveys = surveysData?.results ?? [];

  return (
    <div>
      {/* Back nav */}
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Students
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              {student.grade_level && <span>Grade {student.grade_level}</span>}
              {student.age && <><span>·</span><span>Age {student.age}</span></>}
              {student.last_assessed && (
                <><span>·</span><span>Assessed {formatRelativeDate(student.last_assessed)}</span></>
              )}
            </div>
          </div>
        </div>

        <Link href={`/dashboard/students/${id}/survey`}>
          <Button>
            <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
            {student.last_assessed ? 'New Survey' : 'Start Survey'}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mindset Score Card */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Current Mindset
            </h2>
            {student.latest_mindset_score !== null ? (
              <>
                <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-gray-800">
                    {Number(student.latest_mindset_score).toFixed(0)}
                  </span>
                  <span className="text-gray-400 text-lg">/100</span>
                </div>
                <div className="flex justify-center mb-4">
                  <MindsetBadge
                    classification={student.latest_classification}
                    score={Number(student.latest_mindset_score)}
                  />
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${student.latest_mindset_score}%`,
                      backgroundColor:
                        student.latest_classification === 'growth'
                          ? '#10b981'
                          : student.latest_classification === 'mixed'
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  {surveys.length} survey{surveys.length !== 1 ? 's' : ''} completed
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">No assessment yet</p>
                <Link href={`/dashboard/students/${id}/survey`}>
                  <Button size="sm">Start First Survey</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Survey History */}
          {surveys.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Survey History
              </h2>
              <div className="space-y-2">
                {surveys.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-gray-700 capitalize">{s.survey_type}</p>
                      <p className="text-xs text-gray-400">{formatDate(s.created_at)}</p>
                    </div>
                    <MindsetBadge
                      classification={s.mindset_classification}
                      score={Number(s.growth_mindset_score)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Chart */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Mindset Trend
            </h2>
            <TrendChart trends={trends} />
          </Card>

          {/* AI Recommendations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Teaching Recommendations
              </h2>
              {recommendations.length > 0 && (
                <span className="text-xs text-gray-400">AI-generated</span>
              )}
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {student.last_assessed
                  ? 'Recommendations are being generated…'
                  : 'Complete a survey to receive AI-generated teaching recommendations.'}
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            )}
          </Card>

          {/* Student Notes */}
          {student.notes && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Profile Notes
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{student.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
