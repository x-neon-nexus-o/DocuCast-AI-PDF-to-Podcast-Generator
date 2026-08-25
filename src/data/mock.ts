import type {
  DocRecord,
  Podcast,
  ScriptLine,
  Chapter,
  VoiceOption,
  PodcastStyle,
  Complexity,
  GenLength,
  Language,
  VoiceId,
} from '@/types';

export const voices: VoiceOption[] = [
  { id: 'sarah', name: 'Sarah', description: 'Clear Female' },
  { id: 'david', name: 'David', description: 'Professional Male' },
  { id: 'alex', name: 'Alex', description: 'Friendly Male' },
  { id: 'emma', name: 'Emma', description: 'Warm Female' },
];

export const podcastStyles: { id: PodcastStyle; label: string; description: string }[] = [
  { id: 'educational', label: 'Educational', description: 'Structured, lecture-style explanation' },
  { id: 'conversational', label: 'Conversational', description: 'Host and expert discussion' },
  { id: 'quick-revision', label: 'Quick Revision', description: 'Fast, key-points only' },
  { id: 'deep-explanation', label: 'Deep Explanation', description: 'Thorough, detailed breakdown' },
];

export const complexities: { id: Complexity; label: string; description: string }[] = [
  { id: 'simple', label: 'Simple', description: 'Plain language, easy to follow' },
  { id: 'balanced', label: 'Balanced', description: 'Mix of simplicity and detail' },
  { id: 'detailed', label: 'Detailed', description: 'Technical, in-depth coverage' },
];

export const lengths: { id: GenLength; label: string; description: string }[] = [
  { id: 'short', label: 'Short', description: '~8-10 min' },
  { id: 'medium', label: 'Medium', description: '~15-20 min' },
  { id: 'detailed', label: 'Detailed', description: '~25-35 min' },
];

export const languages: Language[] = ['English', 'Hindi', 'Marathi'];

export function voiceById(id: VoiceId): VoiceOption {
  return voices.find((v) => v.id === id) ?? voices[0];
}

export const documents: DocRecord[] = [
  {
    id: 'doc-1',
    name: 'Machine Learning Fundamentals.pdf',
    type: 'pdf',
    pages: 12,
    status: 'ready',
    date: '2026-08-18',
    audioDurationSec: 1122,
    category: 'Machine Learning',
    sizeMb: 2.4,
    hasAudio: true,
    favorite: true,
  },
  {
    id: 'doc-2',
    name: 'Computer Networks Notes.pdf',
    type: 'pdf',
    pages: 28,
    status: 'ready',
    date: '2026-08-16',
    audioDurationSec: 1840,
    category: 'Networking',
    sizeMb: 5.1,
    hasAudio: true,
    favorite: false,
  },
  {
    id: 'doc-3',
    name: 'Software Engineering Report.pdf',
    type: 'pdf',
    pages: 19,
    status: 'ready',
    date: '2026-08-14',
    audioDurationSec: 1456,
    category: 'Software Engineering',
    sizeMb: 3.8,
    hasAudio: true,
    favorite: false,
  },
  {
    id: 'doc-4',
    name: 'Operating Systems Unit 3.pdf',
    type: 'pdf',
    pages: 15,
    status: 'ready',
    date: '2026-08-11',
    audioDurationSec: 998,
    category: 'Operating Systems',
    sizeMb: 2.9,
    hasAudio: true,
    favorite: true,
  },
  {
    id: 'doc-5',
    name: 'Database Management Systems.pdf',
    type: 'pdf',
    pages: 22,
    status: 'processing',
    date: '2026-08-19',
    category: 'Databases',
    sizeMb: 4.2,
    hasAudio: false,
    favorite: false,
  },
  {
    id: 'doc-6',
    name: 'Data Structures & Algorithms.pdf',
    type: 'pdf',
    pages: 34,
    status: 'failed',
    date: '2026-08-09',
    category: 'Algorithms',
    sizeMb: 8.7,
    hasAudio: false,
    favorite: false,
  },
  {
    id: 'doc-7',
    name: 'Cloud Computing Overview.pdf',
    type: 'pdf',
    pages: 9,
    status: 'ready',
    date: '2026-08-06',
    audioDurationSec: 720,
    category: 'Cloud',
    sizeMb: 1.8,
    hasAudio: true,
    favorite: false,
  },
];

const mlChapters: Chapter[] = [
  { id: 'ch1', title: 'Introduction', startSec: 0 },
  { id: 'ch2', title: 'What is Machine Learning?', startSec: 135 },
  { id: 'ch3', title: 'Supervised Learning', startSec: 340 },
  { id: 'ch4', title: 'Neural Networks', startSec: 560 },
  { id: 'ch5', title: 'Real-world Applications', startSec: 825 },
  { id: 'ch6', title: 'Final Takeaways', startSec: 1050 },
];

const mlScript: ScriptLine[] = [
  { id: 's1', speaker: 'HOST', text: 'Welcome to DocuCast Learning. Today we are exploring Machine Learning Fundamentals — a quick, focused guide in about eighteen minutes.' },
  { id: 's2', speaker: 'EXPERT', text: 'Let us begin by understanding what machine learning actually is. At its core, machine learning is a subset of artificial intelligence that allows systems to learn and improve from data without being explicitly programmed.', highlight: 'Machine Learning' },
  { id: 's3', speaker: 'HOST', text: 'So instead of writing rules by hand, the computer finds the rules from examples?' },
  { id: 's4', speaker: 'EXPERT', text: 'Exactly. You give the model data, and it finds patterns. A good analogy is learning to ride a bicycle — nobody hands you the physics equations, you just try and adjust until it works.', highlight: 'learning by example' },
  { id: 's5', speaker: 'HOST', text: 'That makes sense. What are the main types of machine learning?' },
  { id: 's6', speaker: 'EXPERT', text: 'The three main categories are supervised learning, unsupervised learning, and reinforcement learning. In supervised learning, the data comes with labels — the model learns to map inputs to outputs.', highlight: 'Supervised Learning' },
  { id: 's7', speaker: 'HOST', text: 'And neural networks fit into this how?' },
  { id: 's8', speaker: 'EXPERT', text: 'Neural networks are a class of models inspired loosely by the brain. They are made of layers of interconnected nodes, and they are especially powerful for tasks like image and language understanding.', highlight: 'Neural Networks' },
  { id: 's9', speaker: 'HOST', text: 'Where do we see this in everyday life?' },
  { id: 's10', speaker: 'EXPERT', text: 'Recommendation systems, spam filters, fraud detection, voice assistants, self-driving features — all powered by models trained on large datasets.', highlight: 'real-world applications' },
  { id: 's11', speaker: 'HOST', text: 'To wrap up — what is the one thing to remember?' },
  { id: 's12', speaker: 'EXPERT', text: 'Machine learning is about learning patterns from data. Start with a clear problem, gather good data, choose a suitable model, and iterate.' },
];

export const podcasts: Podcast[] = [
  {
    id: 'pod-1',
    docId: 'doc-1',
    title: 'Machine Learning Fundamentals',
    durationSec: 1122,
    pages: 12,
    language: 'English',
    voice: 'sarah',
    style: 'conversational',
    category: 'Machine Learning',
    date: '2026-08-18',
    favorite: true,
    downloaded: true,
    coverAccent: '#3d96ff',
    chapters: mlChapters,
    summary: {
      overview:
        'This document introduces the foundations of machine learning, covering its definition, main categories, the role of neural networks, and how ML is applied in real-world products.',
      keyConcepts: [
        'Supervised, unsupervised, and reinforcement learning',
        'Neural networks and layered representations',
        'Training, validation, and overfitting',
        'Feature engineering and data quality',
      ],
      takeaways: [
        'Machine learning learns patterns from data rather than explicit rules.',
        'Neural networks excel at complex tasks like vision and language.',
        'Data quality matters more than model complexity.',
        'Start simple, then iterate based on evaluation.',
      ],
    },
    script: mlScript,
  },
  {
    id: 'pod-2',
    docId: 'doc-2',
    title: 'Computer Networks Notes',
    durationSec: 1840,
    pages: 28,
    language: 'English',
    voice: 'david',
    style: 'educational',
    category: 'Networking',
    date: '2026-08-16',
    favorite: false,
    downloaded: false,
    coverAccent: '#22c8e0',
    chapters: [
      { id: 'c1', title: 'Introduction', startSec: 0 },
      { id: 'c2', title: 'The OSI Model', startSec: 180 },
      { id: 'c3', title: 'TCP/IP', startSec: 520 },
      { id: 'c4', title: 'Routing & Switching', startSec: 980 },
      { id: 'c5', title: 'Summary', startSec: 1640 },
    ],
    summary: {
      overview: 'A comprehensive walkthrough of computer networking, covering the OSI model, TCP/IP protocol suite, routing fundamentals, and common network topologies.',
      keyConcepts: [
        'OSI 7-layer model',
        'TCP/IP four layers',
        'IP addressing and subnetting',
        'Routing algorithms',
      ],
      takeaways: [
        'Each OSI layer has a specific responsibility.',
        'TCP provides reliability, IP provides delivery.',
        'Subnetting enables efficient IP address allocation.',
      ],
    },
    script: [
      { id: '1', speaker: 'HOST', text: 'Welcome back. Today, we are covering computer networks from the ground up.' },
      { id: '2', speaker: 'EXPERT', text: 'We start with the OSI model, which breaks networking into seven layers, each with a clear job.', highlight: 'OSI Model' },
      { id: '3', speaker: 'HOST', text: 'Why seven layers?' },
      { id: '4', speaker: 'EXPERT', text: 'It separates concerns — physical transmission, data link, routing, and so on, up to the application the user sees.', highlight: 'separation of concerns' },
    ],
  },
  {
    id: 'pod-3',
    docId: 'doc-3',
    title: 'Software Engineering Report',
    durationSec: 1456,
    pages: 19,
    language: 'English',
    voice: 'alex',
    style: 'deep-explanation',
    category: 'Software Engineering',
    date: '2026-08-14',
    favorite: false,
    downloaded: true,
    coverAccent: '#10b981',
    chapters: [
      { id: 'c1', title: 'Introduction', startSec: 0 },
      { id: 'c2', title: 'SDLC Models', startSec: 240 },
      { id: 'c3', title: 'Agile vs Waterfall', startSec: 680 },
      { id: 'c4', title: 'Testing Strategies', startSec: 1120 },
      { id: 'c5', title: 'Conclusion', startSec: 1320 },
    ],
    summary: {
      overview: 'An overview of software engineering principles, development life cycles, and modern agile practices.',
      keyConcepts: ['SDLC', 'Agile', 'Testing', 'Version control'],
      takeaways: ['Agile favors adaptability over rigid planning.', 'Testing early reduces cost of defects.'],
    },
    script: [
      { id: '1', speaker: 'HOST', text: 'Today we dig into software engineering as a discipline.' },
      { id: '2', speaker: 'EXPERT', text: 'We will compare Agile and Waterfall, two philosophies of organizing software projects.', highlight: 'Agile vs Waterfall' },
    ],
  },
  {
    id: 'pod-4',
    docId: 'doc-4',
    title: 'Operating Systems Unit 3',
    durationSec: 998,
    pages: 15,
    language: 'English',
    voice: 'sarah',
    style: 'quick-revision',
    category: 'Operating Systems',
    date: '2026-08-11',
    favorite: true,
    downloaded: false,
    coverAccent: '#f59e0b',
    chapters: [
      { id: 'c1', title: 'Introduction', startSec: 0 },
      { id: 'c2', title: 'Process Scheduling', startSec: 120 },
      { id: 'c3', title: 'Deadlocks', startSec: 420 },
      { id: 'c4', title: 'Memory Management', startSec: 760 },
    ],
    summary: {
      overview: 'Quick revision of OS fundamentals: scheduling, deadlocks, and memory management.',
      keyConcepts: ['CPU scheduling', 'Deadlocks', 'Paging', 'Virtual memory'],
      takeaways: ['Scheduling algorithms trade fairness for throughput.', 'Deadlocks require prevention, avoidance, or detection.'],
    },
    script: [
      { id: '1', speaker: 'HOST', text: 'This is a quick revision of Operating Systems Unit 3.' },
      { id: '2', speaker: 'EXPERT', text: 'We cover scheduling, deadlocks, and memory management in ten minutes.', highlight: 'scheduling & deadlocks' },
    ],
  },
  {
    id: 'pod-5',
    docId: 'doc-7',
    title: 'Cloud Computing Overview',
    durationSec: 720,
    pages: 9,
    language: 'English',
    voice: 'emma',
    style: 'educational',
    category: 'Cloud',
    date: '2026-08-06',
    favorite: false,
    downloaded: true,
    coverAccent: '#8b5cf6',
    chapters: [
      { id: 'c1', title: 'Introduction', startSec: 0 },
      { id: 'c2', title: 'Service Models', startSec: 180 },
      { id: 'c3', title: 'Deployment Models', startSec: 460 },
    ],
    summary: {
      overview: 'A short introduction to cloud computing service and deployment models.',
      keyConcepts: ['IaaS', 'PaaS', 'SaaS', 'Public vs Private cloud'],
      takeaways: ['IaaS gives you raw compute, PaaS a platform, SaaS a finished product.'],
    },
    script: [
      { id: '1', speaker: 'HOST', text: 'A short overview of cloud computing.' },
      { id: '2', speaker: 'EXPERT', text: 'Cloud services come in three flavors: IaaS, PaaS, and SaaS.', highlight: 'IaaS / PaaS / SaaS' },
    ],
  },
];

export const recentSearches = ['machine learning', 'networks', 'scheduling', 'agile'];

export const helpCategories = [
  {
    id: 'uploading',
    label: 'Uploading Documents',
    icon: 'Upload',
    questions: [
      { q: 'What file types does DocuCast support?', a: 'DocuCast currently supports PDF files. We extract text using PyPDF2, so text-based PDFs work best. Scanned image-only PDFs are not supported in this version.' },
      { q: 'What is the maximum file size?', a: 'The maximum upload size is 20 MB per file. If your document is larger, try splitting it into smaller sections before uploading.' },
      { q: 'Can I select specific pages?', a: 'Yes. After uploading, choose "Selected pages" in the Content range option and enter the page range you want the podcast to cover.' },
    ],
  },
  {
    id: 'processing',
    label: 'AI Processing',
    icon: 'Brain',
    questions: [
      { q: 'How long does PDF processing take?', a: 'Processing time depends on document length and chosen detail level. A 12-page document typically takes 30-60 seconds. Larger documents can take a few minutes.' },
      { q: 'What does the AI summarize?', a: 'The Gemini model reads the extracted text, identifies key concepts, and writes a podcast script that focuses on the most important material rather than reading everything word-for-word.' },
      { q: 'Can I change the podcast style?', a: 'Yes — you can choose Educational, Conversational, Quick Revision, or Deep Explanation before generating.' },
    ],
  },
  {
    id: 'audio',
    label: 'Audio Generation',
    icon: 'AudioLines',
    questions: [
      { q: 'Can I change the AI voice?', a: 'Yes. You can pick from Sarah, David, Alex, or Emma before generation, and change the default voice in Settings under Audio Preferences.' },
      { q: 'Which languages are supported?', a: 'Currently English, Hindi, and Marathi. More languages are planned for later releases.' },
      { q: 'Can I download the audio?', a: 'Yes. On the podcast result screen, use the Download MP3 button. Downloaded podcasts also appear in the Audio Library under Downloaded.' },
    ],
  },
  {
    id: 'downloading',
    label: 'Downloading',
    icon: 'Download',
    questions: [
      { q: 'Where are my generated podcasts stored?', a: 'Generated podcasts appear in your Audio Library and remain available for streaming or download. They are listed under the "Recently Generated" section.' },
      { q: 'Can I download the script?', a: 'Yes. On the Script viewer, use the Download Script button to save the text transcript.' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    icon: 'UserCircle',
    questions: [
      { q: 'How do I reset my password?', a: 'Use the "Forgot password" link on the login screen. For this prototype, password reset is simulated.' },
      { q: 'Can I change my profile details?', a: 'Yes, under Settings → Profile you can update your name and profile image.' },
    ],
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    icon: 'Wrench',
    questions: [
      { q: 'My PDF failed to process — why?', a: 'Common causes: the file is too large (over 20 MB), the PDF is corrupted, or it contains only scanned images with no text layer. Try a different file or a smaller page range.' },
      { q: 'Voice synthesis failed — what do I do?', a: 'This is usually a transient issue. Use "Try Again" on the error screen. If it persists, the document may be too large for one pass — try a shorter page range.' },
      { q: 'The app is slow during processing', a: 'AI generation can take a few seconds per page. For very long documents, selecting a page range and choosing a shorter generation length will speed things up.' },
    ],
  },
];

export function getPodcastForDoc(docId: string): Podcast | undefined {
  return podcasts.find((p) => p.docId === docId);
}

export function getDocById(id: string): DocRecord | undefined {
  return documents.find((d) => d.id === id);
}
