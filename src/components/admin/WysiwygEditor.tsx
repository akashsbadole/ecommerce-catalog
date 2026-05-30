'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '300px',
  readOnly = false,
}: WysiwygEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Supports HTML and Markdown</span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full font-mono text-sm leading-relaxed resize-y"
        style={{ minHeight }}
      />
    </div>
  );
}
