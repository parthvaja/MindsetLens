'use client';

import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getStudent } from '@/lib/api/students';
import { getMindsetTrends, getRecommendations, getNotes } from '@/lib/api/analytics';
import { getSurveys } from '@/lib/api/surveys';
import { SkeletonDetailPage } from '@/components/ui/Skeleton';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import TrendChart from '@/components/charts/TrendChart';
import RecommendationsList from '@/components/recommendations/RecommendationsList';
import TeachingAssistantChat from '@/components/recommendations/TeachingAssistantChat';
import NoteCard from '@/components/notes/NoteCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowLeft, RefreshCw, ClipboardList, PenLine,
  Calendar, Hash, TrendingUp, Sparkles, StickyNote, User,
} from 'lucide-react';
import { formatDate, formatRelativeDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  'from-cyan-500/20 to-sky-500/20 border-cyan-500/20 text-cyan-300',
  'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-300',
  'from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-300',
];

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

  const { data: recsData, isFetching: recsFetching } = useQuery({
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
        <p className="text-zinc-500 mb-4">Student not found.</p>
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
    student.latest_classification === 'growth' ? '#10b981' :
    student.latest_classification === 'mixed' ? '#f59e0b' : '#f43f5e';

  const avatarColorClass = AVATAR_COLORS[0];

  // Circular progress ring
  const score = student.latest_mindset_score ? Number(student.latest_mindset_score) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back nav */}
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft size={12} />
        Back to Students
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              'w-14 h-14 rounded-2xl bg-gradient-to-br border flex items-center justify-center text-xl font-bold',
              avatarColorClass
            )}>
              {student.first_name[0]}{student.last_name[0]}
            </div>
            {student.latest_classification && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 shadow-[0_0_6px_currentColor]"
                style={{ backgroundColor: scoreColor }}
              />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-heading font-semibold text-zinc-50 tracking-tight">
              {student.full_name}
            </h1>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
              <MindsetBadge
                classification={student.latest_classification}
                score={student.latest_mindset_score !== null ? Number(student.latest_mindset_score) : null}
                size="sm"
              />
              {student.grade_level && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <Hash size={10} />Grade {student.grade_level}
                </span>
              )}
              {student.age && (
                <span className="text-xs text-zinc-500">Age {student.age}</span>
              )}
              {student.last_assessed && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <Calendar size={10} />{formatRelativeDate(student.last_assessed)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link href={`/dashboard/students/${id}/notes`}>
            <Button variant="secondary" size="sm">
              <PenLine size={12} />Observe
            </Button>
          </Link>
          <Link href={`/dashboard/students/${id}/survey`}>
            <Button variant="primary" size="sm">
              <ClipboardList size={12} />{student.last_assessed ? 'New Survey' : 'Start Survey'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — score + history */}
        <div className="lg:col-span-1 space-y-4">
          {/* Score card */}
          <div className={cn(
            'bg-zinc-900 rounded-xl border ring-1 ring-transparent p-5',
            student.latest_classification === 'growth' ? 'border-emerald-500/20' :
            student.latest_classification === 'mixed' ? 'border-amber-500/20' :
            student.latest_classification === 'fixed' ? 'border-rose-500/20' :
            'border-zinc-800'
          )}>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">
              Current Mindset
            </p>

            {student.latest_mindset_score !== null ? (
              <>
                {/* Circular progress */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                      <circle
                        cx="48" cy="48" r={radius} fill="none"
                        stroke={scoreColor} strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{
                          transition: 'stroke-dashoffset 1s ease-out',
                          filter: `drop-shadow(0 0 6px ${scoreColor}60)`,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor }}>
                        {score.toFixed(0)}
                      </span>
                      <span className="text-[10px] text-zinc-600">/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <MindsetBadge
                    classification={student.latest_classification}
                    score={Number(student.latest_mindset_score)}
                    size="md"
                  />
                </div>

                <p className="text-xs text-zinc-600 text-center">
                  {surveys.length} survey{surveys.length !== 1 ? 's' : ''} completed
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-500 text-sm mb-3">No assessment yet</p>
                <Link href={`/dashboard/students/${id}/survey`}>
                  <Button variant="primary" size="sm">Start First Survey</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Survey history */}
          {surveys.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                Survey History
              </p>
              <div className="space-y-0">
                {surveys.slice(0, 5).map((s, i) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center py-2.5 border-b border-zinc-800/60 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-medium text-zinc-300 capitalize">{s.survey_type}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{formatDate(s.created_at)}</p>
                    </div>
                    <MindsetBadge
                      classification={s.mindset_classification}
                      score={Number(s.growth_mindset_score)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile notes */}
          {student.notes && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                Profile Notes
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">{student.notes}</p>
            </div>
          )}
        </div>

        {/* Right column — tabs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Trend chart */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">
              Mindset Trend
            </p>
            <TrendChart trends={trends} />
          </div>

          {/* Tabbed content */}
          <Tabs defaultValue="recommendations">
            <TabsList className="w-full grid grid-cols-3 mb-0">
              <TabsTrigger value="recommendations" className="gap-1.5">
                <Sparkles size={12} />Recommendations
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5">
                <StickyNote size={12} />Notes
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-1.5">
                <User size={12} />AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                      Teaching Recommendations
                    </p>
                    {recommendations.length > 0 && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">AI-generated · Claude Sonnet 4.6</p>
                    )}
                  </div>
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['recommendations', id] })}
                    disabled={recsFetching}
                    title="Refresh recommendations"
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-all disabled:opacity-40"
                  >
                    <RefreshCw size={12} className={recsFetching ? 'animate-spin' : ''} />
                  </button>
                </div>
                <RecommendationsList recommendations={recommendations} lastAssessed={student.last_assessed} />
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Recent Observations
                  </p>
                  <Link
                    href={`/dashboard/students/${id}/notes`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    {recentNotes.length > 0 ? 'View all →' : 'Add observation →'}
                  </Link>
                </div>
                {recentNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-zinc-500 text-sm mb-3">No observations yet.</p>
                    <Link href={`/dashboard/students/${id}/notes`}>
                      <Button variant="secondary" size="sm">
                        <PenLine size={12} />Add Observation
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentNotes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                {student.last_assessed ? (
                  <TeachingAssistantChat studentId={id} studentName={student.first_name} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-500 text-sm">Complete a survey first to unlock the AI assistant.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
