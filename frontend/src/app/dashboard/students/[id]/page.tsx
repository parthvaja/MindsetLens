'use client';

import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getStudent } from '@/lib/api/students';
import { getMindsetTrends, getRecommendations, getNotes } from '@/lib/api/analytics';
import { getSurveys } from '@/lib/api/surveys';
import Card from '@/components/ui/Card';
import { SkeletonDetailPage } from '@/components/ui/Skeleton';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import TrendChart from '@/components/charts/TrendChart';
import RecommendationsList from '@/components/recommendations/RecommendationsList';
import TeachingAssistantChat from '@/components/recommendations/TeachingAssistantChat';
import NoteCard from '@/components/notes/NoteCard';
import {
  ArrowLeft,
  RefreshCw,
  ClipboardList,
  PenLine,
  Calendar,
  Hash,
} from 'lucide-react';
import { formatDate, formatRelativeDate } from '@/lib/utils/formatters';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
  });

  const { data: trendsData } = useQuery({
    queryKey: ['trends', id],
    queryFn: () => getMindsetTrends(id),
    enabled: !!student,
  });

  const {
    data: recsData,
    isLoading: recsLoading,
    isFetching: recsFetching,
  } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: () => getRecommendations(id),
    enabled: !!student,
  });

  const { data: surveysData } = useQuery({
    queryKey: ['surveys', id],
    queryFn: () => getSurveys(id),
    enabled: !!student,
  });

  const { data: notesData } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => getNotes(id),
    enabled: !!student,
  });

  if (studentLoading) return <SkeletonDetailPage />;

  if (!student) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-muted)] mb-4">Student not found.</p>
        <Link href="/dashboard/students">
          <Button variant="secondary">Back to Students</Button>
        </Link>
      </div>
    );
  }

  const trends = trendsData?.results ?? [];
  const recommendations = recsData?.results ?? [];
  const surveys = surveysData?.results ?? [];
  const recentNotes = (notesData?.results ?? []).slice(0, 3);

  const scoreColor =
    student.latest_classification === 'growth'
      ? '#10b981'
      : student.latest_classification === 'mixed'
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="animate-fade-in">
      {/* Back nav */}
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6 transition-colors"
      >
        <ArrowLeft size={12} />
        Back to Students
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-300">
              {student.first_name[0]}
              {student.last_name[0]}
            </div>
            {student.latest_classification && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--bg)]"
                style={{ backgroundColor: scoreColor }}
              />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {student.full_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {student.grade_level && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Hash size={10} />
                  Grade {student.grade_level}
                </span>
              )}
              {student.age && (
                <span className="text-xs text-[var(--text-muted)]">· Age {student.age}</span>
              )}
              {student.last_assessed && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  ·
                  <Calendar size={10} />
                  {formatRelativeDate(student.last_assessed)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link href={`/dashboard/students/${id}/notes`}>
            <Button variant="secondary" size="sm">
              <PenLine size={12} className="mr-1.5" />
              Observe
            </Button>
          </Link>
          <Link href={`/dashboard/students/${id}/survey`}>
            <Button size="sm">
              <ClipboardList size={12} className="mr-1.5" />
              {student.last_assessed ? 'New Survey' : 'Start Survey'}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-5">
          {/* Mindset Score Card */}
          <Card
            glow={
              student.latest_classification === 'growth'
                ? 'green'
                : student.latest_classification === 'mixed'
                ? 'amber'
                : student.latest_classification === 'fixed'
                ? 'red'
                : 'none'
            }
          >
            <p className="section-label mb-4">Current Mindset</p>
            {student.latest_mindset_score !== null ? (
              <>
                <div className="text-center mb-4">
                  <span
                    className="text-5xl font-bold tabular-nums"
                    style={{ color: scoreColor }}
                  >
                    {Number(student.latest_mindset_score).toFixed(0)}
                  </span>
                  <span className="text-[var(--text-muted)] text-lg">/100</span>
                </div>

                <div className="flex justify-center mb-5">
                  <MindsetBadge
                    classification={student.latest_classification}
                    score={Number(student.latest_mindset_score)}
                    size="md"
                  />
                </div>

                {/* Score bar */}
                <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${student.latest_mindset_score}%`,
                      backgroundColor: scoreColor,
                      boxShadow: `0 0 8px ${scoreColor}50`,
                    }}
                  />
                </div>

                <p className="text-xs text-[var(--text-muted)] text-center">
                  {surveys.length} survey{surveys.length !== 1 ? 's' : ''} completed
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-[var(--text-muted)] text-sm mb-3">No assessment yet</p>
                <Link href={`/dashboard/students/${id}/survey`}>
                  <Button size="sm">Start First Survey</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Survey History */}
          {surveys.length > 0 && (
            <Card>
              <p className="section-label mb-4">Survey History</p>
              <div className="space-y-2">
                {surveys.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)] capitalize">
                        {s.survey_type}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {formatDate(s.created_at)}
                      </p>
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

          {/* Profile Notes */}
          {student.notes && (
            <Card>
              <p className="section-label mb-3">Profile Notes</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {student.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Trend Chart */}
          <Card>
            <p className="section-label mb-4">Mindset Trend</p>
            <TrendChart trends={trends} />
          </Card>

          {/* AI Recommendations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-label">Teaching Recommendations</p>
                {recommendations.length > 0 && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    AI-generated · Claude Sonnet
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ['recommendations', id] })
                }
                disabled={recsFetching}
                title="Refresh recommendations"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-all disabled:opacity-40"
              >
                <RefreshCw
                  size={13}
                  className={recsFetching ? 'animate-spin' : ''}
                />
              </button>
            </div>

            <RecommendationsList
              recommendations={recommendations}
              lastAssessed={student.last_assessed}
            />

            {student.last_assessed && (
              <>
                <div className="my-5 border-t border-[var(--border-subtle)]" />
                <TeachingAssistantChat
                  studentId={id}
                  studentName={student.first_name}
                />
              </>
            )}
          </Card>

          {/* Recent Observations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Recent Observations</p>
              <Link
                href={`/dashboard/students/${id}/notes`}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {recentNotes.length > 0 ? 'View all →' : 'Add observation →'}
              </Link>
            </div>

            {recentNotes.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                No observations yet.{' '}
                <Link
                  href={`/dashboard/students/${id}/notes`}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Add one
                </Link>{' '}
                to trigger updated AI recommendations.
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
