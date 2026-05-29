import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CATEGORIES, HISTORICAL_ISSUES, TrendCategory, NewsDetail } from './data';
import { db } from './lib/firebase';
import { OperationType, handleFirestoreError } from './services/messageService';
import { feedbackService } from './services/feedbackService';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const BlueGradient = () => (
  <div className="fixed inset-0 -z-10 bg-[#f4f7fc]">
    <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#0052D9]/[0.05] rounded-full blur-[140px] -mr-64 -mt-64" />
    <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-indigo-500/[0.04] rounded-full blur-[120px] -ml-32 -mb-32" />
    <div className="absolute top-[35%] left-[25%] w-[550px] h-[550px] bg-sky-500/[0.03] rounded-full blur-[110px]" />
  </div>
);

const Navbar = ({ onOpenHistory, likesCount, onLike, isLiked, currentTitle }: { onOpenHistory: () => void; likesCount: number; onLike: () => void; isLiked: boolean; currentTitle: string }) => (
  <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/85 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0052D9] rounded-xl flex items-center justify-center shadow-md shadow-[#0052D9]/20 border border-white/10">
          <Icons.Cpu className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none font-display">丰行慧运情报中心</span>
          <span className="text-[9px] font-bold text-slate-400 tracking-[0.12em] uppercase mt-0.5">Intelligence & Decisions</span>
        </div>
      </div>
      <div className="hidden md:flex gap-10 items-center">
        <div className="relative group">
          <button className="flex items-center gap-1 text-sm font-semibold text-slate-500 group-hover:text-[#0052D9] transition-colors py-8 cursor-default">
            重点关注
            <Icons.ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
          
          <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/80 shadow-2xl rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex flex-col gap-1">
              {[
                { id: 'policy', label: '政策与监管动态' },
                { id: 'competitor', label: '竞品与标杆企业动态' },
                { id: 'industry', label: '产业与市场趋势' },
                { id: 'customer', label: '客户需求与场景机会' },
                { id: 'product_tech', label: '产品与技术动态' }
              ].map((link) => (
                <a 
                  key={link.id} 
                  href={`#cat-${link.id}`}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#0052D9]/5 hover:text-[#0052D9] transition-all flex items-center justify-between group/link"
                >
                  {link.label}
                  <Icons.ArrowRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all" />
                </a>
              ))}
            </div>
          </div>
        </div>
        {['专家观点', '竞品看板', '关于我们'].map((item) => (
          <a key={item} href={`#${item}`} className="text-sm font-semibold text-slate-500 hover:text-[#0052D9] transition-colors">
            {item}
          </a>
        ))}
        <button 
          onClick={onOpenHistory}
          className="text-sm font-semibold text-slate-500 hover:text-[#0052D9] transition-colors flex items-center gap-1.5"
        >
          历史期刊 <Icons.History className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onLike}
          disabled={isLiked}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all ${
            isLiked 
              ? 'bg-red-50/80 border-red-100 text-red-500' 
              : 'bg-slate-50 border-slate-200/80 text-slate-400 hover:border-red-200 hover:text-red-400'
          }`}
        >
          <Icons.Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-[11px] font-bold font-mono">{likesCount}</span>
        </button>
        <div className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-white tracking-[0.06em] shadow-md flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0052D9] animate-pulse" />
          {currentTitle}
        </div>
      </div>
    </div>
  </nav>
);

const SectionIcon = ({ name, className }: { name: string; className?: string }) => {
  // Map icons to smarter, tech-forward, high intelligence assets
  let iconName = name;
  if (name === "ShieldCheck" || name === "Shield" || name === "Fingerprint") {
    iconName = "Scale"; // Policy regulation balance
  } else if (name === "Target" || name === "Crosshair" || name === "Radar") {
    iconName = "Compass"; // Competitors strategy direction
  } else if (name === "Users" || name === "User" || name === "Zap") {
    iconName = "Boxes"; // Scene supply-chain layout opportunities
  } else if (name === "BarChart3" || name === "LineChart" || name === "Network") {
    iconName = "Globe"; // Industry and market global trends
  } else if (name === "Cpu" || name === "Settings" || name === "BrainCircuit") {
    iconName = "Workflow"; // Product routing and automation flow
  }
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent className={className} /> : <Icons.HelpCircle className={className} />;
};

const Header = ({ displayDate }: { displayDate: string }) => (
  <header className="pt-20 pb-12 max-w-7xl mx-auto px-8">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/80 border border-slate-200/50 rounded-full mb-8">
        <span className="w-1.5 h-1.5 bg-[#0052D9] rounded-full animate-pulse" />
        <span className="text-slate-500 font-mono text-[9px] font-bold tracking-wider uppercase">{displayDate} Issue | Weekly Intelligence Briefing</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-5 leading-[1.15] font-display">
        丰行慧运情报中心<br />
        <span className="text-[#0052D9] font-black">
          行业政策情报周度报告
        </span>
      </h1>
      <p className="text-base md:text-lg text-slate-500 font-medium max-w-3xl leading-relaxed">
        持续跟踪与丰行慧运业务相关的外部变化，精准识别政策红利、物流供应链需求、竞品动作与安全监管风险。
      </p>
    </motion.div>
  </header>
);

const NewsTable = ({ news, categoryId }: { news: NewsDetail; categoryId?: string }) => {
  const getLabels = () => {
    if (categoryId === 'customer') {
      return {
        eventProperty: '客户行业与主体',
        coreFacts: '新闻实质内容',
        strategicSignal: '业务痛点推演',
        businessConnection: '丰行慧运契合点'
      };
    }
    if (categoryId === 'competitor') {
      return {
        eventProperty: '动态类别',
        coreFacts: '核心内容',
        strategicSignal: '战略意义',
        businessConnection: '对丰行慧运的启示'
      };
    }
    if (categoryId === 'industry') {
      return {
        eventProperty: '背景',
        coreFacts: '核心内容',
        strategicSignal: '趋势意义',
        judgmentSuggestion: '风险挑战',
        businessConnection: '对丰行慧运的启示'
      };
    }
    if (categoryId === 'product_tech') {
      return {
        eventProperty: '信息类型',
        coreFacts: '核心技术突破',
        strategicSignal: '重点研发产品/方向',
        businessConnection: '对丰行慧运的启示'
      };
    }
    return {
      eventProperty: '政策属性',
      coreFacts: '政策内容',
      strategicSignal: '政策意义',
      businessConnection: '对丰行慧运的启示',
      judgmentSuggestion: '研判建议'
    };
  };

  const labels = getLabels();

  return (
    <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm my-6">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 font-bold text-slate-900 w-32">字段</th>
            <th className="px-6 py-4 font-bold text-slate-900">内容详情</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(categoryId === 'industry' ? [
            { label: '发布时间', content: news.date },
            { label: '背景', content: news.strategicSignal },
            { label: '核心内容', content: news.coreFacts },
            { label: '趋势意义', content: news.businessConnection },
            { label: '风险挑战', content: news.judgmentSuggestion },
          ] : [
            { label: '发布时间', content: news.date },
            { label: labels.eventProperty, content: news.eventProperty },
            { label: labels.coreFacts, content: news.coreFacts },
            { label: labels.strategicSignal, content: news.strategicSignal },
            { label: labels.businessConnection, content: news.businessConnection },
            ...(news.judgmentSuggestion ? [{ label: labels.judgmentSuggestion || '研判建议', content: news.judgmentSuggestion }] : []),
          ]).map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors bg-white">
              <td className="px-6 py-4 font-bold text-slate-600/90 bg-slate-50/70 border-r border-slate-100/60 w-32 text-xs tracking-wide">{row.label}</td>
              <td className="px-6 py-4 text-slate-700 leading-relaxed font-medium">
                <div className="prose prose-sm max-w-none prose-slate leading-snug prose-p:my-1 prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{row.content}</ReactMarkdown>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
        <div className="flex justify-end">
          <a 
            href={news.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-[#0052D9] hover:text-[#0045c4] underline uppercase tracking-widest flex items-center gap-1"
          >
            查看官网原文 <Icons.ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        {((news.downloads && news.downloads.length > 0) || (news.interpretations && news.interpretations.length > 0)) && (
          <div className="pt-4 border-t border-slate-200/60 space-y-4">
            {news.downloads && news.downloads.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">附件下载</span>
                <div className="flex flex-wrap gap-4">
                  {news.downloads.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#0052D9] font-bold hover:underline text-xs">
                      <Icons.FileText className="w-4 h-4" /> {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {news.interpretations && news.interpretations.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">相关解读回顾</span>
                <div className="flex flex-col gap-2">
                  {news.interpretations.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#0052D9] font-bold hover:underline text-xs">
                      <Icons.FileSearch className="w-4 h-4" /> {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryDetail = ({ isOpen, onClose, category, activeNewsId }: { isOpen: boolean; onClose: () => void; category: TrendCategory | null; activeNewsId: string | null }) => {
  if (!category) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white z-[70] shadow-2xl overflow-y-auto px-8 py-12 md:px-12"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-2xl w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              <Icons.X className="w-6 h-6 text-slate-400" />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#0052D9] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0052D9]/20 border border-white/10">
                <SectionIcon name={category.icon} className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">{category.title}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mt-0.5">{category.id.toUpperCase()} Intelligence Pool</p>
              </div>
            </div>
            
            <div className="space-y-12 pb-20">
              {category.news.map((item) => (
                <section 
                  key={item.id} 
                  id={`news-${item.id}`}
                  className={`space-y-4 p-6 rounded-3xl transition-all border border-transparent ${activeNewsId === item.id ? 'bg-[#0052D9]/[0.02] border-[#0052D9]/10 shadow-sm' : ''}`}
                >
                  <h3 className="text-xl font-bold text-slate-900 border-l-[4px] border-[#0052D9] pl-4 leading-normal">
                    {item.sourceTitle}
                  </h3>
                  <NewsTable news={item} categoryId={category.id} />
                </section>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const StrategicInsight = () => {
  return (
    <section id="专家观点" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100 scroll-mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 font-display">
            <Icons.Brain className="text-[#0052D9] w-10 h-10" />
            专家观点与深度综述
          </h2>
          <div className="w-20 h-1 bg-[#0052D9] rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: 空间智能 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200/60 p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-2xl hover:shadow-[#0052D9]/[0.04] hover:border-[#0052D9]/20 transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-tr from-[#0052D9]/5 to-indigo-500/5 rounded-full blur-[100px] -mr-24 -mt-24 group-hover:from-[#0052D9]/10 group-hover:to-indigo-500/10 transition-all duration-700" />
          
          <div className="relative z-10 flex-grow">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black text-white bg-indigo-600 px-3.5 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm shadow-indigo-600/10">权威发布</span>
              <span className="text-[10px] font-black text-slate-400">2026年3月发布</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 leading-tight font-display">
              《空间智能发展报告》
            </h3>
            
            <div className="space-y-6 mb-8">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">联合编制单位</p>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  工信部元宇宙标准化标委会（筹）<br />
                  中电标协元宇宙工作委员会
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                  《空间智能发展报告》揭示了人工智能正在从<span className="text-[#0052D9] font-bold">“读万卷书”</span>的信息阶段，迈向<span className="text-[#0052D9] font-bold">“行万里路”</span>的物理交互时代。
                </p>

                <div className="border-l-4 border-[#0052D9] pl-4 py-1">
                  <h4 className="text-sm font-black text-slate-900 mb-1">什么是空间智能？</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    智能体在三维空间中感知、理解、推理与实时的自主决策。通过多模态数据，让机器具备在物理环境导航、协同协作能力。
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">技术演进阶段</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { time: "60年代", title: "几何建模" },
                      { time: "21世纪初", title: "感知融合" },
                      { time: "10年代", title: "语义理解" },
                      { time: "现阶段", title: "虚实共生" }
                    ].map((stage, i) => (
                      <div key={stage.title} className="flex items-start gap-2">
                        <span className="text-[8px] font-black text-[#0052D9] bg-[#0052D9]/10 w-4 h-4 rounded-full flex items-center justify-center mt-0.5">{i+1}</span>
                        <div>
                          <p className="text-[8px] font-bold text-slate-400">{stage.time}</p>
                          <p className="text-xs text-slate-700 font-black">{stage.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4 mt-6">
            <a 
              href="https://pan.baidu.com/s/1gxj987Lxje7vkOVjSG366Q?pwd=0409" 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-[#0052D9] text-white px-5 py-3 rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-[#0052D9]/20 group/btn"
            >
              下载完整 PDF <Icons.ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </a>
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
              微信公众号 “赛西元宇宙” 发送「空间智能」获取（提取码：0409）
            </p>
          </div>
        </motion.div>

        {/* Card 2: Flowr Multi-Agent Supply Chain Automation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200/60 p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-2xl hover:shadow-[#0052D9]/[0.04] hover:border-[#0052D9]/20 transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-[100px] -mr-24 -mt-24 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-700" />
          
          <div className="relative z-10 flex-grow">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black text-white bg-emerald-600 px-3.5 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm shadow-emerald-600/10">学术前沿</span>
              <span className="text-[10px] font-black text-slate-400">2026年最新 ArXiv 预印本</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 leading-tight font-display">
              Flowr：多智能体 AI 正在走向“供应链流程自动化”
            </h3>
            
            <div className="space-y-6 mb-8">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">研究团队 / 机构</p>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  Old Dominion University、德勤 (Deloitte)、埃森哲实验室 (Accenture Technology Labs) 等机构
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                  本研究揭示：目前供应链、采购及物流管理中大部分异常跟进依旧严重依赖人工协调。通过 <span className="text-[#0052D9] font-black">Flowr</span> 框架，可以把流程拆分为若干个专业智能体 (Agents)，在人类监督下实现端到端闭环自动化。
                </p>

                <div className="p-4 bg-[#0052D9]/[0.03] border-l-4 border-[#0052D9] rounded-r-2xl my-4">
                  <p className="text-[8px] font-black text-[#0052D9] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Icons.Lightbulb size={9} />
                    核心战略逻辑 / THE CORE STATEMENT
                  </p>
                  <p className="text-xs text-slate-800 font-black italic leading-relaxed">
                    “这篇文章的价值在于提醒：AI 真正改变供应链和货运行业的方式，不是‘回答问题’，而是‘参与流程、协调角色、处理异常、辅助决策’。”
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">对丰行慧运的启示与战略演进</p>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-start gap-2 bg-emerald-50/20 p-3 rounded-xl border border-emerald-500/5">
                      <Icons.ChevronRight size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-700 font-black">
                        丰行未来的 AI 产品不能仅停留在信息问答或报表生成，而应深扎经营，成为调度、派车、在途、异常、风控的“业务执行型智能体” (Action-Oriented Agent)。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4 mt-6">
            <a 
              href="https://arxiv.org/pdf/2604.05987" 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-[#0052D9] text-white px-5 py-3 rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-emerald-600/20 group/btn"
            >
              阅读 ArXiv 论文 [PDF] <Icons.ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </a>
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
              ArXiv:2604.05987 | 由学术团队与头部咨询机构共同发布的供应链智能体标杆文献
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Tooltip = ({ text, children, width = "w-[140px]" }: { text: string; children: React.ReactNode; width?: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block w-full h-full" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 ${width} bg-slate-900 text-white rounded-xl shadow-2xl border border-white/10 pointer-events-none whitespace-normal`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#0052D9] border-b border-white/5 pb-2 flex items-center gap-2">
                <Icons.Info size={10} />
                指标释义
              </span>
              <p className="text-[12px] leading-relaxed font-medium text-slate-200">
                {text}
              </p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompetitorDashboard = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'hr' | 'rd'>('financial');

  const RAW_COMPETITOR_GROUPS = [
    {
      category: "一、车队安全风控与车辆智能化",
      companies: [
        { 
          name: "Samsara", status: "美股", code: "IOT.N",
          financial: { cap: "1251.06", rev2025: "12.49", growth2025: "33.26%", profit: "-1.55", grossMargin: "76.12%", netMargin: "-12.40%" },
          hr: { revPerPerson: "-", profitPerPerson: "-", salaryPerPerson: "-", employeeCount: "4,100", mastersRatio: "-", rop: "-" },
          rd: { rdInvestment: "-", rdIntensity: "-", rdPersonnelCount: "-", rdPersonnelRatio: "-", patentCount: "-" }
        },
        { 
          name: "锐明技术", status: "A股", code: "002970.SZ",
          financial: { cap: "123.20", rev2025: "24.77", growth2025: "-10.82%", profit: "3.89", grossMargin: "45.18%", netMargin: "15.68%" },
          hr: { revPerPerson: "111.02", profitPerPerson: "17.15", salaryPerPerson: "20.23", employeeCount: "2,231", mastersRatio: "8.96%", rop: "85.29%", mastersCount: 200, phdCount: 0 },
          rd: { rdInvestment: "2.86", rdIntensity: "11.54%", rdPersonnelCount: "690", rdPersonnelRatio: "30.93%", patentCount: "563" }
        },
        { 
          name: "启明信息", status: "A股", code: "002232.SZ",
          financial: { cap: "66.51", rev2025: "7.74", growth2025: "-11.88%", profit: "0.33", grossMargin: "27.44%", netMargin: "4.20%" },
          hr: { revPerPerson: "50.10", profitPerPerson: "2.11", salaryPerPerson: "20.88", employeeCount: "1,545", mastersRatio: "10.68%", rop: "6.88%", mastersCount: 165, phdCount: 0 },
          rd: { rdInvestment: "1.17", rdIntensity: "15.09%", rdPersonnelCount: "961", rdPersonnelRatio: "62.20%", patentCount: "79" }
        }
      ]
    },
    {
      category: "二、数字货运与运力交易平台",
      companies: [
        { 
          name: "满帮集团", status: "美股", code: "YMM.N",
          financial: { cap: "626.60", rev2025: "124.90", growth2025: "11.13%", profit: "44.59", grossMargin: "63.02%", netMargin: "35.70%" },
          hr: { revPerPerson: "-", profitPerPerson: "-", salaryPerPerson: "-", employeeCount: "8,251", mastersRatio: "-", rop: "-" },
          rd: { rdInvestment: "-", rdIntensity: "-", rdPersonnelCount: "-", rdPersonnelRatio: "-", patentCount: "241" }
        },
        { 
          name: "快狗打车", status: "港股", code: "2246.HK",
          financial: { cap: "1.01", rev2025: "6.71", growth2025: "1.58%", profit: "-1.63", grossMargin: "28.12%", netMargin: "-24.25%" },
          hr: { revPerPerson: "-", profitPerPerson: "-", salaryPerPerson: "-", employeeCount: "548", mastersRatio: "-", rop: "-" },
          rd: { rdInvestment: "-", rdIntensity: "-", rdPersonnelCount: "-", rdPersonnelRatio: "-", patentCount: "32" }
        }
      ]
    },
    {
      category: "三、综合物流与供应链服务平台",
      companies: [
        { 
          name: "京东物流", status: "港股", code: "2618.HK",
          financial: { cap: "752.75", rev2025: "2171.47", growth2025: "18.77%", profit: "68.90", grossMargin: "9.10%", netMargin: "3.17%" },
          hr: { revPerPerson: "-", profitPerPerson: "-", salaryPerPerson: "-", employeeCount: "682,705", mastersRatio: "-", rop: "-" },
          rd: { rdInvestment: "-", rdIntensity: "-", rdPersonnelCount: "-", rdPersonnelRatio: "-", patentCount: "2,235" }
        },
        { 
          name: "传化智联", status: "A股", code: "002010.SZ",
          financial: { cap: "148.70", rev2025: "250.84", growth2025: "-6.05%", profit: "6.41", grossMargin: "15.00%", netMargin: "2.55%" },
          hr: { revPerPerson: "530.47", profitPerPerson: "12.46", salaryPerPerson: "32.75", employeeCount: "4,731", mastersRatio: "10.36%", rop: "85.96%", mastersCount: 457, phdCount: 33 },
          rd: { rdInvestment: "4.55", rdIntensity: "1.81%", rdPersonnelCount: "911", rdPersonnelRatio: "19.26%", patentCount: "140" }
        }
      ]
    },
    {
      category: "四、智慧交通与车路协同基础设施",
      companies: [
        { 
          name: "千方科技", status: "A股", code: "002373.SZ",
          financial: { cap: "131.16", rev2025: "82.17", growth2025: "13.35%", profit: "2.91", grossMargin: "31.20%", netMargin: "3.54%" },
          hr: { revPerPerson: "136.50", profitPerPerson: "4.46", salaryPerPerson: "28.71", employeeCount: "6,020", mastersRatio: "21.16%", rop: "18.04%", mastersCount: 1274, phdCount: 0 },
          rd: { rdInvestment: "11.39", rdIntensity: "13.86%", rdPersonnelCount: "2,508", rdPersonnelRatio: "41.66%", patentCount: "3,251" }
        },
        { 
          name: "万集科技", status: "A股", code: "300552.SZ",
          financial: { cap: "65.45", rev2025: "10.94", growth2025: "17.61%", profit: "-1.74", grossMargin: "32.43%", netMargin: "-15.86%" },
          hr: { revPerPerson: "72.84", profitPerPerson: "-12.06", salaryPerPerson: "28.18", employeeCount: "1,502", mastersRatio: "24.77%", rop: "-36.29%", mastersCount: 361, phdCount: 11 },
          rd: { rdInvestment: "2.51", rdIntensity: "22.93%", rdPersonnelCount: "406", rdPersonnelRatio: "27.03%", patentCount: "1,166" }
        }
      ]
    },
    {
      category: "五、能源/加油/充电/车后服务",
      companies: [
        { 
          name: "能链智电", status: "美股", code: "NAAS.O",
          financial: { cap: "2.25", rev2025: "3.20", growth2025: "50.60%", profit: "-3.85", grossMargin: "35.15%", netMargin: "-120.31%" },
          hr: { revPerPerson: "64.00", profitPerPerson: "-77.00", salaryPerPerson: "28.50", employeeCount: "500", mastersRatio: "-", rop: "-" },
          rd: { rdInvestment: "0.45", rdIntensity: "14.06%", rdPersonnelCount: "115", rdPersonnelRatio: "23.00%", patentCount: "135" }
        }
      ]
    }
  ];

  const competitorGroups = useMemo(() => {
    return RAW_COMPETITOR_GROUPS.map(group => ({
      ...group,
      companies: group.companies.map(company => {
        const parseNumber = (val: string | number | undefined): number | null => {
          if (val === undefined || val === null) return null;
          if (typeof val === 'number') return val;
          const cleaned = val.toString().replace(/,/g, '').trim();
          if (cleaned === '-' || cleaned === '') return null;
          const num = parseFloat(cleaned);
          return isNaN(num) ? null : num;
        };

        const empCount = parseNumber(company.hr.employeeCount);

        // Calculate Masters & Above Ratio (including PhDs and Masters)
        let computedMastersRatio = company.hr.mastersRatio;
        if (company.hr.mastersCount !== undefined && company.hr.phdCount !== undefined) {
          const mCount = parseNumber(company.hr.mastersCount) || 0;
          const pCount = parseNumber(company.hr.phdCount) || 0;
          if (empCount && empCount > 0) {
            computedMastersRatio = (((mCount + pCount) / empCount) * 100).toFixed(2) + "%";
          }
        }

        // Calculate RD Personnel Ratio (rdPersonnelCount / employeeCount)
        let computedRdPersonnelRatio = company.rd.rdPersonnelRatio;
        if (company.rd.rdPersonnelCount !== undefined && company.rd.rdPersonnelCount !== "-") {
          const rdCount = parseNumber(company.rd.rdPersonnelCount);
          if (rdCount !== null && empCount && empCount > 0) {
            computedRdPersonnelRatio = ((rdCount / empCount) * 100).toFixed(2) + "%";
          }
        }

        return {
          ...company,
          hr: {
            ...company.hr,
            mastersRatio: computedMastersRatio
          },
          rd: {
            ...company.rd,
            rdPersonnelRatio: computedRdPersonnelRatio
          }
        };
      })
    }));
  }, [RAW_COMPETITOR_GROUPS]);

  return (
    <section id="竞品看板" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100 scroll-mt-20">
      <div className="mb-16">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 font-display">
          <Icons.Binoculars className="text-[#0052D9] w-10 h-10" />
          竞品看板与年度对标 (2025 FY)
        </h2>
        <div className="w-20 h-1 bg-[#0052D9] rounded-full mb-8" />

      </div>

      <div className="space-y-20">
        {/* Quantitative Table */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-l-[4px] border-[#0052D9] pl-4 uppercase tracking-wider font-display">Competitive Analytics | 竞对定量分析</h3>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {[
                  { id: 'financial', label: '财务指标' },
                  { id: 'hr', label: '人力指标' },
                  { id: 'rd', label: '研发指标' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white text-[#0052D9] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-3 py-2 rounded-md border border-slate-100 h-fit">
              数据来源：Wind | 所有金额以人民币 (CNY) 计 | 数据更新时间为2026年5月29日，季度更新总市值等数据
            </span>
          </div>

          <div className="overflow-x-auto rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse bg-white whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest border-r border-slate-800">竞对定位</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest">竞对名称</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">上市情况</th>
                  
                  {activeTab === 'financial' && (
                    <>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center border-l border-slate-800">总市值 (亿元)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center bg-[#0052D9]">营业总收入 (亿元)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">营收同比增长率 (%)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">净利润 (亿元)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">销售毛利率 (%)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">销售净利率 (%)</th>
                    </>
                  )}

                  {activeTab === 'hr' && (
                    <>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center border-l border-slate-800">人均创收 (万元)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">人均创利 (万元)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center bg-[#0052D9]">人均薪酬 (万元)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">员工总数 (人)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">硕士及以上占比 (%)</th>
                      <th className="p-0 text-[10px] font-black uppercase tracking-widest text-center border-l border-slate-800">
                        <Tooltip text="ROP是人力资源投入的利润回报率,体现了企业价值相比员工价值的高低,P体现员工价值; R体现企业价值. 该指标适用于主要成本为人力投入的企业, 比如软件服务业。">
                          <div className="p-6 h-full w-full flex items-center justify-center gap-1 cursor-help">
                            人力投入回报率 (ROP)
                            <Icons.HelpCircle size={10} className="text-slate-400" />
                          </div>
                        </Tooltip>
                      </th>
                    </>
                  )}

                  {activeTab === 'rd' && (
                    <>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center border-l border-slate-800">研发投入 (亿元)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center bg-[#0052D9]">研发费用占营收比 (%)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">研发人员数量 (人)</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">研发人员占比 (%)</th>
                      <th className="p-0 text-[10px] font-black uppercase tracking-widest text-center">
                        <Tooltip text="合并报表范围内本上市公司及控股一级子公司在指定截止日内，专利法律状态为授权的专利总数。">
                          <div className="p-6 h-full w-full flex items-center justify-center gap-1 cursor-help">
                            有效专利总数 (个)
                            <Icons.HelpCircle size={10} className="text-slate-400" />
                          </div>
                        </Tooltip>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-sm">
                {competitorGroups.map((group) => (
                  group.companies.map((row: any, i) => (
                    <tr key={`${group.category}-${row.name}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      {i === 0 && (
                        <td 
                          rowSpan={group.companies.length} 
                          className="p-6 font-black text-slate-900 bg-slate-50/80 border-r border-slate-100 align-middle w-40 whitespace-normal text-xs leading-relaxed"
                        >
                          {group.category}
                        </td>
                      )}
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{row.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">{row.code}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          row.status === '港股' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          row.status === '美股' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                          row.status === 'A股' ? 'bg-[#0052D9]/5 text-[#0052D9] border border-[#0052D9]/20' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {row.status}
                        </span>
                      </td>

                      {activeTab === 'financial' && (
                        <>
                          <td className="p-6 font-bold text-slate-900 text-center border-l border-slate-50">{row.financial.cap}</td>
                          <td className="p-6 text-[#0052D9] font-black text-center bg-[#0052D9]/5 underline decoration-[#0052D9]/30 underline-offset-4">{row.financial.rev2025}</td>
                          <td className="p-6 font-bold text-slate-600 text-center">{row.financial.growth2025}</td>
                          <td className="p-6 font-bold text-slate-900 text-center">{row.financial.profit}</td>
                          <td className="p-6 font-bold text-slate-600 text-center">{row.financial.grossMargin}</td>
                          <td className="p-6 font-bold text-slate-600 text-center">{row.financial.netMargin}</td>
                        </>
                      )}

                      {activeTab === 'hr' && (
                        <>
                          <td className="p-6 font-bold text-slate-900 text-center border-l border-slate-50">{row.hr.revPerPerson}</td>
                          <td className="p-6 font-bold text-slate-600 text-center">{row.hr.profitPerPerson}</td>
                          <td className="p-6 text-[#0052D9] font-black text-center bg-[#0052D9]/5 underline decoration-[#0052D9]/30 underline-offset-4">{row.hr.salaryPerPerson}</td>
                          <td className="p-6 font-bold text-slate-900 text-center">{row.hr.employeeCount}</td>
                          <td className="p-0 font-bold text-slate-600 text-center">
                            {row.hr.mastersRatio !== "-" && row.hr.mastersCount !== undefined ? (
                              <Tooltip 
                                width="w-[280px]"
                                text={`高学历占比公式：\n(硕士人数 ${row.hr.mastersCount} + 博士人数 ${row.hr.phdCount}) / 员工总数 ${row.hr.employeeCount} = ${row.hr.mastersRatio}`}
                              >
                                <div className="p-6 h-full w-full cursor-help underline decoration-dashed decoration-slate-300 underline-offset-4 hover:text-[#0052D9] transition-colors">
                                  {row.hr.mastersRatio}
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="p-6">{row.hr.mastersRatio}</div>
                            )}
                          </td>
                          <td className="p-0 font-bold text-slate-500 text-center border-l border-slate-50 italic">
                            <Tooltip text="ROP是人力资源投入的利润回报率,体现了企业价值相比员工价值的高低,P体现员工价值; R体现企业价值. 该指标适用于主要成本为人力投入的企业, 比如软件服务业。">
                              <div className="p-6 h-full w-full cursor-help">
                                {row.hr.rop}
                              </div>
                            </Tooltip>
                          </td>
                        </>
                      )}

                      {activeTab === 'rd' && (
                        <>
                          <td className="p-6 font-bold text-slate-900 text-center border-l border-slate-50">{row.rd.rdInvestment}</td>
                          <td className="p-6 text-[#0052D9] font-black text-center bg-[#0052D9]/5 underline decoration-[#0052D9]/30 underline-offset-4">{row.rd.rdIntensity}</td>
                          <td className="p-6 font-bold text-slate-600 text-center">{row.rd.rdPersonnelCount}</td>
                          <td className="p-0 font-bold text-slate-900 text-center">
                            {row.rd.rdPersonnelRatio !== "-" && row.rd.rdPersonnelCount !== "-" ? (
                              <Tooltip 
                                width="w-[280px]"
                                text={`研发人员占比公式：\n研发人员数 ${row.rd.rdPersonnelCount} / 员工总数 ${row.hr.employeeCount} = ${row.rd.rdPersonnelRatio}`}
                              >
                                <div className="p-6 h-full w-full cursor-help underline decoration-dashed decoration-slate-300 underline-offset-4 hover:text-[#0052D9] transition-colors">
                                  {row.rd.rdPersonnelRatio}
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="p-6">{row.rd.rdPersonnelRatio}</div>
                            )}
                          </td>
                          <td className="p-0 font-bold text-slate-600 text-center">
                            <Tooltip text="合并报表范围内本上市公司及控股一级子公司在指定截止日内，专利法律状态为授权的专利总数。">
                              <div className="p-6 h-full w-full cursor-help">
                                {row.rd.patentCount}
                              </div>
                            </Tooltip>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

const TrendCard = ({ category, index, onOpen }: { category: TrendCategory; index: number; onOpen: (cat: TrendCategory, newsId?: string) => void; key?: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      id={`cat-${category.id}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-slate-200/60 p-8 md:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-2xl hover:shadow-[#0052D9]/[0.03] hover:border-[#0052D9]/30 transition-all duration-500 overflow-hidden scroll-mt-24 bg-white"
    >
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-slate-100/40 rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000 ease-out -z-0" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16">
        {/* Left Side: Category Info */}
        <div className="md:w-1/3 flex flex-col">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-[#0052D9] group-hover:shadow-[0_8px_20px_-4px_rgba(65,105,225,0.4)] transition-all duration-500 mb-8 shadow-sm">
            <SectionIcon name={category.icon} className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-500" />
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 mb-4 group-hover:text-[#0052D9] transition-colors tracking-tight font-display">
            {category.title}
          </h3>
          
          <p className="text-xs text-slate-400 leading-relaxed font-semibold mb-8 pr-4">
            {category.description}
          </p>

          <button 
             onClick={() => onOpen(category)}
             className="mt-auto flex items-center gap-2 text-[10px] font-bold text-[#0052D9] uppercase tracking-widest hover:text-[#0045c4] transition-colors group/btn"
          >
            查看分类全文 <Icons.ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right Side: News Items */}
        <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-12">
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 block font-mono">近期要闻回顾</div>
            {category.news.map((item) => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(category, item.id);
                }}
                className="w-full text-left p-4 rounded-xl border border-transparent hover:border-slate-200/50 hover:bg-slate-50/50 hover:shadow-sm transition-all group/item flex items-center justify-between"
              >
                <div className="flex flex-col gap-1 flex-grow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full flex-shrink-0 group-hover/item:bg-[#0052D9] transition-colors" />
                      <span className="text-sm text-slate-800 font-bold leading-relaxed group-hover/item:text-[#0052D9] transition-colors">
                        {item.sourceTitle.replace(/^新闻\d+：/, '')}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-350 font-medium group-hover/item:text-[#6f8df1] transition-colors flex-shrink-0">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-1 pl-4 group-hover/item:text-slate-500 transition-colors">
                    {item.coreFacts.replace(/[#*|`-]/g, '').replace(/\n/g, ' ').substring(0, 100)}
                  </p>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-slate-200 group-hover/item:text-[#0052D9] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeedbackForm = () => {
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus('submitting');
    try {
      await feedbackService.submitFeedback({ content, contact });
      setContent('');
      setContact('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="w-full md:w-80 flex-shrink-0 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-[#0052D9]/10 rounded-lg flex items-center justify-center">
          <Icons.MessageSquare className="w-4 h-4 text-[#0052D9]" />
        </div>
        <h4 className="text-sm font-black text-slate-900 tracking-tight">留言反馈与建议</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="我们非常重视您的每一条建议。在这里留下您对情报中心内容、格式或功能的想法..."
          className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-[13px] font-medium focus:ring-2 focus:ring-[#0052D9]/20 focus:border-[#0052D9] outline-none transition-all resize-none leading-relaxed placeholder:text-slate-300"
          required
        />
        <div className="relative">
          <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="联系方式 (选填: 邮箱/电话/部门)"
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-[11px] font-medium focus:ring-2 focus:ring-[#0052D9]/20 focus:border-[#0052D9] outline-none transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting' || !content.trim()}
          className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
            status === 'success' 
              ? 'bg-emerald-500 text-white shadow-emerald-200' 
              : status === 'error'
              ? 'bg-red-500 text-white shadow-red-200'
              : 'bg-slate-900 hover:bg-[#0052D9] text-white shadow-slate-200 hover:shadow-[#0052D9]/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {status === 'submitting' ? (
            <Icons.Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <>
              已成功发送 <Icons.CheckCircle2 className="w-4 h-4" />
            </>
          ) : status === 'error' ? (
            '提交失败，请重试'
          ) : (
            <>
              提交反馈 <Icons.ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        {status === 'success' && (
          <p className="text-[10px] text-emerald-600 font-bold text-center">感谢您的宝贵建议！</p>
        )}
      </form>
    </div>
  );
};

const AboutUs = () => {
  return (
    <section id="关于我们" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100 scroll-mt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 font-display">
            <Icons.Compass className="text-[#0052D9] w-8 h-8" />
            关于我们
          </h2>
          <div className="w-16 h-1 bg-[#0052D9] rounded-full mb-8" />
          <div className="bg-white border border-[#0052D9]/10 p-10 rounded-[40px] shadow-sm shadow-[#0052D9]/5 overflow-hidden relative group/hero">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052D9]/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover/hero:bg-[#0052D9]/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
              <div className="flex-grow space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 italic">丰行慧运情报中心</h3>
                  <p className="text-[10px] font-bold text-[#0052D9] uppercase tracking-[0.2em]">Produced by Public Affairs Department</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                       <Icons.Compass className="w-3.5 h-3.5" /> 我们的初心
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      我们致力于提供更智能、高效且高价值的情报研判，通过深耕行业动态精准赋能业务。我们虚心听取各方建议，并积极改进，力求产出更具价值的资讯与洞察。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                       <Icons.Users className="w-3.5 h-3.5" /> 协同计划
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      情报工作重在共创。我们期待通过紧密的合作与深度交流学习，与各部门并肩同行，在知识流转中共同发掘市场增量，助力业务多元化成长。
                    </p>
                  </div>
                </div>
              </div>
              
              <FeedbackForm />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-slate-100 py-16 bg-white">
    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Icons.Globe className="text-white w-4 h-4" />
          </div>
          <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">
            Huiyun Intelligence
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium max-w-xs uppercase leading-loose tracking-widest">
           Strategic excellence in spatial data and AI decision support.
        </p>
      </div>
      
      <div className="flex gap-12 text-xs font-bold text-slate-300 uppercase tracking-widest">
        <span>© 2026 丰行慧运</span>
        <span>版本 2.4.1</span>
      </div>
    </div>
  </footer>
);

const HistorySidebar = ({ isOpen, onClose, selectedDate, onSelect }: { isOpen: boolean; onClose: () => void; selectedDate: string; onSelect: (date: string) => void }) => {
  const currentIssueDate = "2026-05-29";
  const allIssues = [
    { date: currentIssueDate, title: '2026年5月29日刊 (最新)', isCurrent: true },
    ...HISTORICAL_ISSUES.map(issue => ({ date: issue.date, title: issue.title, isCurrent: false }))
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full max-w-sm bg-white z-[110] shadow-2xl border-r border-slate-100 flex flex-col"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">历史期刊</h2>
                <p className="text-[10px] font-bold text-[#0052D9] uppercase tracking-widest mt-1">Archived Issues</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <Icons.X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-3">
              {allIssues.map((issue, idx) => {
                const isActive = selectedDate === issue.date;
                return (
                  <button
                    key={issue.date}
                    onClick={() => {
                      onSelect(issue.date);
                      onClose();
                    }}
                    className={`w-full text-left p-5 rounded-2xl transition-all border flex items-center justify-between group ${
                      isActive 
                        ? 'bg-[#0052D9] border-[#0052D9] shadow-lg shadow-[#0052D9]/20 text-white' 
                        : 'bg-white border-slate-100 hover:border-[#0052D9]/20 hover:bg-[#0052D9]/5'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-50' : 'text-slate-400'}`}>
                        {issue.date.replace(/-/g, '.')}
                      </p>
                      <p className={`text-sm font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-[#0052D9] transition-colors'}`}>
                        {issue.title}
                      </p>
                    </div>
                    {isActive ? (
                      <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    ) : (
                      <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0052D9] transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="p-8 border-t border-slate-50 bg-slate-50/50">
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                * 历史数据仅供内部决策参考。如需查询更早之前的情报汇总，请联系情报中心。
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory | null>(null);
  const [activeNewsId, setActiveNewsId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-05-29");

  // Derive data based on selection
  const isCurrentIssue = selectedDate === "2026-05-29";
  const displayIssue = isCurrentIssue 
    ? { title: "2026年5月29日刊", date: "2026.05.29", categories: CATEGORIES }
    : HISTORICAL_ISSUES.find(issue => issue.date === selectedDate) || { title: "未知期刊", date: selectedDate, categories: [] };

  useEffect(() => {
    // Test connection as per skill recommendation
    const testConnection = async () => {
      try {
        const { getDocFromServer } = await import('firebase/firestore');
        await getDocFromServer(doc(db, 'counters', 'likes'));
        console.log('Firestore connection verified');
      } catch (error) {
        console.error('Firestore connection test failed:', error);
      }
    };
    testConnection();

    // Check if user has already liked (local storage for simple persistence without auth)
    const hasLiked = localStorage.getItem('isLiked') === 'true';
    setIsLiked(hasLiked);

    const likesDoc = doc(db, 'counters', 'likes');
    const unsub = onSnapshot(likesDoc, (docSnap) => {
      if (docSnap.exists()) {
        setLikesCount(docSnap.data().likes || 0);
      } else {
        // Initialize if not exists
        setDoc(likesDoc, { likes: 0, lastUpdated: serverTimestamp() }).catch(err => {
          console.error('Error initializing likes:', err);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'counters/likes');
    });

    return () => unsub();
  }, []);

  const handleLike = async () => {
    if (isLiked) return;
    
    const likesDoc = doc(db, 'counters', 'likes');
    try {
      // Use updateDoc to increment
      // If doc doesn't exist, this fails, but onSnapshot handles initialization
      const snap = await getDoc(likesDoc);
      if (!snap.exists()) {
        await setDoc(likesDoc, { likes: 1, lastUpdated: serverTimestamp() });
      } else {
        await updateDoc(likesDoc, {
          likes: (snap.data().likes || 0) + 1,
          lastUpdated: serverTimestamp()
        });
      }
      setIsLiked(true);
      localStorage.setItem('isLiked', 'true');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'counters/likes');
    }
  };

  const handleOpenDetail = (category: TrendCategory, newsId?: string) => {
    setSelectedCategory(category);
    setActiveNewsId(newsId || null);
    setIsDetailOpen(true);
    
    if (newsId) {
      setTimeout(() => {
        const element = document.getElementById(`news-${newsId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#0052D9]/30">
      <BlueGradient />
      
      {/* History Toggle Button (Fixed Left) */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setIsHistoryOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-l-0 border-slate-200 px-3 py-10 rounded-r-3xl shadow-2xl flex flex-col items-center gap-4 group hover:bg-[#0052D9] hover:border-[#0052D9] transition-all duration-300"
      >
        <Icons.History className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-white transition-colors">历史期刊</span>
      </motion.button>

      <Navbar 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        likesCount={likesCount}
        onLike={handleLike}
        isLiked={isLiked}
        currentTitle={displayIssue.title}
      />
      <main>
        <Header displayDate={displayIssue.date} />
        
        <section className="max-w-7xl mx-auto px-8 pb-32">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 font-display">
              <Icons.Cpu className="text-[#0052D9] w-10 h-10" />
              重点关注
            </h2>
            <div className="w-20 h-1 bg-[#0052D9] rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-12 max-w-5xl">
            {displayIssue.categories.map((cat, idx) => (
              <TrendCard 
                key={cat.id} 
                category={cat} 
                index={idx} 
                onOpen={handleOpenDetail}
              />
            ))}
            {!isCurrentIssue && displayIssue.categories.length === 0 && (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl">
                <Icons.FileX2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">该期刊暂无内容归档</p>
              </div>
            )}
          </div>
        </section>

        <StrategicInsight />
        <CompetitorDashboard />
        <AboutUs />
      </main>

      <CategoryDetail 
        isOpen={isDetailOpen} 
        onClose={() => {
          setIsDetailOpen(false);
          setTimeout(() => setActiveNewsId(null), 300);
        }} 
        category={selectedCategory} 
        activeNewsId={activeNewsId}
      />

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />
      
      <Footer />
    </div>
  );
}
