import type { ComponentType } from 'react';

export type Route =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'documents'
  | 'library'
  | 'create'
  | 'processing'
  | 'podcast'
  | 'script'
  | 'search'
  | 'settings'
  | 'profile'
  | 'help';

export type ProcessingStatus = 'ready' | 'processing' | 'failed';
export type DocType = 'pdf';
export type PodcastStyle = 'educational' | 'conversational' | 'quick-revision' | 'deep-explanation';
export type Complexity = 'simple' | 'balanced' | 'detailed';
export type GenLength = 'short' | 'medium' | 'detailed';
export type VoiceId = 'sarah' | 'david' | 'alex' | 'emma';
export type Language = 'English' | 'Hindi' | 'Marathi';

export interface VoiceOption {
  id: VoiceId;
  name: string;
  description: string;
}

export interface DocRecord {
  id: string;
  name: string;
  type: DocType;
  pages: number;
  status: ProcessingStatus;
  date: string;
  audioDurationSec?: number;
  category: string;
  sizeMb: number;
  hasAudio: boolean;
  favorite?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  startSec: number;
}

export interface Podcast {
  id: string;
  docId: string;
  title: string;
  durationSec: number;
  pages: number;
  language: Language;
  voice: VoiceId;
  style: PodcastStyle;
  category: string;
  date: string;
  favorite?: boolean;
  downloaded?: boolean;
  coverAccent: string;
  /** Base64-encoded MP3 (from the generate response or the database). */
  audioBase64?: string;
  audioFormat?: string;
  /** Whether an audio file is persisted for this podcast. */
  hasAudio?: boolean;
  chapters: Chapter[];
  summary: {
    overview: string;
    keyConcepts: string[];
    takeaways: string[];
  };
  script: ScriptLine[];
}

export interface ScriptLine {
  id: string;
  speaker: 'HOST' | 'EXPERT';
  text: string;
  highlight?: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
}

export interface NavItem {
  id: Route;
  label: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  group: 'main' | 'bottom';
}

export interface GenerationConfig {
  range: 'entire' | 'pages';
  pageFrom: number;
  pageTo: number;
  style: PodcastStyle;
  complexity: Complexity;
  language: Language;
  voice: VoiceId;
  length: GenLength;
}
