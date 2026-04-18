# MindsetLens UI Overhaul - Design Reference

## Design Philosophy
- Modern, aesthetic, polished educational platform
- Smooth animations and micro-interactions (not overdone)
- shadcn/ui component library as the base
- Tailwind CSS for styling
- Dark/light mode support
- Performance-first: lazy load heavy components, code-split animations

## Required Dependencies
```bash
npm install motion class-variance-authority @radix-ui/react-slot lucide-react gsap framer-motion clsx tailwind-merge
```

## Utility Setup
Create `src/lib/utils.ts` if not present:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Component 1: OrbitalLoader
**Purpose:** Replace all loading spinners/skeletons across the app
**Where to use:** Any loading state (survey submission, recommendation generation, data fetching, page transitions)

```tsx
// src/components/ui/orbital-loader.tsx
"use client"
import React from "react"
import { cva } from "class-variance-authority"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const orbitalLoaderVariants = cva("flex gap-2 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      top: "flex-col-reverse",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
})

export interface OrbitalLoaderProps {
  message?: string
  messagePlacement?: "top" | "bottom" | "left" | "right"
}

export function OrbitalLoader({
  className,
  message,
  messagePlacement,
  ...props
}: React.ComponentProps<"div"> & OrbitalLoaderProps) {
  return (
    <div className={cn(orbitalLoaderVariants({ messagePlacement }))}>
      <div className={cn("relative w-16 h-16", className)} {...props}>
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-foreground rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-t-foreground rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-2 border-transparent border-t-foreground rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {message && <div>{message}</div>}
    </div>
  )
}
```

---

## Component 2: ProgressIndicator
**Purpose:** Replace the survey progress bar with an animated step indicator
**Where to use:** Survey form (SurveyForm.tsx) - shows progress through the 12 questions grouped into 3 sections

```tsx
// src/components/ui/progress-indicator.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const ProgressIndicator = ({ step = 1, totalSteps = 3, onContinue, onBack }: {
  step?: number
  totalSteps?: number
  onContinue?: () => void
  onBack?: () => void
}) => {
    const isFirst = step === 1
    const isLast = step === totalSteps

    return (
        <div className="flex flex-col items-center justify-center gap-8">
            <div className="flex items-center gap-6 relative">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((dot) => (
                    <div
                        key={dot}
                        className={cn(
                            "w-2 h-2 rounded-full relative z-10",
                            dot <= step ? "bg-white" : "bg-gray-300"
                        )}
                    />
                ))}
                <motion.div
                    initial={{ width: '12px', height: "24px", x: 0 }}
                    animate={{
                        width: `${12 + (step - 1) * 36}px`,
                        x: 0
                    }}
                    className="absolute -left-[8px] -top-[8px] -translate-y-1/2 h-3 bg-green-500 rounded-full"
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        mass: 0.8,
                        bounce: 0.25,
                        duration: 0.6
                    }}
                />
            </div>
            <div className="w-full max-w-sm">
                <motion.div className="flex items-center gap-1"
                    animate={{ justifyContent: isFirst ? 'stretch' : 'space-between' }}
                >
                    {!isFirst && (
                        <motion.button
                            initial={{ opacity: 0, width: 0, scale: 0.8 }}
                            animate={{ opacity: 1, width: "64px", scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            onClick={onBack}
                            className="px-4 py-3 text-black flex items-center justify-center bg-gray-100 font-semibold rounded-full hover:bg-gray-50 hover:border transition-colors flex-1 w-16 text-sm"
                        >
                            Back
                        </motion.button>
                    )}
                    <motion.button
                        onClick={onContinue}
                        animate={{ flex: isFirst ? 1 : 'inherit' }}
                        className={cn(
                            "px-4 py-3 rounded-full text-white bg-[#006cff] transition-colors flex-1 w-56",
                            !isFirst && 'w-44'
                        )}
                    >
                        <div className="flex items-center font-[600] justify-center gap-2 text-sm">
                            {isLast && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                    <CircleCheck size={16} />
                                </motion.div>
                            )}
                            {isLast ? 'Finish' : 'Continue'}
                        </div>
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}

export default ProgressIndicator
```

---

## Component 3: AI Input (MorphPanel)
**Purpose:** A polished AI-powered input panel for the teacher notes feature
**Where to use:** Student detail page - teachers can type observations into this animated panel instead of a plain textarea

```tsx
// src/components/ui/ai-input.tsx
// [Full component code from the ai-input.tsx prompt]
// Uses: motion/react, class-variance-authority, @radix-ui/react-slot
// Requires: src/components/ui/button.tsx (shadcn button)
```

---

## Component 4: Release Timeline
**Purpose:** Display student mindset assessment history as a beautiful timeline
**Where to use:** Student detail page - replace or enhance the trend history view with a vertical timeline showing each assessment, score changes, and recommendation updates

```tsx
// src/components/ui/release-time-line.tsx
// Adapt the TimeLine_01 component for MindsetLens:
// - Each entry = one assessment or note
// - Icon = assessment type (survey, note, recommendation)
// - Title = "Growth Mindset: 78/100" or "Teacher Observation"
// - Subtitle = date
// - Description = AI analysis summary or note text
// - Items = recommendations generated from that assessment
```

---

## Component 5: Full Screen Scroll FX (Landing Page)
**Purpose:** Create an impressive landing/marketing page for MindsetLens
**Where to use:** The public landing page (/) before login
**Note:** This is heavy (uses GSAP + ScrollTrigger). Only load on the landing page, NOT in the dashboard.

---

## Performance Optimizations
1. Use `next/dynamic` with `ssr: false` for animation-heavy components
2. Lazy load Recharts components
3. Use `React.memo` on list items (StudentCard, NoteCard, RecommendationCard)
4. Add `loading="lazy"` to all images
5. Use Suspense boundaries around data-fetching components
6. Minimize bundle size: import only needed icons from lucide-react

## Placement Map
| Component | Location | Replaces |
|-----------|----------|----------|
| OrbitalLoader | All loading states | Current spinners/skeletons |
| ProgressIndicator | SurveyForm.tsx | Current ProgressBar |
| AI Input (MorphPanel) | Student detail - notes section | Plain textarea for notes |
| Timeline | Student detail - history tab | Simple list of assessments |
| FullScreenScrollFX | Landing page (/) | Current static landing |
| shadcn Button | Everywhere | Current Button component |
