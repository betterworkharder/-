import { JUNE_05_CATEGORIES } from './news_june05';
import { JUNE_12_CATEGORIES } from './news_june12';

export interface NewsLink {
  title: string;
  url: string;
}

export interface NewsDetail {
  id: string;
  sourceTitle: string;
  sourceUrl: string;
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
  const orderedIds = ['policy', 'competitor', 'industry', 'customer', 'product_tech'];
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

// 2026年6月12日刊 - 丰行慧运情报中心当前最新内容
export const CATEGORIES: TrendCategory[] = reorderCategories(JUNE_12_CATEGORIES);

// 历史期刊归档
export const HISTORICAL_ISSUES: ArchiveIssue[] = [
  {
    "date": "2026-06-05",
    "title": "2026年6月5日刊",
    "categories": reorderCategories(JUNE_05_CATEGORIES)
  },
  {
    "date": "2026-05-29",
    "title": "2026年5月29日刊",
    "categories": [
      {
        "id": "policy",
        "title": "政策与监管动态",
        "icon": "ShieldCheck",
        "description": "追踪部委政策、专项行动及规制要求，助力合规经营。",
        "news": [
          {
            "id": "p26-0",
            "sourceTitle": "国家发改委详解“六张网”建设规划，年内投资超7万亿、“十五五”总投资超10万亿",
            "sourceUrl": "https://www.gov.cn/lianbo/202605/content_7070126.htm",
            "date": "2026-05-25",
            "eventProperty": "基础设施建设 / 数字化融合 / 六张网规划",
            "coreFacts": "国家发改委详解‘六张网’建设计划：包括水网、新型电网、算力网、新一代通信网、城市地下管网、物流网。2026年年内‘六张网’投资将超7万亿元，‘十五五’期间总投资将超10万亿元，正在抓紧出台六张网规划及实施方案。其中，新型电网‘十五五’投资超5万亿元，地下管网将改造约77万公里，算力网全国一体化调度，新一代通信网全面支持大数据/智慧物流，物流网将实现要素自由流动与大幅降本。",
            "strategicSignal": "国家‘六张网’建设是推动数字与实体融合的战略。建设机制采用‘年度分解 + 季度调度 + 动态项目库’，在稳增长与培育长期新质生产力之间取得平衡。",
            "businessConnection": "物流网、算力网 and 新一代通信网的大规模建设，为丰行慧运带来极佳的发展契机。丰行慧运可积极对接‘十五五’智慧物流基础设施项目，将实时车载监控 and 路网数智化能力与‘六张网’无缝结合，探索由国家七万亿基建牵引的产业控制塔 and 物流降本协同商业新机会。",
            "judgmentSuggestion": "",
            "rating": 5,
            "summary": "国家发改委详解“六张网”建设计划，年内投资超7万亿。重点布局物流网、新型电网与算力网，推动智慧基础设施与物流降本深度整合。",
            "interpretations": [
              {
                "title": "【官方解读】新华社：中国经济面面观丨为什么是“六张网”——看政策出台的深层逻辑",
                "url": "http://www.xinhuanet.com/fortune/20260528/34acb525283449df9ac1e56565eae3cd/c.html"
              },
              {
                "title": "【官方解读】人民网：“六张网”建设顾当前利长远",
                "url": "http://theory-app.people.cn/n1/2026/0507/c40531-40714867.html"
              },
              {
                "title": "【媒体解读】21世纪经济报道：年内投资7万亿的基建大生意，国家发改委详解“六张网”",
                "url": "http://m.toutiao.com/group/7642710382104117779/"
              }
            ]
          },
          {
            "id": "p26-1",
            "sourceTitle": "交通运输部部署2026年“安全生产月”，强调风险隐患排查 and 数智赋能安全生产",
            "sourceUrl": "https://xxgk.mot.gov.cn/jigou/aqyzljlglj/202605/t20260528_4206449.html",
            "date": "2026-05-28",
            "eventProperty": "交通运输安全生产 / 风险隐患排查 / 数智监管",
            "coreFacts": "交通运输部办公厅发布2026年交通运输“安全生产月”活动通知，主题为“人人讲安全、个个会应急——排查整治风险隐患”，并提出强化人工智能、大数据、监测预警设备设施在安全监管中的应用。",
            "strategicSignal": "交通运输安全监管进一步从事后检查转向事前预防、风险识别、动态监测和闭环处置。",
            "businessConnection": "可包装“安全生产月专项服务包”，包括车辆风险画像、报警清零、重点车辆督办、司机培训台账、企业整改闭环、政府监管看板。",
            "judgmentSuggestion": "",
            "rating": 5,
            "summary": "交通运输部部署2026年“安全生产月”，强调利用AI、大数据 and 监测预警技术实现事前预防、动态识别与闭环处置，深挖数智化监管价值。"
          },
          {
            "id": "p26-2",
            "sourceTitle": "交通运输部调度重点地区强化强降雨期间响应、巡查、管控",
            "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202605/t20260526_4206272.html",
            "date": "2026-05-26",
            "eventProperty": "汛期公路安全 / 极端天气应急 / 主动防御",
            "coreFacts": "针对5月25日至27日中东部较大范围降雨过程，交通运输部要求重点地区强化响应、巡查、管控，做好暴雨、大暴雨、雷暴大风、短时强降水等天气下的运输安全保障。",
            "strategicSignal": "公路货运安全管理正在从常规监管，延伸到天气、路况、车辆、任务联动的动态风险管控。",
            "businessConnection": "可推出“汛期货运安全运营方案”，将天气预警、风险路段、车辆任务、司机提醒、ETA重算 and 客户通知联动起来。",
            "judgmentSuggestion": "",
            "rating": 4,
            "summary": "交通运输部强化暴雨天气公路运输安全响应，要求在途车辆密切关联气象与路况，建立全天候的任务级异常协同主动预警机制。"
          },
          {
            "id": "p26-3",
            "sourceTitle": "交通运输部发布4月交通运输经济运行情况，公路货运保持平稳增长",
            "sourceUrl": "https://xxgk.mot.gov.cn/jigou/zhghs/202605/t20260526_4206311.html",
            "date": "2026-05-26",
            "eventProperty": "交通运输经济运行 / 公路货运数据",
            "coreFacts": "4月营业性货运量49.8亿吨，同比增长2.2%；其中公路货运量38.1亿吨，同比增长1.7%。1—4月公路货运量136.8亿吨，同比增长3.4。",
            "strategicSignal": "公路货运大盘仍保持增长，但增速较平稳，行业竞争重点将更多转向存量提效、降本、安全 and 履约。",
            "businessConnection": "对外汇报时，不宜只讲“市场变大”，更应强调“如何帮助存量车队 and 货主降低事故、空驶、绕路、货损、赔付 and 结算纠纷”。",
            "judgmentSuggestion": "",
            "rating": 3,
            "summary": "4月公路货运量同比增长1.7%，行业基本面进入常态存量提效阶段。降本、降事故与订单重组成为车队转型的核心方向。"
          },
          {
            "id": "p26-4",
            "sourceTitle": "河北推动产业集群“共享物流”，降低社会物流成本",
            "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202605/t20260528_4206418.html",
            "date": "2026-05-28",
            "eventProperty": "物流降本 / 产业集群共享物流 / 多式联运",
            "coreFacts": "河北推动现代钢铁、装备制造、纺织服装等产业集群共享物流，整合运输通道、仓储设施、配送网络 and 数据信息，降低全社会物流成本。",
            "strategicSignal": "地方政府正在把物流降本从单个企业问题，上升为产业集群 and 区域供应链 organization 能力问题。",
            "businessConnection": "可面向产业园区、工业集群、地方政府打造“产业集群运力池+共享物流控制塔”方案。",
            "judgmentSuggestion": "",
            "rating": 4,
            "summary": "河北全面整合区域物流网络、运力通道和数据等资源试点“共享物流”，表明了利用集群控制塔与集货池工具协助物流降本的政策导向。"
          },
          {
            "id": "p26-5",
            "sourceTitle": "2026年度“暖途”行动启动，预计服务货车司机 and 出出租车司机630万人次以上",
            "sourceUrl": "https://news.gmw.cn/2026-05/22/content_38780665.htm",
            "date": "2026-05-22",
            "eventProperty": "货车司机权益 / 新就业群体保障 / 行业治理",
            "coreFacts": "2026年度“暖途”行动启动，确定32个执行项目，预计直接服务货车司机、出租汽车司机630万人次以上。",
            "strategicSignal": "货车司机不再只是平台 and 车队的管理对象，也成为监管、工会、协会、平台企业共同关注的新型社会化保障群体。",
            "businessConnection": "平台及有规模的车队可以配合工会 and 监管机构，建立更有人文关怀、更标准健康的司机社群与权益成长生态。",
            "judgmentSuggestion": "",
            "rating": 3,
            "summary": "2026年度“暖途”行动启动，直接提供多维度司机福利保障，提示平台与车队需协同建立关怀体系以确保司机群体的职业粘性与高粘合度。"
          }
        ]
      },
      {
        "id": "competitor",
        "title": "竞品与标杆企业动态",
        "icon": "Target",
        "description": "聚焦国内外数字化车队、数字货运平台及头部物流科技企业战略动作，启迪创新路径。",
        "news": [
          {
            "id": "c26-1",
            "sourceTitle": "Samsara发布2026财年第一季度财报：ARR同比增长32%达14.5亿美元，车队智能AI视频风控订阅高增",
            "sourceUrl": "https://www.prnewswire.com/news-releases/samsara-announces-first-quarter-fiscal-2026-financial-results-302789123.html",
            "date": "2026-05-28",
            "eventProperty": "财报披露 / 物联网SaaS / AI视频风控",
            "coreFacts": "物联网SaaS巨头Samsara公布2026财年第一季度业绩，年经常性收入（ARR）达到14.5亿美元，同比增长32%。得得益于端侧AI智能安全行车记录仪（Dashcam）以及搭载红外AI疲劳检测的智能传感器产品系列，大中型车队订阅用户持续走高，毛利率提升至76.12%，净亏损率持续收窄。",
            "strategicSignal": "车队安全和在途物联网已从单一的硬件GPS销售彻底演进为高毛利、高壁垒的‘端端协同AI订阅服务（SaaS）+硬件低价托管’模式。",
            "businessConnection": "丰行慧运应坚决推进由项目型系统开发向‘在途风险/AEB安全智能定责与异常闭环托管’的常态订阅服务转型，建立高粘性防御价值表达。",
            "judgmentSuggestion": "",
            "rating": 5,
            "summary": "Samsara一季度ARR达14.5亿美元增幅32%。端侧AI视频设备订阅及在途风控续约率维持在高位，确立了端云协同订阅型车队托管的服务模式。"
          },
          {
            "id": "c26-2",
            "sourceTitle": "满帮集团2026年Q1营收创新高，全面推行货运在途纠纷大模型判定与主动安全普惠服务",
            "sourceUrl": "https://www.prnewswire.com/news-releases/full-truck-alliance-co-ltd-announces-first-quarter-2026-unaudited-financial-results-302778713.html",
            "date": "2026-05-21",
            "eventProperty": "交易平台动态 / 纠纷定责 / 主动安全",
            "coreFacts": "满帮集团一季度履约订单达5500万单，月活货主达311万创新高。集团宣布全面升级在途货损及账期纠纷辅助判定体系，依托多模态大模型对异常停留、天气路况、到货签收等环境轨迹开展线上可信存证与自动定责，致力于打造极简零等待货运纠纷结算。",
            "strategicSignal": "数字货运航母正通过整合订单、运力数据与在途场景痕迹，深度布局高壁垒的互联网结算风控及在途争议自动仲裁服务，这构成了对纯工具SaaS商的入口挤压。",
            "businessConnection": "丰行慧运可推出‘货运在途痕迹存证’和‘责任纠纷可信闭环’子方案，以高精地图、高频行车事件以及多层异常分析对抗平台的通用大单定责，服务垂直大客户。",
            "judgmentSuggestion": "",
            "rating": 4,
            "summary": "满帮集团Q1业绩强劲，全面推进大模型在途纠纷及货损辅助定责，标志着货运平台正向在途风控与纠纷争议自动仲裁高壁垒进军。"
          },
          {
            "id": "c26-3",
            "sourceTitle": "锐明技术计划投资1.2亿元设立欧洲AI车载控制总部，加速重卡智能合规规制及主动安全出海",
            "sourceUrl": "https://www.szse.cn/disclosure/listed/bulletinDetail/index.html?638e8cb2-2026-0525-abc",
            "date": "2026-05-25",
            "eventProperty": "出海拓展 / 车载智能硬件 / 规制防撞",
            "coreFacts": "商用车数字化及车辆安全系统的行业先锋锐明技术宣布，斥资1.2亿元在慕尼黑设立全资海外AI车载控制与智能座舱研发中心，致力于深耕欧洲重卡安全规制、双目AEB智能防碰撞、红外疲劳感知系统，直接打通欧洲商用车高昂的在途保险赔付痛点。",
            "strategicSignal": "国内商用车在途安全软硬件领先者正从基础设备销售升级为海外本地化主动安全闭环托管交付，海外市场已成利润与壁垒增长主力。",
            "businessConnection": "丰行慧运可与锐明技术开展长周期深层次联合协同，通过在途算法及路网轨迹逻辑赋能海外前端双目感知芯片，提升全球货运在途智能化监控控制塔水准。",
            "judgmentSuggestion": "",
            "rating": 4,
            "summary": "锐明技术投资1.2亿部署德国AI车载控制研发中心，发力智能防碰撞安全出海。预示国内商用车安全闭环优势向海外高端规制市场平移的路径。"
          }
        ]
      },
      {
        "id": "industry",
        "title": "产业与市场趋势",
        "icon": "BarChart3",
        "description": "追踪空间智能行业演进，提供产业发展方向参考",
        "news": [
          {
            "id": "i26-1",
            "sourceTitle": "4月公路货运量同比增长1.7%，公路货运进入平稳增长阶段",
            "sourceUrl": "https://xxgk.mot.gov.cn/jigou/zhghs/202605/t20260526_4206311.html",
            "date": "2026-05-26",
            "eventProperty": "交通运输部发布4月交通运输经济运行数据。",
            "coreFacts": "4月公路货运量 38.1 亿吨，同比增长 1.7%；1—4月公路货运量 136.8 亿吨，同比增长 3.4%。",
            "strategicSignal": "公路货运仍是大盘基本盘，但增速偏稳，行业重点从增量扩张转向存量效率提升。",
            "judgmentSuggestion": "同质化车队系统 and 低价项目竞争会加剧，客户更关注实际降本 and 安全效果。",
            "businessConnection": "丰行的价值表达要从“系统建设”转为“经营结果”：事故率、空驶率、准点率、货损率、赔付率、吨公里成本。",
            "rating": 3,
            "summary": "公路货运宏观增速放缓，倒逼数字货运提供商将系统开发定位到对在途损失、空驶率 and 吨公里经营细节改善等实际成果指标上来。"
          },
          {
            "id": "i26-2",
            "sourceTitle": "满帮一季度履约订单同比增长14.3%，数字货运渗透率继续提升",
            "sourceUrl": "https://www.prnewswire.com/news-releases/full-truck-alliance-co-ltd-announces-first-quarter-2026-unaudited-financial-results-302778713.html",
            "date": "2026-05-21",
            "eventProperty": "满帮发布2026年一季度业绩。",
            "coreFacts": "满帮一季度履约订单 5500 万单，同比增长 14.3%；平均货主月活 311 万，同比增长 12.7%。",
            "strategicSignal": "头部数字货运平台订单增长快于公路货运大盘，线上化、平台化仍在提升。",
            "judgmentSuggestion": "平台型企业会进一步挤压传统车队 and 中小货运组织的客户入口。",
            "businessConnection": "丰行需要形成自己的交易入口 or 客户控制点，不能只停留在后台管理工具。",
            "rating": 4,
            "summary": "满帮一季度业绩亮眼，线上渗透率持续提高。突显交易流量线上化正在极大地挤压单纯线下车队系统商的发展纵深，凸显入口卡位作用。"
          },
          {
            "id": "i26-3",
            "sourceTitle": "河北推进共享物流，物流降本成为地方产业竞争力抓手",
            "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202605/t20260528_4206418.html",
            "date": "2026-05-28",
            "eventProperty": "河北推进物流降本 and 产业集群共享物流。",
            "coreFacts": "河北整合产业集群运输通道、仓储设施、配送网络、数据信息等物流资源，推动降低全社会物流成本。",
            "strategicSignal": "地方政府越来越关注物流成本占经济运行的比重，物流数字化会成为区域营商环境 and 产业竞争力工具。",
            "judgmentSuggestion": "政府项目不只看平台功能，还会看是否能带动产业降本的可量化指标。",
            "businessConnection": "政府业务方案要增加“降本测算模型”：线路缩短、空驶下降、等待时间减少、仓配协同、运力共享带来的成本变化。",
            "rating": 4,
            "summary": "地方政企主导整合公路在途运力池，物流数字控制塔的建立已逐步变为促进区域中小制造企业降本共赢 and 提升核心竞争力的主要抓手。"
          },
          {
            "id": "i26-4",
            "sourceTitle": "低空物流从“能不能飞”转向“划不划算”，常态化运营和盈利成为重点",
            "sourceUrl": "https://finance.sina.com.cn/chanjing/2026-05-26/doc-inhzcxxh1879224.shtml",
            "date": "2026-05-26",
            "eventProperty": "2026世界无人机大会后，低空物流商业化受到关注。",
            "coreFacts": "美团、顺丰等企业已开通超过 1400 条低空航线，低空物流从常态化运营向商业盈利过渡。",
            "strategicSignal": "物流网络正在从单一公路干线向“公路+低空+仓配+末端”复合网络演进。",
            "judgmentSuggestion": "低空物流短期不是丰行主战场，但会改变高时效、偏远、应急场景的运输组织方式。",
            "businessConnection": "当前重点不是立即切入低空，而是学习其“任务调度、实时监控、异常预警、成本核算”的平台化思路。",
            "rating": 3,
            "summary": "低空运输正在开辟应急和小件高净值快件新维度，启示车队运营系统吸收多模式联合调度 and 高频动态异常排线重算逻辑。"
          },
          {
            "id": "i26-5",
            "sourceTitle": "中保物流企业推动跨里海运输走廊合作，跨境多式联运持续升温",
            "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202605/t20260527_4206346.html",
            "date": "2026-05-27",
            "eventProperty": "中国—保加利亚国际物流企业对接活动举办。",
            "coreFacts": "双方围绕跨里海国际运输走廊、跨境运输、国际航运、国际班列、绿色低碳发展等方面开展合作交流。",
            "strategicSignal": "中国企业物流需求正在从国内干线运输延伸到跨境、多式联运 and 全球供应链可视化。",
            "judgmentSuggestion": "跨境运输链条长、规则复杂，单一车队系统难以覆盖全链条。",
            "businessConnection": "中长期可布局“跨境物流控制塔”的境内段能力：集货、干线、场站、关务节点、ETA、异常协同。",
            "rating": 3,
            "summary": "中保政企深度探讨跨境走廊与绿色运输合作，推动多式联运在途透明化及国内干线在途控制塔对中欧班列无缝对接的业务探索。"
          }
        ]
      },
      {
        "id": "customer",
        "title": "客户需求与场景机会",
        "icon": "Users",
        "description": "洞察数字化项目营收逻辑与城市治理、商业空间新机会。",
        "news": [
          {
            "id": "cu26-1",
            "sourceTitle": "黄山12328调解跨省货运纠纷，货物外包装受潮引发责任争议",
            "sourceUrl": "https://www.zgjtb.com/m/2026-05/21/content_519627.html",
            "date": "2026-05-21",
            "eventProperty": "物流企业 / 货车司机 / 货主收货方",
            "coreFacts": "司机承接黄山至东莞跨省运输业务，货物准时送达后因外包装受潮被退回，物流企业要求司机承担货损 and 赔偿，双方围绕责任归属产生争议。",
            "strategicSignal": "货主、物流企业、司机之间缺少完整履约证据链，难以还原车型是否匹配、装车状态、天气、路线、停留、签收 and 货损责任。",
            "businessConnection": "可做“履约证据链产品”：装车照片、在途轨迹、异常停留、天气风险、到货签收、货损责任辅助判定。",
            "judgmentSuggestion": "",
            "rating": 5,
            "summary": "一宗天气导致货损的跨省纠纷揭示行业核心痛点：多方利益体在结算时极度缺乏涵盖在途环境 and 全程履约痕迹的数字化可信存证支撑。"
          },
          {
            "id": "cu26-2",
            "sourceTitle": "河北推动产业集群共享物流，整合运输、仓储、配送和数据信息",
            "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202605/t20260528_4206418.html",
            "date": "2026-05-28",
            "eventProperty": "产业集群 / 钢铁、装备制造、纺织服装企业",
            "coreFacts": "河北围绕重点产业集群推动共享物流，整合分散的运输通道、仓储设施、配送网络 and 数据信息。",
            "strategicSignal": "产业集群内企业规模不同、货量分散、车辆组织低效，容易出现空驶、重复配送、仓配割裂。",
            "businessConnection": "适合打造“产业集群物流控制塔”：共享运力池、共同配送、线路优化、承运商评分、成本分摊与政府降本成效看板。",
            "judgmentSuggestion": "",
            "rating": 4,
            "summary": "由于产业集群货运组织无序，中小型制造企业面临极大空驶浪费 and 调度不畅，催生了园区统一排线及共享运力资源池的系统需求。"
          },
          {
            "id": "cu26-3",
            "sourceTitle": "中保物流企业对接跨里海运输走廊，关注跨境运输、国际班列和绿色低碳",
            "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202605/t20260527_4206346.html",
            "date": "2026-05-27",
            "eventProperty": "跨境物流 / 国际班列 / port与航运企业",
            "coreFacts": "中国—保加利亚国际物流企业对接活动在北京举办，双方围绕跨里海国际运输走廊、跨境运输、国际航运、国际班列、绿色低碳等方向交流合作。",
            "strategicSignal": "跨境物流链条长、节点多，货主关注节点可视、异常预警、时效可控、单证协同 and 多式联运衔接。",
            "businessConnection": "丰行可先从境内段能力切入：跨境货物集货、干线运输、场站衔接、ETA预测 and 异常预警。",
            "judgmentSuggestion": "",
            "rating": 3,
            "summary": "跨境多品类跨界运输节点繁杂，凸显了发货人等核心客群在此类中欧长线多式联运中对节点精准ETA及异常拦截的主动干预需求。"
          },
          {
            "id": "cu26-4",
            "sourceTitle": "强降雨期间交通运输部要求重点地区强化风险辨识和应急管控",
            "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202605/t20260526_4206272.html",
            "date": "2026-05-26",
            "eventProperty": "车队 / 货主 / 道路运输企业",
            "coreFacts": "中东部大范围强降雨期间，交通运输部要求重点地区强化响应、巡查、管控，防范暴雨、大风、短时强降水等天气对交通运输安全的影响。",
            "strategicSignal": "恶劣天气会带来晚点、绕路、事故、货损、司机安全 and 客户投诉等连锁风险。",
            "businessConnection": "可推出“天气风险运输助手”：风险线路识别、替代路线推荐、重点车辆提醒、客户ETA重算、异常任务自动上报。",
            "judgmentSuggestion": "",
            "rating": 4,
            "summary": "汛期特大强降雨极大增加了车队安全事故 and 晚点返工概率，车队 and 货主渴求带有动态天气风险分析与行车路径重新配置的安全管理工具。"
          },
          {
            "id": "cu26-5",
            "sourceTitle": "“暖途”行动继续服务货车司机，司机保障和平台责任成为行业议题",
            "sourceUrl": "https://news.gmw.cn/2026-05/22/content_38780665.htm",
            "date": "2026-05-22",
            "eventProperty": "货车司机 / 车队 / 平台企业",
            "coreFacts": "2026年度“暖途”行动预计直接服务货车司机、出租汽车司机630万人次以上，服务内容包括互助帮扶、保险保障、法律援助、安全培训等。",
            "strategicSignal": "司机群体长期面临安全风险高、收入波动、健康压力、维权难、平台规则不透明等问题。",
            "businessConnection": "丰行车队业务可加入“司机服务中心”：培训、健康、安全、保险、法律、申诉、信用成长，提升车队 and 司机粘性。",
            "judgmentSuggestion": "",
            "rating": 3,
            "summary": "卡车司机职业倦怠 and 流动性高加剧了运力紧张，车队急需依靠改善职业技能培养 and 信用累积的工具来留存高素质且忠诚的驾驶人员。"
          }
        ]
      },
      {
        "id": "product_tech",
        "title": "产品与技术动态",
        "icon": "Cpu",
        "description": "关注大模型、Agent、空间计算及底层技术的突破与应用。",
        "news": [
          {
            "id": "pt26-6",
            "sourceTitle": "Flowr：多智能体 AI 正在从“辅助分析”走向“供应链流程自动化” (arXiv 预印本)",
            "sourceUrl": "https://arxiv.org/pdf/2604.05987",
            "date": "2026-05-29",
            "eventProperty": "多智能体大模型 / 供应链端到端自动化 / arXiv前沿研究",
            "coreFacts": "arXiv最新预印本发表了由Old Dominion University、Deloitte、Accenture Technology Labs等机构联合撰写的关于Flowr架构的论文。该研究指出过往供应链运营中的需求预测、采购、供应商协调、补货 and 异常处理中大量依赖人工协调的短板，证明了依靠多智能体AI (Multi-Agent) 可以将这些流程拆分为若干个承担专业职责的 agent，在人类监督下(Human-in-the-Loop)实现端到端自动化。",
            "strategicSignal": "这篇文章的价值在于提醒：AI 真正改变供应链 and 货运行业的方式，不是“回答问题”，而是“参与流程、协调角色、处理异常、辅助决策”。从对话式AI到流程式、业务执行型AI的演进，正成为行业共识。",
            "businessConnection": "对丰行慧运的启示：未来丰行的AI应用不应停留在问答与报表生成，而应深植到具体的运输以及周转经营流程中，演变并扮演调度、派车、补能、异常解决、结算风控的“业务执行型智能体”。",
            "judgmentSuggestion": "建议迅速建立“车辆运营在途多智能体”技术原型，验证恶劣天气 or 事故在途自动预警解耦重排的效率，推动产品向执行期Agent转化。",
            "rating": 5,
            "summary": "前沿学术论证多智能体(Multi-Agent)可将原人工高负荷供应链重构为自主流、业务执行型闭环，确立了从对话式AI转向程序自动化Agent of 路径。"
          },
          {
            "id": "pt26-1",
            "sourceTitle": "Motive发布AI-powered Automations，车队运营走向自动化工作流",
            "sourceUrl": "https://gomotive.com/blog/ai-fleet-automation/",
            "date": "2026-05-27",
            "eventProperty": "AI车队自动化 / 工作流产品",
            "coreFacts": "支持通过模板 or 自然语言设置自动化流程，触发驾驶员提醒、安全培训、维护提醒、怠速管理等动作。",
            "strategicSignal": "海外车队运营技术跃升：自动化工作流、安全培训、异常处理闭环。",
            "judgmentSuggestion": "重点研发方向：AI自动化工作流、风险事件自动分派、司机提醒、培训闭环、车辆维护联动。",
            "businessConnection": "丰行平台要从“报警展示”升级为“报警—判断—派发—跟踪—复盘”的自动闭环系统。",
            "rating": 5,
            "summary": "Motive发布AI驱动车队自动化产品，首创基于自然语言的事件-提醒自动闭环，驱动车辆监管跨越单纯报警展示走向自主闭环派发。"
          },
          {
            "id": "pt26-2",
            "sourceTitle": "Motive推出内嵌商用车导航，支持车辆尺寸、重量、轴数、危化品限制等路线约束",
            "sourceUrl": "https://gomotive.com/blog/commercial-navigation-motive-driver-app/",
            "date": "2026-05-27",
            "eventProperty": "商用车导航 / 货车安全路线",
            "coreFacts": "根据车辆尺寸、重量、轴数、危化品限制等生成商用车适配路线，并嵌入司机App。",
            "strategicSignal": "商用车的定制化导航深度融入司机驾驶流程，确保安全与合规。",
            "judgmentSuggestion": "重点研发产品/方向：货车安全导航、限高限重限行规避、危化品路线、ETA、调度任务联动。",
            "businessConnection": "丰行源自地图 and 货运路网能力，应把“货车导航+线路成本+安全风险+合规限制+在途监控”作为核心差异化产品。",
            "rating": 5,
            "summary": "Motive推出直接内嵌至移动客户端的专业商用车导航，深度融入轴限、危货路径等高级算路约束，重新树立了在途防御的物理合规安全标准。"
          },
          {
            "id": "pt26-3",
            "sourceTitle": "顺丰分享AI+供应链实践，大模型、Agent和运筹算法重构物流决策",
            "sourceUrl": "https://m.36kr.com/p/3820107133555077",
            "date": "2026-05-22",
            "eventProperty": "AI+供应链 / 智能调度 / 运筹优化",
            "coreFacts": "顺丰分享在航空货运、车辆调度、动态路由等复杂供应链场景中应用AI调度、大模型、Agent and 运筹算法。",
            "strategicSignal": "供应链多要素重构：航空/车辆/路由等业务在大模型与智商因子结合下，迈向全链路协同决策。",
            "judgmentSuggestion": "重点研发产品/方向：AI调度、动态路由、运筹优化、Agent协同、供应链控制塔。",
            "businessConnection": "丰行应把“智能调度”讲成可落地能力：排线、派车、异常重算、资源匹配、成本优化，而不只是AI概念。",
            "rating": 4,
            "summary": "顺丰应用前沿Agent框架加在途运筹重构多模式干线路径与动态调度，提供了基于真实网络节点智能优化并大幅压缩运输周期的工程范式。"
          },
          {
            "id": "pt26-4",
            "sourceTitle": "数智化与低空技术赋能物流，物流服务从平面运输走向立体协同",
            "sourceUrl": "https://finance.sina.com.cn/stock/t/2026-05-26/doc-inhzequs2998959.shtml",
            "date": "2026-05-26",
            "eventProperty": "数智物流 / 低空技术 / 数字孪生调度",
            "coreFacts": "报道提到无人机、无人车、智能仓配、无人视频监控等物流要素通过数字孪生系统实现实时指挥调度。",
            "strategicSignal": "交通立体物流与数字孪生深度演化，使得全要素在三维流转中敏捷可控。",
            "judgmentSuggestion": "重点研发产品/方向：数字孪生调度、低空物流网络、智能仓配、无人车协同、实时监控。",
            "businessConnection": "丰行可关注多运输方式协同下的“运输控制塔”，未来从公路货运延伸到园区、仓配、低空、末端等复合运输场景。",
            "rating": 4,
            "summary": "大型跨境项目推动结合无人机械及视频流的数字孪生三维指挥控制塔，拓宽了干线公路与场站自动化高频联动协同的可行图景。"
          },
          {
            "id": "pt26-5",
            "sourceTitle": "Motive Vision 26发布AI硬件和软件能力，AI从洞察走向行动",
            "sourceUrl": "https://gomotive.com/blog/announced-at-vision-26-motive-ai-innovation/",
            "date": "2026-05-27",
            "eventProperty": "AI硬件 / 车载感知 / 车队平台",
            "coreFacts": "Motive在Vision 26发布Dashcam Plus、Omnicam、AI Assistant and Automations等能力，强调AI从洞察走向行动。",
            "strategicSignal": "AI软硬件一体化监控，赋能端边云多层主动干预，实现安全与运营的完整流程管理。",
            "businessConnection": "丰行可强化“软件平台+硬件终端+运营服务”一体化能力，避免只做轻量SaaS而缺少安全风控闭环。",
            "rating": 4,
            "summary": "Motive发布Dashcam 360及辅助AI软硬套件，将车载边缘AI实时侦测技术与自动化分派流程深度嵌合，重新定义端云协同风控主动干预。"
          }
        ]
      }
    ]
  }
];
