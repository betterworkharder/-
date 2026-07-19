import {useEffect, useRef, useState, type ComponentType} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  HISTORICAL_ISSUES,
  LATEST_ISSUE,
  LATEST_ISSUE_ID,
  PORTAL_CONTENT,
  type NewsDetail,
  type TrendCategory,
} from './data';
import {About, CompetitorDashboard, ExpertInsights, Footer} from './PortalSections';

const BlueGradient = () => <div className="fixed inset-0 -z-10 bg-[#f4f7fc]"><div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#0052D9]/[0.05] rounded-full blur-[140px] -mr-64 -mt-64" /><div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-indigo-500/[0.04] rounded-full blur-[120px] -ml-32 -mb-32" /></div>;

function SectionIcon({name, className}: {name: string; className?: string}) {
  const aliases: Record<string, string> = {Users: 'Link2', Crosshair: 'Target', BarChart3: 'ChartNoAxesCombined', LineChart: 'ChartNoAxesCombined', Settings: 'SlidersHorizontal'};
  const Component = (Icons as unknown as Record<string, ComponentType<{className?: string}>>)[aliases[name] ?? name] ?? Icons.HelpCircle;
  return <Component className={className} />;
}

function Navbar({categories, title, onHistory, liked, likes, onLike}: {categories: TrendCategory[]; title: string; onHistory: () => void; liked: boolean; likes: number; onLike: () => void}) {
  const site = PORTAL_CONTENT.site;
  return <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/85 backdrop-blur-xl"><div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#0052D9] rounded-xl flex items-center justify-center shadow-md"><Icons.Cpu className="text-white w-5 h-5" /></div><div><span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none font-display block">{site.name}</span><span className="text-[9px] font-bold text-slate-400 tracking-[0.12em] uppercase">{site.english_name}</span></div></div>
    <div className="hidden md:flex gap-8 items-center">
      <div className="relative group"><button className="flex items-center gap-1 text-sm font-semibold text-slate-500 py-8">{site.focus_title}<Icons.ChevronDown className="w-4 h-4" /></button><div className="absolute top-full left-0 w-64 bg-white border border-slate-200/80 shadow-2xl rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"><div className="flex flex-col gap-1">{categories.map((category) => <a key={category.id} href={`#cat-${category.id}`} className="px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#0052D9]/5 hover:text-[#0052D9]">{category.title}</a>)}</div></div></div>
      <a href="#专家观点" className="text-sm font-semibold text-slate-500 hover:text-[#0052D9]">专家观点</a><a href="#竞品看板" className="text-sm font-semibold text-slate-500 hover:text-[#0052D9]">竞品看板</a><a href="#关于我们" className="text-sm font-semibold text-slate-500 hover:text-[#0052D9]">关于我们</a>
      <button onClick={onHistory} className="text-sm font-semibold text-slate-500 hover:text-[#0052D9] flex items-center gap-1.5">历史期刊<Icons.History className="w-4 h-4" /></button>
    </div>
    <div className="flex items-center gap-4"><button onClick={onLike} disabled={liked} className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${liked ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}><Icons.Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} /><span className="text-[11px] font-bold font-mono">{likes}</span></button><div className="hidden lg:flex px-4 py-1.5 rounded-full bg-slate-900 text-[10px] font-bold text-white">{title}</div></div>
  </div></nav>;
}

function Header({displayDate}: {displayDate: string}) {
  const site = PORTAL_CONTENT.site;
  return <header className="pt-16 pb-12 max-w-7xl mx-auto px-6 md:px-8"><motion.div initial={{opacity: 0, y: 24}} animate={{opacity: 1, y: 0}} transition={{duration: 0.7}}><div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 border border-blue-100 rounded-full mb-7"><span className="w-1.5 h-1.5 bg-[#2468ff] rounded-full" /><span className="text-slate-400 font-mono text-[9px] font-bold uppercase">{displayDate} Issue | Weekly Intelligence Briefing</span></div><h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5 leading-[1.16] font-display">{site.name}<br /><span className="text-[#2468ff] font-black">{site.report_title}</span></h1><p className="text-sm md:text-base text-slate-500 font-medium max-w-3xl leading-[1.8]">{site.report_description}</p></motion.div></header>;
}

function RatingStars({rating}: {rating: number}) {
  return <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((star) => <Icons.Star key={star} className={`w-3.5 h-3.5 text-amber-400 ${star <= rating ? 'fill-amber-400' : ''}`} />)}</div>;
}

function TrendCard({category, index, onOpen}: {category: TrendCategory; index: number; onOpen: (category: TrendCategory, newsId?: string) => void}) {
  const isPolicy = category.id === 'policy';
  return <motion.article id={`cat-${category.id}`} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{delay: index * 0.04}} className="relative overflow-hidden bg-white border border-[#8bb8ff] rounded-[38px] px-7 py-9 md:px-10 md:py-12 lg:px-12 shadow-[0_18px_55px_rgba(52,103,180,0.07)]">
    <div className="pointer-events-none absolute -right-16 -top-20 w-56 h-56 rounded-full bg-[#f7f9fd]" />
    <div className="relative grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)] gap-10 md:gap-12 lg:gap-14">
      <div className="md:border-r md:border-[#e5edf8] md:pr-9 lg:pr-12">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-7 shadow-sm ${isPolicy ? 'bg-[#2468ff]' : 'bg-[#a9c8ff]'}`}><SectionIcon name={category.icon} className={`w-7 h-7 ${isPolicy ? 'text-white' : 'text-[#eef4ff]'}`} /></div>
        <h3 className="text-[28px] md:text-[30px] font-black text-[#2468ff] font-display leading-[1.25] tracking-[-0.02em]">{category.title}</h3>
        <p className="text-[14px] text-[#617695] font-semibold mt-4 leading-[1.8]">{category.description}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.08em] text-[#c5d2e5] mb-9">近期要闻回顾</p>
        {category.news.length ? <div className="space-y-9 md:space-y-10">{category.news.map((news) => <button key={news.id} onClick={() => onOpen(category, news.id)} className="group w-full text-left grid grid-cols-[10px_minmax(0,1fr)] gap-x-3 items-start">
          <span className="w-1.5 h-1.5 bg-[#82bcff] rounded-full mt-1.5" />
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3"><RatingStars rating={news.rating} /><span className="text-[10px] font-medium tracking-[0.06em] text-[#c5d2e5] whitespace-nowrap">{news.date}</span></div>
            <div className="flex items-start gap-3 mt-2"><div className="min-w-0 flex-1"><h4 className="text-[15px] font-bold text-[#17233b] leading-[1.55] group-hover:text-[#2468ff] transition-colors">{news.sourceTitle}</h4><p className="text-[13px] text-[#8aa0be] mt-2 leading-[1.75]">{news.summary}</p></div><Icons.ChevronRight className="w-4 h-4 text-[#dbe5f2] mt-1 shrink-0 group-hover:text-[#2468ff] transition-colors" /></div>
          </div>
        </button>)}</div> : <p className="p-5 bg-[#f7f9fd] rounded-2xl text-sm text-[#8aa0be] font-bold">本期该栏目未发现达到正式候选标准的新情报。</p>}
      </div>
    </div>
  </motion.article>;
}

function DetailRows({news, categoryId}: {news: NewsDetail; categoryId: string}) {
  const labels = categoryId === 'policy' ? ['政策方向', '核心内容', '趋势分析', '对丰行的启示'] : categoryId === 'market-opportunity' ? ['信息类型 / 项目主体', '趋势或机会内容', '业务痛点 / 建设任务', '丰行契合点 / 可跟进点'] : categoryId === 'funding' ? ['机会类型 / 牵头主体', '涉及地区 / 行业', '战略信号', '可跟进点'] : categoryId === 'competitor' ? ['动态类别', '核心内容', '战略意义', '对丰行的启示'] : categoryId === 'market' ? ['客户行业', '需求变化', '业务痛点', '丰行契合点'] : ['技术 / 能力方向', '核心变化', '应用场景', '能力启示'];
  const values = [news.eventProperty, news.coreFacts, news.strategicSignal, news.businessConnection];
  return <div className="grid grid-cols-1 gap-3">{labels.map((label, index) => values[index] && <div key={label} className="grid md:grid-cols-[150px_1fr] border border-slate-100 rounded-xl overflow-hidden"><div className="bg-slate-50 p-4 text-xs font-black text-slate-500">{label}</div><div className="p-4 text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{values[index]}</ReactMarkdown></div></div>)}</div>;
}

function CategoryDetail({category, activeNewsId, onClose}: {category: TrendCategory | null; activeNewsId: string | null; onClose: () => void}) {
  const panelRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const activeNewsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!category || !activeNewsId) return;

    const frameId = requestAnimationFrame(() => {
      const panel = panelRef.current;
      const header = headerRef.current;
      const target = activeNewsRef.current;
      if (!panel || !target) return;

      const panelTop = panel.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      panel.scrollTo({
        top: Math.max(0, panel.scrollTop + targetTop - panelTop - headerHeight - 24),
        behavior: 'smooth',
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [category, activeNewsId]);

  return <AnimatePresence>{category && <><motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]" /><motion.aside ref={panelRef} initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type: 'spring', damping: 26, stiffness: 220}} className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white z-[100] shadow-2xl overflow-y-auto"><div ref={headerRef} className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 p-6 flex justify-between items-center z-10"><div className="flex items-center gap-3"><SectionIcon name={category.icon} className="w-6 h-6 text-[#0052D9]" /><h2 className="text-xl font-black text-slate-900">{category.title}</h2></div><button onClick={onClose} className="p-2 bg-slate-50 rounded-full"><Icons.X className="w-5 h-5" /></button></div><div className="p-6 md:p-10 space-y-8">{category.news.map((news) => <article ref={activeNewsId === news.id ? activeNewsRef : undefined} id={`news-${news.id}`} key={news.id} className={`p-6 rounded-3xl border ${activeNewsId === news.id ? 'border-[#0052D9]/40 bg-[#0052D9]/[0.02]' : 'border-slate-100'}`}><div className="flex items-center justify-between gap-4 mb-4"><RatingStars rating={news.rating} /><span className="text-[10px] font-bold text-slate-400">{news.date}</span></div><h3 className="text-xl font-black text-slate-900 leading-snug mb-3">{news.sourceTitle}</h3><p className="text-sm text-slate-500 leading-relaxed mb-5">{news.summary}</p><DetailRows news={news} categoryId={category.id} /><div className="flex flex-wrap gap-3 mt-5"><a href={news.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black">查看原文<Icons.ExternalLink className="w-3 h-3" /></a>{news.interpretations?.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-xs font-black bg-slate-100 text-slate-600">{link.title}</a>)}</div></article>)}</div></motion.aside></>}</AnimatePresence>;
}

function HistorySidebar({open, selected, onClose, onSelect}: {open: boolean; selected: string; onClose: () => void; onSelect: (id: string) => void}) {
  return <AnimatePresence>{open && <><motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]" /><motion.aside initial={{x: '-100%'}} animate={{x: 0}} exit={{x: '-100%'}} className="fixed left-0 top-0 h-full w-full max-w-sm bg-white z-[110] shadow-2xl flex flex-col"><div className="p-8 border-b border-slate-100 flex justify-between"><div><h2 className="text-2xl font-black">历史期刊</h2><p className="text-[10px] text-[#0052D9] font-bold uppercase">Archived Issues</p></div><button onClick={onClose}><Icons.X /></button></div><div className="flex-grow overflow-y-auto p-6 space-y-3">{HISTORICAL_ISSUES.map((issue) => <button key={issue.issueId} onClick={() => {onSelect(issue.issueId); onClose();}} className={`w-full text-left p-5 rounded-2xl border ${selected === issue.issueId ? 'bg-[#0052D9] border-[#0052D9] text-white' : 'border-slate-100 hover:bg-slate-50'}`}><p className="text-[10px] font-black opacity-70">{issue.displayDate}</p><p className="text-sm font-bold">{issue.title}{issue.issueId === LATEST_ISSUE_ID ? '（最新）' : ''}</p></button>)}</div></motion.aside></>}</AnimatePresence>;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(LATEST_ISSUE_ID);
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory | null>(null);
  const [activeNewsId, setActiveNewsId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const displayIssue = HISTORICAL_ISSUES.find((issue) => issue.issueId === selectedDate) ?? LATEST_ISSUE;

  useEffect(() => {setLiked(localStorage.getItem('isLiked') === 'true'); setLikes(Number(localStorage.getItem('localLikes') || 0));}, []);
  const like = () => {if (liked) return; const next = likes + 1; setLikes(next); setLiked(true); localStorage.setItem('isLiked', 'true'); localStorage.setItem('localLikes', String(next));};
  const openDetail = (category: TrendCategory, newsId?: string) => {setSelectedCategory(category); setActiveNewsId(newsId ?? null);};

  return <div className="min-h-screen font-sans selection:bg-[#0052D9]/30"><BlueGradient /><button onClick={() => setHistoryOpen(true)} className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-l-0 border-slate-200 px-3 py-10 rounded-r-3xl shadow-2xl flex flex-col items-center gap-4 hover:bg-[#0052D9] group"><Icons.History className="w-5 h-5 text-slate-400 group-hover:text-white" /><span className="[writing-mode:vertical-lr] text-[10px] font-black text-slate-500 tracking-[0.3em] group-hover:text-white">历史期刊</span></button>
    <Navbar categories={displayIssue.categories} title={displayIssue.title} onHistory={() => setHistoryOpen(true)} liked={liked} likes={likes} onLike={like} />
    <main><Header displayDate={displayIssue.displayDate} /><section className="max-w-7xl mx-auto px-4 md:px-8 pb-32"><div className="mb-12"><h2 className="text-3xl font-extrabold text-slate-900 mb-5 flex items-center gap-3 font-display"><Icons.Cpu className="text-[#2468ff] w-8 h-8" />{PORTAL_CONTENT.site.focus_title}</h2><div className="w-16 h-1 bg-[#2468ff] rounded-full" /></div><div className="grid grid-cols-1 gap-10 max-w-6xl">{displayIssue.categories.map((category, index) => <TrendCard key={category.id} category={category} index={index} onOpen={openDetail} />)}</div></section><ExpertInsights content={PORTAL_CONTENT.expert_insights} /><CompetitorDashboard content={PORTAL_CONTENT.competitor_dashboard} /><About content={PORTAL_CONTENT.about} /></main>
    <CategoryDetail category={selectedCategory} activeNewsId={activeNewsId} onClose={() => {setSelectedCategory(null); setActiveNewsId(null);}} /><HistorySidebar open={historyOpen} selected={selectedDate} onClose={() => setHistoryOpen(false)} onSelect={setSelectedDate} /><Footer content={PORTAL_CONTENT.site} />
  </div>;
}
