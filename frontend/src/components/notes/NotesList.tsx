'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { TeacherNote } from '@/types/api.types';
import { deleteNote } from '@/lib/api/analytics';
import NoteCard from './NoteCard';
import { StickyNote } from 'lucide-react';

interface NotesListProps {
  notes: TeacherNote[];
  studentId: string;
}

export default function NotesList({ notes, studentId }: NotesListProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      toast.success('Note deleted.');
      queryClient.invalidateQueries({ queryKey: ['notes', studentId] });
    },
    onError: () => {
      toast.error('Failed to delete note.');
    },
  });

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <StickyNote size={15} className="text-zinc-500" />
        </div>
        <p className="text-sm text-zinc-500">
          No observations yet. Add one to trigger updated AI recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ))}
    </div>
  );
}
