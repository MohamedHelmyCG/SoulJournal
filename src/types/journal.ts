export interface JournalEntry {
  id: string;
  date: string;
  audioUrl: string | null;
  transcript: string;
  reflection: string | null;
  mood?: string;
}
