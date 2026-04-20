'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getStudyPlan, chatWithStudyPlan } from '@/lib/api/studyplans';
import {
  BookOpen, Clock, Users, ChevronDown, ChevronUp,
  Printer, ArrowLeft, Sparkles, SendHorizonal, X, Loader2,
} from 'lucide-react';
import { PlanSection, StudentCallout, ChatMessage } from '@/types/studyplan.types';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';

// ── Student colour palette ────────────────────────────────────────────────────

const STUDENT_COLORS = [
  { bg: 'bg-indigo-500/15',  text: 'text-indigo-300',  border: 'border-indigo-500/25',  dot: 'bg-indigo-400'  },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/25',   dot: 'bg-amber-400'   },
  { bg: 'bg-violet-500/15',  text: 'text-violet-300',  border: 'border-violet-500/25',  dot: 'bg-violet-400'  },
  { bg: 'bg-rose-500/15',    text: 'text-rose-300',    border: 'border-rose-500/25',    dot: 'bg-rose-400'    },
];

function useStudentColors(names: string[]) {
  const map: Record<string, typeof STUDENT_COLORS[0]> = {};
  names.forEach((name, i) => {
    map[name] = STUDENT_COLORS[i % STUDENT_COLORS.length];
  });
  return map;
}

// ── Section icon map ──────────────────────────────────────────────────────────

const SECTION_META: Record<string, { emoji: string; accent: string }> = {
  opening:         { emoji: '🌟', accent: 'from-amber-500/20 to-orange-500/20 border-amber-500/20' },
  mindset_checkin: { emoji: '🧠', accent: 'from-violet-500/20 to-purple-500/20 border-violet-500/20' },
  main_content:    { emoji: '📚', accent: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20' },
  practice:        { emoji: '✏️', accent: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20' },
  closing:         { emoji: '🎯', accent: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/20' },
  teacher_notes:   { emoji: '📝', accent: 'from-slate-500/20 to-gray-500/20 border-slate-500/20' },
};

const CALLOUT_LABELS: Record<string, string> = {
  approach:      'Teaching Approach',
  questioning:   'Questioning Strategy',
  task:          'Adapted Task',
  reinforcement: 'Positive Reinforcement',
  takeaway:      'Takeaway Task',
  watch_for:     'Watch For',
  trigger:       'Potential Trigger',
};

// ── Student Badge ─────────────────────────────────────────────────────────────

function StudentBadge({ name, colorMap }: { name: string; colorMap: Record<string, typeof STUDENT_COLORS[0]> }) {
  const colors = colorMap[name] ?? STUDENT_COLORS[0];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
        colors.bg, colors.text, colors.border,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {name}
    </span>
  );
}

// ── Callout Card ──────────────────────────────────────────────────────────────

function CalloutCard({
  callout,
  colorMap,
}: {
  callout: StudentCallout;
  colorMap: Record<string, typeof STUDENT_COLORS[0]>;
}) {
  const colors = colorMap[callout.student_name] ?? STUDENT_COLORS[0];
  const label = CALLOUT_LABELS[callout.type] ?? callout.type;
  return (
    <div
      className={cn(
        'rounded-xl border p-3.5 space-y-1.5',
        colors.bg, colors.border,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <StudentBadge name={callout.student_name} colorMap={colorMap} />
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider', colors.text)}>
          {label}
        </span>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{callout.content}</p>
    </div>
  );
}

// ── Section Block ─────────────────────────────────────────────────────────────

function SectionBlock({
  section,
  colorMap,
  defaultOpen = true,
}: {
  section: PlanSection;
  colorMap: Record<string, typeof STUDENT_COLORS[0]>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = SECTION_META[section.id] ?? { emoji: '📌', accent: 'from-slate-500/10 to-slate-500/10 border-slate-500/15' };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden print:break-inside-avoid">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-[var(--surface-2)] transition-colors text-left"
      >
        <div
          className={cn(
            'w-9 h-9 rounded-xl bg-gradient-to-br border flex items-center justify-center text-lg shrink-0',
            meta.accent,
          )}
        >
          <span role="img" aria-hidden>{meta.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--text-primary)]">{section.title}</p>
          {section.duration && (
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <Clock size={10} />
              {section.duration}
            </p>
          )}
        </div>
        <div className="shrink-0 text-[var(--text-muted)]">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Section body */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)]">
          {/* Main narrative */}
          {section.content && (
            <p className="pt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              {section.content}
            </p>
          )}

          {/* Concept chunks (main_content only) */}
          {section.chunks && section.chunks.length > 0 && (
            <div className="space-y-4">
              {section.chunks.map((chunk, ci) => (
                <div
                  key={ci}
                  className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    {chunk.title}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {chunk.explanation}
                  </p>
                  {chunk.student_callouts && chunk.student_callouts.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {chunk.student_callouts.map((c, ci2) => (
                        <CalloutCard key={ci2} callout={c} colorMap={colorMap} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Per-student callouts */}
          {section.student_callouts && section.student_callouts.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {section.student_callouts.map((c, ci) => (
                <CalloutCard key={ci} callout={c} colorMap={colorMap} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Study Plan Chat ───────────────────────────────────────────────────────────

function StudyPlanChat({ planId }: { planId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const QUICK_PROMPTS = [
    { label: 'Early finish?', message: 'How should I handle it if the group finishes the activity early?' },
    { label: 'Frustration', message: 'What should I do if a student gets frustrated during the session?' },
    { label: 'Alt example', message: 'Can you give me an alternative example for the student with a fixed mindset?' },
    { label: 'Wrap up', message: 'How should I close the session if we run out of time?' },
  ];

  const mutation = useMutation({
    mutationFn: (msg: string) =>
      chatWithStudyPlan(
        planId,
        msg,
        messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      ),
    onSuccess: (data, msg) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: msg },
        { role: 'assistant', content: data.response },
      ]);
      setInput('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    },
    onError: () => toast.error('Failed to get a response. Please try again.'),
  });

  const send = (override?: string) => {
    const msg = override ?? input.trim();
    if (!msg) return;
    mutation.mutate(msg);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/25 flex items-center justify-center">
            <Sparkles size={11} className="text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            Session Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1 transition-colors"
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => send(p.message)}
              disabled={mutation.isPending}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-all disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="flex-1 space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                    : 'bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border)] rounded-bl-sm',
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface-3)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          placeholder="Ask anything about this session…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={mutation.isPending}
          className="flex-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 outline-none transition-all disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || mutation.isPending}
          className="shrink-0 p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
        >
          <SendHorizonal size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudyPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: plan, isLoading, isError } = useQuery({
    queryKey: ['study-plan', id],
    queryFn: () => getStudyPlan(id),
    enabled: !!id,
  });

  // Build colour map from all student names mentioned in callouts
  const studentNames: string[] = [];
  if (plan?.plan_content?.sections) {
    for (const section of plan.plan_content.sections) {
      const callouts = [
        ...(section.student_callouts ?? []),
        ...(section.chunks?.flatMap((c) => c.student_callouts) ?? []),
      ];
      for (const c of callouts) {
        if (!studentNames.includes(c.student_name)) {
          studentNames.push(c.student_name);
        }
      }
    }
  }
  const colorMap = useStudentColors(studentNames);

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-[var(--surface-3)] rounded-xl" />
        <div className="h-4 w-32 bg-[var(--surface-3)] rounded-md" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[var(--surface)] rounded-2xl border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-sm mb-4">Study plan not found or failed to load.</p>
        <button
          onClick={() => router.push('/dashboard/study-plans')}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Back to Study Plans
        </button>
      </div>
    );
  }

  const { plan_content } = plan;
  const sections = plan_content?.sections ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push('/dashboard/study-plans')}
            className="mt-0.5 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)] transition-all"
            title="Back to Study Plans"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {plan.topic}
            </h1>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Users size={11} />
                {plan.student_count} student{plan.student_count !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Clock size={11} />
                {plan.duration_minutes} minutes
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Created {formatRelativeDate(plan.created_at)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all print:hidden"
        >
          <Printer size={13} />
          Print
        </button>
      </div>

      {/* Student colour legend */}
      {studentNames.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            Students:
          </span>
          {studentNames.map((name) => (
            <StudentBadge key={name} name={name} colorMap={colorMap} />
          ))}
        </div>
      )}

      {/* Context notes */}
      {plan.context_notes && (
        <div className="px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
            Teacher notes:
          </span>{' '}
          {plan.context_notes}
        </div>
      )}

      {/* Two-column layout: plan on left, chat on right */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Plan sections */}
        <div className="space-y-3 print:space-y-4">
          {sections.map((section, i) => (
            <SectionBlock
              key={section.id}
              section={section}
              colorMap={colorMap}
              defaultOpen={i < 3}
            />
          ))}
        </div>

        {/* Chat sidebar */}
        <div className="print:hidden xl:sticky xl:top-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <StudyPlanChat planId={plan.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
