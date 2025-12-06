export type Level = "Apprentice" | "Journeyman" | "Certified Professional";

export type ModuleStatus = "complete" | "draft" | "todo";

export type QuestionType = "mcq" | "short" | "boolean";

export interface FieldGuideSection {
  id: string;
  title: string;
  summary?: string;
  content_md: string;
}

export interface FieldGuideChecklist {
  id: string;
  title: string;
  items: string[];
}

export interface FieldGuideQuestion {
  id: string;
  question: string;
  type: QuestionType;
  choices?: string[];
  answer?: string;
  explanation?: string;
}

export interface FieldGuideQuiz {
  passing_score: number;
  questions: FieldGuideQuestion[];
}

export interface FieldGuideModule {
  id: string;                      // "FF-01"
  phase: number;                   // 1-5
  slug: string;                    // "foundation-systems"
  title: string;
  category: string;
  level: Level;
  priority: number;                // 1-5 (5 = critical)
  climate_zone?: string;           // "NB Zone 6 (Moncton)"
  prerequisites?: string[];        // ["OH-01", "FF-03"]
  estimated_study_hours?: number;
  status?: ModuleStatus;
  tags?: string[];
  sections: FieldGuideSection[];
  checklists?: FieldGuideChecklist[];
  quiz?: FieldGuideQuiz;
}

// Index types for modules.index.json
export interface ModuleIndexEntry {
  id: string;
  phase: number;
  slug: string;
  title: string;
  category: string;
  level: Level;
  status?: ModuleStatus;
  file: string;                    // relative path to JSON file
}

export interface ModulesIndex {
  version: string;
  generated_at: string;
  modules: ModuleIndexEntry[];
}
