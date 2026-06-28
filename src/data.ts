import { JUNE_05_CATEGORIES } from './news_june05';
import { JUNE_12_CATEGORIES } from './news_june12';
import { JUNE_18_CATEGORIES } from './news_june18';
import { JUNE_26_CATEGORIES } from './news_june26';

export interface NewsLink {
  title: string;
  url: string;
}

export interface NewsDetail {
  id: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceLabel?: string;
  date: string;
  eventProperty: string;
  coreFacts: string;
  strategicSignal: string;
  businessConnection: string;
  judgmentSuggestion?: string;
  rating: number;
  summary: string;
  interpretations?: NewsLink[];
  downloads?: NewsLink[];
}

export interface TrendCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  news: NewsDetail[];
}

export interface ArchiveIssue {
  date: string;
  title: string;
  categories: TrendCategory[];
}

function reorderCategories(cats: TrendCategory[]): TrendCategory[] {
  const orderedIds = ['policy', 'funding', 'competitor', 'market', 'tech'];
  const map = new Map(cats.map(c => [c.id, c]));
  const result: TrendCategory[] = [];
  for (const id of orderedIds) {
    const item = map.get(id);
    if (item) {
      result.push(item);
      map.delete(id);
    }
  }
  for (const item of map.values()) {
    result.push(item);
  }
  return result;
}

// 2026年6月26日刊 - 丰行慧运情报中心当前最新内容
export const CATEGORIES: TrendCategory[] = reorderCategories(JUNE_26_CATEGORIES);

// 历史期刊归档
export const HISTORICAL_ISSUES: ArchiveIssue[] = [
  {
    "date": "2026-06-26",
    "title": "2026年6月26日刊",
    "categories": reorderCategories(JUNE_26_CATEGORIES)
  },
  {
    "date": "2026-06-18",
    "title": "2026年6月18日刊",
    "categories": reorderCategories(JUNE_18_CATEGORIES)
  },
  {
    "date": "2026-06-12",
    "title": "2026年6月12日刊",
    "categories": reorderCategories(JUNE_12_CATEGORIES)
  },
  {
    "date": "2026-06-05",
    "title": "2026年6月5日刊",
    "categories": reorderCategories(JUNE_05_CATEGORIES)
  }
];
