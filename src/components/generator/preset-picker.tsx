'use client';

import { cn } from '@/lib/utils';
import { PRESETS } from '@/lib/constants';
import { Sparkles, BarChart3, Network, TrendingUp, GitBranch, Swords, Building2, Scan, Plane } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ICONS: Record<string, React.ElementType> = {
  Sparkles, BarChart3, Network, TrendingUp, GitBranch, Swords, Building2, Scan, Plane,
};

type Props = {
  selected: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export function PresetPicker({ selected, onSelect, disabled }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
        Preset
      </label>
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const Icon = ICONS[preset.icon] || Sparkles;
            const isSelected = selected === preset.id;
            return (
              <Tooltip key={preset.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(preset.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      'border hover:shadow-terminal',
                      isSelected
                        ? 'bg-[var(--z-gold)] text-white border-[var(--z-gold)]'
                        : 'bg-card text-foreground border-border hover:border-[var(--z-gold)] hover:text-[var(--z-gold)]',
                      disabled && 'opacity-50 pointer-events-none',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {preset.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-xs">{preset.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
