'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Users,
  BookOpen,
  Settings,
  Plus,
  Search,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate('/dashboard')}>
            <Home className="h-4 w-4 text-zinc-400" />
            Dashboard
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/dashboard/students')}>
            <Users className="h-4 w-4 text-zinc-400" />
            Students
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/dashboard/study-plans')}>
            <BookOpen className="h-4 w-4 text-zinc-400" />
            Study Plans
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/dashboard/settings')}>
            <Settings className="h-4 w-4 text-zinc-400" />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigate('/dashboard/students/new')}>
            <Plus className="h-4 w-4 text-cyan-400" />
            Add New Student
          </CommandItem>
          <CommandItem onSelect={() => navigate('/dashboard/students')}>
            <Search className="h-4 w-4 text-zinc-400" />
            Search Students
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
