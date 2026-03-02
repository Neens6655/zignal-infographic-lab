'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Link2 } from 'lucide-react';

type Props = {
  content: string;
  contentUrl: string;
  onContentChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  disabled?: boolean;
};

export function ContentInput({ content, contentUrl, onContentChange, onUrlChange, disabled }: Props) {
  const [mode, setMode] = useState<'text' | 'url'>('text');

  return (
    <div className="space-y-3">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'text' | 'url')}>
        <TabsList className="h-8">
          <TabsTrigger value="text" className="text-xs gap-1.5">
            <Type className="h-3 w-3" /> Paste text
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs gap-1.5">
            <Link2 className="h-3 w-3" /> From URL
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'text' ? (
        <Textarea
          placeholder="Paste your content, article, research, or notes..."
          className="min-h-[160px] resize-y text-sm leading-relaxed"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          type="url"
          placeholder="https://example.com/article"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={contentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={disabled}
        />
      )}

      {mode === 'text' && content.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {content.length.toLocaleString()} characters
        </p>
      )}
    </div>
  );
}
