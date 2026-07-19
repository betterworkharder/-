import {useState} from 'react';
import {motion} from 'motion/react';
import * as Icons from 'lucide-react';
import type {PortalContent} from './data';

export function ExpertInsights({content}: {content: PortalContent['expert_insights']}) {
  return (
    <section id="专家观点" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100 scroll-mt-20">
      <div className="mb-16">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 font-display">
          <Icons.Brain className="text-[#0052D9] w-10 h-10" />
          {content.title}
        </h2>
        <div className="w-20 h-1 bg-[#0052D9] rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {content.items.map((item, index) => {
          const accent = item.theme === 'emerald' ? 'bg-emerald-600' : 'bg-indigo-600';
          return (
            <motion.article
              key={item.id}
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: index * 0.1}}
              className="bg-white border border-slate-200/60 p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-2xl hover:border-[#0052D9]/20 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className={`text-[10px] font-black text-white ${accent} px-3.5 py-1 rounded-full uppercase tracking-[0.2em]`}>{item.badge}</span>
                  <span className="text-[10px] font-black text-slate-400">{item.published_label}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 leading-tight font-display">{item.title}</h3>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.organization_label}</p>
                  {item.organizations.map((organization) => <p key={organization} className="text-xs text-slate-700 font-bold leading-relaxed">{organization}</p>)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-semibold mb-5">{item.summary}</p>
                <div className="border-l-4 border-[#0052D9] pl-4 py-1 mb-5">
                  <h4 className="text-sm font-black text-slate-900 mb-1">{item.highlight_label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.highlight}</p>
                </div>
                {item.stages && (
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {item.stages.map((stage, stageIndex) => (
                      <div key={stage.title} className="flex items-start gap-2">
                        <span className="text-[8px] font-black text-[#0052D9] bg-[#0052D9]/10 w-4 h-4 rounded-full flex items-center justify-center mt-0.5">{stageIndex + 1}</span>
                        <div><p className="text-[8px] font-bold text-slate-400">{stage.time}</p><p className="text-xs text-slate-700 font-black">{stage.title}</p></div>
                      </div>
                    ))}
                  </div>
                )}
                {item.bullets?.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2 bg-emerald-50/40 p-3 rounded-xl border border-emerald-500/10 mb-3">
                    <Icons.ChevronRight size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-700 font-black">{bullet}</p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4 mt-6">
                <a href={item.link.url} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-3 ${accent} hover:bg-[#0052D9] text-white px-5 py-3 rounded-xl text-xs font-black transition-all shadow-lg`}>
                  {item.link.label}<Icons.ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">{item.note}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export function CompetitorDashboard({content}: {content: PortalContent['competitor_dashboard']}) {
  const [activeTabId, setActiveTabId] = useState(content.tabs[0]?.id ?? 'financial');
  const activeTab = content.tabs.find((tab) => tab.id === activeTabId) ?? content.tabs[0];
  if (!activeTab) return null;

  return (
    <section id="竞品看板" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100 scroll-mt-20">
      <h2 className="text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 font-display">
        <Icons.Binoculars className="text-[#0052D9] w-10 h-10" />{content.title}
      </h2>
      <div className="w-20 h-1 bg-[#0052D9] rounded-full mb-16" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 border-l-[4px] border-[#0052D9] pl-4 uppercase tracking-wider font-display">{content.subtitle}</h3>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            {content.tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTabId === tab.id ? 'bg-white text-[#0052D9] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-3 py-2 rounded-md border border-slate-100 h-fit">{content.source_note}</span>
      </div>
      <div className="overflow-x-auto rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse bg-white whitespace-nowrap">
          <thead><tr className="bg-slate-900 text-white">
            <th className="p-6 text-[10px] font-black uppercase tracking-widest border-r border-slate-800">竞对定位</th>
            <th className="p-6 text-[10px] font-black uppercase tracking-widest">竞对名称</th>
            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">上市情况</th>
            {activeTab.metrics.map((metric) => <th key={metric.key} className={`p-6 text-[10px] font-black uppercase tracking-widest text-center ${metric.highlight ? 'bg-[#0052D9]' : ''}`}>{metric.label}</th>)}
          </tr></thead>
          <tbody className="text-sm">
            {content.groups.flatMap((group) => group.companies.map((company, companyIndex) => (
              <tr key={`${group.category}-${company.name}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                {companyIndex === 0 && <td rowSpan={group.companies.length} className="p-6 font-black text-slate-900 bg-slate-50/80 border-r border-slate-100 align-middle w-40 whitespace-normal text-xs leading-relaxed">{group.category}</td>}
                <td className="p-6"><span className="font-black text-slate-900 block">{company.name}</span><span className="text-[9px] font-bold text-slate-400 font-mono">{company.code}</span></td>
                <td className="p-6 text-center"><span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">{company.status}</span></td>
                {activeTab.metrics.map((metric) => <td key={metric.key} className={`p-6 font-bold text-center ${metric.highlight ? 'text-[#0052D9] bg-[#0052D9]/5' : 'text-slate-600'}`}>{company.values[activeTab.id]?.[metric.key] ?? '-'}</td>)}
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FeedbackForm({content}: {content: PortalContent['about']['feedback']}) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <form onSubmit={(event) => {event.preventDefault(); setMessage(''); setSubmitted(true);}} className="w-full md:w-80 flex-shrink-0 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2"><Icons.MessageSquare className="w-4 h-4 text-[#0052D9]" />{content.title}</h4>
      <textarea value={message} onChange={(event) => {setMessage(event.target.value); setSubmitted(false);}} placeholder={content.placeholder} className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-[13px] font-medium focus:border-[#0052D9] outline-none resize-none" required />
      <input placeholder={content.contact_placeholder} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-[11px] outline-none" />
      <button disabled={!message.trim()} className="w-full py-3 rounded-xl font-black text-xs bg-slate-900 hover:bg-[#0052D9] text-white disabled:opacity-50">提交反馈</button>
      <p className={`text-[10px] font-bold text-center ${submitted ? 'text-emerald-600' : 'text-slate-400'}`}>{submitted ? '本地验证完成，内容未发送到远端。' : content.local_notice}</p>
    </form>
  );
}

export function About({content}: {content: PortalContent['about']}) {
  return (
    <section id="关于我们" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100 scroll-mt-20">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 font-display"><Icons.Compass className="text-[#0052D9] w-8 h-8" />{content.title}</h2>
      <div className="w-16 h-1 bg-[#0052D9] rounded-full mb-8" />
      <div className="bg-white border border-[#0052D9]/10 p-10 rounded-[40px] shadow-sm">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-grow space-y-6">
            <div><h3 className="text-xl font-black text-slate-900 italic">{content.organization}</h3><p className="text-[10px] font-bold text-[#0052D9] uppercase tracking-[0.2em]">{content.producer}</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {content.sections.map((section) => <div key={section.title} className="space-y-3"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{section.title}</h4><p className="text-sm text-slate-600 leading-relaxed font-medium">{section.body}</p></div>)}
            </div>
          </div>
          <FeedbackForm content={content.feedback} />
        </div>
      </div>
    </section>
  );
}

export function Footer({content}: {content: PortalContent['site']}) {
  return <footer className="border-t border-slate-100 py-16 bg-white"><div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-12"><div><div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center"><Icons.Globe className="text-white w-4 h-4" /></div><span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{content.footer_brand}</span></div><p className="text-xs text-slate-400 font-medium max-w-xs uppercase leading-loose tracking-widest">{content.footer_tagline}</p></div><div className="flex gap-12 text-xs font-bold text-slate-300 uppercase tracking-widest"><span>{content.copyright}</span><span>{content.version}</span></div></div></footer>;
}
