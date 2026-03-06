/* ═══════════════════════════════════════════════════════════════
   ZGNAL CHAT — Message Type Definitions
   ═══════════════════════════════════════════════════════════════ */

export type ChatRole = 'user' | 'assistant';

export type ChatMessage =
  | { type: 'text'; id: string; role: ChatRole; content: string }
  | { type: 'style-picker'; id: string; role: 'assistant'; selectedStyle?: string; selectedAspect?: string }
  | { type: 'generating'; id: string; role: 'assistant'; progress: number; status: string; message: string }
  | {
      type: 'image-result';
      id: string;
      role: 'assistant';
      imageUrl: string;
      downloadUrl: string;
      metadata: Record<string, any>;
      provenance?: ProvenanceData;
      context: GenerationContext;
    }
  | { type: 'error'; id: string; role: 'assistant'; error: string };

export type GenerationContext = {
  content: string;
  preset: string;
  style: string;
  aspectRatio: string;
  simplify: boolean;
};

export type ProvenanceData = {
  seed: string;
  generatedAt: string;
  contentHash: string;
  models: { analysis: string; image: string };
  pipeline: { stage: string; agent: string; result: string }[];
  references: string[];
  topics: string[];
  contentSources: string[];
  compliance?: {
    score: number;
    corrections: number;
    riskWords: string[];
    factFlags: string[];
  };
};

export type ChatConfig = {
  preset: string;
  style: string;
  aspectRatio: string;
  simplify: boolean;
};

export const STYLE_CATALOG = [
  { id: 'executive-institutional', label: 'Executive Institutional', desc: 'McKinsey-grade multi-panel dashboard', accent: '#D4A84B', icon: '▦' },
  { id: 'deconstruct', label: 'Deconstruct', desc: 'NYT-style exploded view with callouts', accent: '#C04B3C', icon: '◎' },
  { id: 'aerial-explainer', label: 'Aerial Explainer', desc: 'Drone-view isometric cutaway', accent: '#5B8DEF', icon: '◇' },
  { id: 'technical-schematic', label: 'Technical Schematic', desc: 'Blueprint grid with process flows', accent: '#8BC34A', icon: '⬡' },
  { id: 'craft-handmade', label: 'Craft Handmade', desc: 'Watercolor textures, hand-drawn art', accent: '#A78BFA', icon: '✦' },
  { id: 'bold-graphic', label: 'Bold Graphic', desc: 'Swiss poster aesthetic, maximum impact', accent: '#FF6B6B', icon: '■' },
  { id: 'cyberpunk-neon', label: 'Cyberpunk Neon', desc: 'Glowing neon on dark backgrounds', accent: '#00F5FF', icon: '◈' },
  { id: 'claymation', label: 'Claymation', desc: 'Soft 3D clay-rendered objects', accent: '#FF9F43', icon: '●' },
  { id: 'kawaii', label: 'Kawaii', desc: 'Cute illustrated characters, pastels', accent: '#FF6B9D', icon: '♡' },
  { id: 'storybook-watercolor', label: 'Storybook Watercolor', desc: "Delicate washes, children's book feel", accent: '#C4A882', icon: '✿' },
  { id: 'chalkboard', label: 'Chalkboard', desc: 'White chalk on green, sketch-notes', accent: '#7CB342', icon: '▤' },
  { id: 'aged-academia', label: 'Aged Academia', desc: 'Sepia tones, classical engravings', accent: '#8D6E63', icon: '⚜' },
  { id: 'corporate-memphis', label: 'Corporate Memphis', desc: 'Flat geometric characters', accent: '#9C27B0', icon: '△' },
  { id: 'origami', label: 'Origami', desc: 'Paper-folded 3D forms, crisp edges', accent: '#E91E63', icon: '◆' },
  { id: 'pixel-art', label: 'Pixel Art', desc: 'Retro 8-bit sprites, nostalgic charm', accent: '#4CAF50', icon: '▪' },
  { id: 'ikea-manual', label: 'IKEA Manual', desc: 'Minimal line drawings, numbered steps', accent: '#2196F3', icon: '⊞' },
  { id: 'knolling', label: 'Knolling', desc: 'Top-down flat-lay, perfectly organized', accent: '#607D8B', icon: '⊡' },
  { id: 'lego-brick', label: 'LEGO Brick', desc: 'Plastic bricks, colorful and modular', accent: '#F44336', icon: '▧' },
] as const;

export type StyleEntry = (typeof STYLE_CATALOG)[number];
