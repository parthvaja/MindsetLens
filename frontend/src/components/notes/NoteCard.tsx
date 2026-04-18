import { TeacherNote } from '@/types/api.types';
import { formatDate } from '@/lib/utils/formatters';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: TeacherNote;
  onDelete?: (id: string) => void;
}

const sentimentConfig = (
  score: number | null
): { label: string; color: string; bg: string } => {
  if (score === null) return { label: 'Neutral', color: 'text-[var(--text-muted)]', bg: '' };
  if (score > 0.2)
    return { label: 'Positive', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score < -0.2)
    return { label: 'Negative', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  return { label: 'Neutral', color: 'text-[var(--text-muted)]', bg: 'bg-[var(--surface-2)] border-[var(--border)]' };
};

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const sentiment = sentimentConfig(note.sentiment_score);

  return (
    <div className="bg-[var(--surface-2)] rounded-xl border border-[var(--border)] p-4 hover:border-[var(--surface-3)] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {note.note_text}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[10px] text-[var(--text-muted)]">
              {formatDate(note.observation_date)}
            </span>

            {note.sentiment_score !== null && (
              <>
                <span className="text-[var(--border)] text-xs">·</span>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
                    sentiment.bg || 'bg-[var(--surface)] border-[var(--border)]',
                    sentiment.color
                  )}
                >
                  {sentiment.label}
                </span>
              </>
            )}

            {note.detected_themes.length > 0 && (
              <>
                <span className="text-[var(--border)] text-xs">·</span>
                <div className="flex flex-wrap gap-1">
                  {note.detected_themes.map((theme) => (
                    <span
                      key={theme}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium"
                    >
                      {theme.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="shrink-0 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete note"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
