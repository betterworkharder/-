import rawSiteContent from './generated/site-content.json';

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
  issueId: string;
  date: string;
  displayDate: string;
  title: string;
  categories: TrendCategory[];
  contentHash: string;
}

export interface PortalLink {
  label: string;
  url: string;
}

export interface ExpertInsight {
  id: string;
  theme: 'indigo' | 'emerald';
  badge: string;
  published_label: string;
  title: string;
  organization_label: string;
  organizations: string[];
  summary: string;
  highlight_label: string;
  highlight: string;
  stages?: Array<{time: string; title: string}>;
  bullets?: string[];
  link: PortalLink;
  note: string;
}

export interface DashboardMetric {
  key: string;
  label: string;
  highlight?: boolean;
}

export interface DashboardTab {
  id: string;
  label: string;
  metrics: DashboardMetric[];
}

export interface DashboardCompany {
  name: string;
  status: string;
  code: string;
  values: Record<string, Record<string, string>>;
}

export interface PortalContent {
  schema_version: number;
  site: {
    name: string;
    english_name: string;
    report_title: string;
    report_description: string;
    focus_title: string;
    footer_brand: string;
    footer_tagline: string;
    copyright: string;
    version: string;
  };
  expert_insights: {title: string; items: ExpertInsight[]};
  competitor_dashboard: {
    title: string;
    subtitle: string;
    source_note: string;
    tabs: DashboardTab[];
    groups: Array<{category: string; companies: DashboardCompany[]}>;
  };
  about: {
    title: string;
    organization: string;
    producer: string;
    sections: Array<{title: string; body: string}>;
    feedback: {
      title: string;
      placeholder: string;
      contact_placeholder: string;
      local_notice: string;
    };
  };
}

interface RawIssue {
  issue_id: string;
  issue_date: string;
  display_date: string;
  title: string;
  categories: TrendCategory[];
  content_hash: string;
}

interface RawSiteContent {
  schema_version: number;
  mode: 'site';
  latest_issue_id: string;
  issues: RawIssue[];
  portal: PortalContent;
  content_hash: string;
}

function reorderCategories(categories: TrendCategory[]): TrendCategory[] {
  const currentIds = ['policy', 'competitor', 'market-opportunity', 'tech'];
  const legacyIds = ['policy', 'funding', 'competitor', 'market', 'tech'];
  const byId = new Map(categories.map((category) => [category.id, category]));
  const orderedIds = currentIds.every((id) => byId.has(id))
    ? currentIds
    : legacyIds.every((id) => byId.has(id))
      ? legacyIds
      : null;
  if (!orderedIds) {
    throw new Error('站点数据栏目结构无效');
  }
  return orderedIds.map((id) => {
    const category = byId.get(id);
    if (!category) {
      throw new Error(`站点数据缺少栏目：${id}`);
    }
    return {
      ...category,
      news: category.id === 'policy'
        ? [...category.news].sort((left, right) => right.rating - left.rating)
        : [...category.news],
    };
  });
}

function loadSiteContent(value: unknown): {latestIssueId: string; issues: ArchiveIssue[]; portal: PortalContent; mode: 'site'} {
  const content = value as RawSiteContent;
  if (content.schema_version !== 1 || content.mode !== 'site' || !content.latest_issue_id || !Array.isArray(content.issues) || content.portal?.schema_version !== 1) {
    throw new Error('站点数据格式无效');
  }
  const issues = content.issues.map((issue) => ({
    issueId: issue.issue_id,
    date: issue.issue_date,
    displayDate: issue.display_date,
    title: issue.title,
    categories: reorderCategories(issue.categories),
    contentHash: issue.content_hash,
  }));
  if (!issues.some((issue) => issue.issueId === content.latest_issue_id)) {
    throw new Error('站点数据未包含最新一期');
  }
  return {latestIssueId: content.latest_issue_id, issues, portal: content.portal, mode: content.mode};
}

const siteContent = loadSiteContent(rawSiteContent);

export const HISTORICAL_ISSUES = siteContent.issues;
export const LATEST_ISSUE_ID = siteContent.latestIssueId;
export const LATEST_ISSUE = HISTORICAL_ISSUES.find((issue) => issue.issueId === LATEST_ISSUE_ID)!;
export const CATEGORIES = LATEST_ISSUE.categories;
export const PORTAL_CONTENT = siteContent.portal;
export const SITE_MODE = siteContent.mode;
