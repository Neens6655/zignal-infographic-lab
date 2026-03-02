'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ASPECT_RATIOS } from '@/lib/constants';
import { ChevronDown, Settings2, CheckCircle2 } from 'lucide-react';

type Props = {
  aspectRatio: string;
  quality: string;
  language: string;
  simplify: boolean;
  referenceQuery: string;
  onAspectChange: (v: string) => void;
  onQualityChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onSimplifyChange: (v: boolean) => void;
  onReferenceQueryChange: (v: string) => void;
  disabled?: boolean;
};

export function OptionsPanel(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Settings2 className="h-3.5 w-3.5" />
          Advanced Options
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t px-4 py-4 space-y-4">
          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Aspect Ratio</label>
            <div className="flex gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  disabled={props.disabled}
                  onClick={() => props.onAspectChange(ar.value)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md border transition-colors',
                    props.aspectRatio === ar.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-secondary',
                  )}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Quality</label>
            <div className="flex gap-2">
              {['normal', '2k'].map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={props.disabled}
                  onClick={() => props.onQualityChange(q)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md border transition-colors',
                    props.quality === q
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-secondary',
                  )}
                >
                  {q === '2k' ? '2K' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          {/* Simplify toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Simplify language</label>
              <p className="text-[10px] text-muted-foreground">Rewrite at 8th-grade reading level</p>
            </div>
            <button
              type="button"
              disabled={props.disabled}
              onClick={() => props.onSimplifyChange(!props.simplify)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                props.simplify ? 'bg-[var(--z-gold)]' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                  props.simplify ? 'translate-x-[18px]' : 'translate-x-[3px]',
                )}
              />
            </button>
          </div>

          {/* Research hint */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Research hint</label>
            <p className="text-[10px] text-muted-foreground">
              Guide what the AI researches for reference images and facts
            </p>
            <input
              type="text"
              value={props.referenceQuery}
              onChange={(e) => props.onReferenceQueryChange(e.target.value)}
              disabled={props.disabled}
              placeholder='e.g. "Qasr Al Hosn fort exterior aerial view"'
              maxLength={500}
              className="w-full rounded-md border bg-card px-3 py-1.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-(--z-gold)"
            />
          </div>

          {/* Smart research indicator */}
          <div className="flex items-center gap-2 rounded-md bg-(--z-gold)/5 px-3 py-2 border border-(--z-gold)/10">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-(--z-gold)" />
            <span className="text-[10px] text-(--z-gold)">
              Smart research is automatic — AI verifies facts and finds real reference images
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
