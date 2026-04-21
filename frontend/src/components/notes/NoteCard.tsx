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
): { label: string; dotColor: string; badgeClass: string } => {
  if (score === null) return { label: 'Neutral', dotColor: 'bg-zinc-500', badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
  if (score > 0.2) return { label: 'Positive', dotColor: 'bg-emerald-400', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' };
  if (score < -0.2) return { label: 'Negative', dotColor: 'bg-rose-400', badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/25' };
  return { label: 'Neutral', dotColor: 'bg-zinc-500', badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
};

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const sentiment = sentimentConfig(note.sentiment_score);

  return (
    <div className="bg-zinc-800/40 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Timeline dot */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className={cn('w-2 h-2 rounded-full shrink-0', sentiment.dotColor)} />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap flex-1">
              {note.note_text}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pl-5">
            <span className="text-[10px] text-zinc-600">{formatDate(note.observation_date)}</span>

            {note.sentiment_score !== null && (
              <>
                <span className="text-zinc-700 text-xs">·</span>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
                  sentiment.badgeClass
                )}>
                  {sentiment.label}
                </span>
              </>
            )}

            {note.detected_themes.length > 0 && (
              <>
                <span className="text-zinc-700 text-xs">·</span>
                <div className="flex flex-wrap gap-1">
                  {note.detected_themes.map((theme) => (
                    <span
                      key={theme}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/8 text-cyan-400 border border-cyan-500/20 font-medium"
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
            className="shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Delete note"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
