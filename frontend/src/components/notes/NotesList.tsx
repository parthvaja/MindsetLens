'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { TeacherNote } from '@/types/api.types';
import { deleteNote } from '@/lib/api/analytics';
import NoteCard from './NoteCard';

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
      <p className="text-sm text-gray-400 text-center py-6">
        No observations yet. Add one above to trigger updated AI recommendations.
      </p>
    );
  }

  return (
    <div className="space-y-3">
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
