'use client'

import * as React from 'react'
import { useState } from 'react'
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react'; // Replacing SVGs with Lucide

// Enhanced AppInput to support React Hook Form refs
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const AppInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder, icon, error, ...props }, ref) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
      <div className="w-full min-w-[200px] relative">
        {label && <label className='block mb-2 text-sm text-[var(--color-text-primary)]'>{label}</label>}
        <div className="relative w-full">
          <input
            ref={ref}
            className="peer relative z-10 border-2 border-[var(--color-border)] h-12 w-full rounded-md bg-[var(--color-surface)] px-4 text-[var(--color-text-primary)] outline-none transition-all duration-200 focus:bg-[var(--color-bg)]"
            placeholder={placeholder}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            {...props}
          />
          {isHovering && (
            <div className="absolute pointer-events-none inset-0 z-20 rounded-md overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, var(--color-text-primary) 0%, transparent 70%)` }} />
               <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `radial-gradient(40px circle at ${mousePosition.x}px 2px, var(--color-text-primary) 0%, transparent 70%)` }} />
            </div>
          )}
          {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-[var(--color-text-secondary)]">{icon}</div>}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
AppInput.displayName = "AppInput";

export { AppInput };