import { TeacherNote } from '@/types/api.types';
import { formatDate } from '@/lib/utils/formatters';
import { TrashIcon } from '@heroicons/react/24/outline';

interface NoteCardProps {
  note: TeacherNote;
  onDelete?: (id: string) => void;
}

const sentimentLabel = (score: number | null): { label: string; color: string } => {
  if (score === null) return { label: 'Neutral', color: 'text-gray-400' };
  if (score > 0.2) return { label: 'Positive', color: 'text-emerald-600' };
  if (score < -0.2) return { label: 'Negative', color: 'text-red-500' };
  return { label: 'Neutral', color: 'text-gray-500' };
};

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const sentiment = sentimentLabel(note.sentiment_score);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {note.note_text}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">{formatDate(note.observation_date)}</span>

            {note.sentiment_score !== null && (
              <>
                <span className="text-gray-200">·</span>
                <span className={`text-xs font-medium ${sentiment.color}`}>
                  {sentiment.label}
                </span>
              </>
            )}

            {note.detected_themes.length > 0 && (
              <>
                <span className="text-gray-200">·</span>
                <div className="flex flex-wrap gap-1">
                  {note.detected_themes.map((theme) => (
                    <span
                      key={theme}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 font-medium"
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
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete note"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
