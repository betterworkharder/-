import { TrendCategory } from './data';

export const JUNE_05_CATEGORIES: TrendCategory[] = [
  {
    "id": "policy",
    "title": "政策与监管动态",
    "icon": "ShieldCheck",
    "description": "追踪部委政策、专项行动及规制要求，助力合规经营。",
    "news": [
      {
        "id": "p26-0605-1",
        "sourceTitle": "国家数据局：交通信号数据流通安全应用案例入选典型案例",
        "sourceUrl": "https://www.nda.gov.cn/sjj/ywpd/zcgh/0603/20260603183255755761143_pc.html",
        "date": "2026-06-03",
        "eventProperty": "数据流通安全治理 / 交通信号数据 / 公共数据授权运营",
        "coreFacts": "交通信号灯数据经过局域网加工核验后，通过安全边界设备进入政务外网数据共享平台，再面向企业提供红绿灯实时数据服务；数据使用全过程可授权、可计量、可追溯。",
        "strategicSignal": "城市交通运行数据正在从“政府内部管理数据”转为可合规流通的数据产品。",
        "businessConnection": "关注 交通信号 + 道路 + POI/AOI + 地址 + 路径规划 的组合价值，",
        "rating": 4,
        "summary": "国家数据局披露交通信号灯数据安全流通案例。长春通过公共数据授权运营机制，将网联交通信号灯实时数据加工后提供给车企、保险、导航平台等企业，并采用加密、最小化开放、日志审计和服务结束即销毁机制。"
      },
      {
        "id": "p26-0605-2",
        "sourceTitle": "国家数据局、交通运输部开展交通运输领域数据安全治理专题研统",
        "sourceUrl": "https://www.nda.gov.cn/sjj/ywpd/zcgh/0531/20260531184822431218969_pc.html",
        "date": "2026-05-31",
        "eventProperty": "交通运输数据 / 数据安全 / 跨区域数据协同",
        "coreFacts": "会议要求强化交通运输领域数据流通安全治理，推进跨部门、跨区域数据协同治理，促进数据安全合规高效流通。",
        "strategicSignal": "交通与位置相关数据的价值正在被认可，但监管侧同步强化安全、标准、审计和跨主体协同机制。",
        "businessConnection": "把“数据安全、调用审计、权限隔离、最小化返回、结果可追溯”纳入产品设计，而不是只强调算法 and 数据覆盖。",
        "rating": 4,
        "summary": "国家数据局联合交通运输部围绕交通运输领域数据安全治理召开专题研讨，强调交通数据“点多、线长、面广”，要建设适配“供得出、流得动、用得好”的安全治理体系。"
      }
    ]
  },
  {
    "id": "competitor",
    "title": "竞品与标杆企业动态",
    "icon": "Target",
    "description": "聚焦国内外数字化车队、数字货运平台及头部物流科技企业战略动作，启迪创新路径。",
    "news": []
  },
  {
    "id": "customer",
    "title": "客户需求与场景机会",
    "icon": "Users",
    "description": "洞察数字化项目营收逻辑与城市治理、商业空间新机会。",
    "news": [
      {
        "id": "cu26-0605-5",
        "sourceTitle": "浙江首座高速公路省际重卡充电站投运",
        "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202606/t20260603_4206781.html",
        "date": "2026-06-03",
        "eventProperty": "新能源重卡车队、干线物流企业、货主、充电运营商",
        "coreFacts": "长三角核心货车通道上投运省际高速万千瓦液冷换充电站，极大拓宽了纯电重卡单次干线运输里程边界。解决充电/换电车辆在途排队不清晰拖延晚点、车队无法评估哪些干线适合电动化、补能支出错位折旧核算不透明侵夺车辆理论利润的重卡电动化干线运营痛点。",
        "strategicSignal": "电动重卡加速由场站短驳转向高速干线运输。在途补能排队、油电换算利润糊涂账急需工具自愈。",
        "businessConnection": "丰行应加速与高精图商及各省超快充数据系统打通，推出‘绿色卡车在途充能智慧路况助手’，不仅精准推荐卡车最佳充能路口与实时排队，更将‘电/油价-能耗损失率-过路费-派单溢价’揉合成全自动在线成本利润看板，让车队对每一次派电车去干线都心中有数。",
        "rating": 3,
        "summary": "电动重卡加速由场站短驳转向高速干线运输。在途补能、充电排队拖拽晚点、油电换算利润糊涂账成为痛点。"
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
        "id": "i26-0605-1",
        "sourceTitle": "5月份中国物流业景气指数为50.3%",
        "sourceUrl": "https://www.news.cn/fortune/20260603/a13676665fc847dc8eaf5d4c0277eb1f/c.html",
        "date": "2026-06-03",
        "eventProperty": "物流经济运行指数 / 需求复苏 / 行业景气度",
        "coreFacts": "5月中国物流业景气指数为50.3%，新订单指数为50.2%，连续3个月回升，物流投资指数保持扩张。主要反映物流市场端在途装货率上升、社会需求触底反弹。",
        "strategicSignal": "物流需求恢复，企业开始从保规模转向提效率、降成本 and 稳利润。",
        "businessConnection": "针对行业‘主营业务利润修复慢，运输成本、用车效率、回款周期仍限制车队经营’痛点，主打丰行提升车辆实载率、一单纠纷2小时极速解决、结算闭环降低回款周期的价值模式。",
        "rating": 3,
        "summary": "5月份中国物流业景气指数回升至50.3%，连续三个月复苏拓展. 车队开始偏重降本提效及利润保值。"
      },
      {
        "id": "i26-0605-2",
        "sourceTitle": "121.7万亿元！我国物流越跑越稳",
        "sourceUrl": "https://finance.people.com.cn/n1/2026/0603/c1004-40733192.html",
        "date": "2026-06-03",
        "eventProperty": "社会物流总额 / 制造业供应链升级 / 统一大市场",
        "coreFacts": "2026年1至4月，全国社会物流总额达121.7万亿元，同比增长5.5%，尤其是电子信息、生命科学等高端高技术制造相关物流需求重点增速超过10%。",
        "strategicSignal": "制造业物流需求结构升级，客户对供应链可视化、准时履约、异常预警 and 承运商管理要求提升。",
        "businessConnection": "高技术制造物流对时效、质量、过程透明、异常处理要求极高，传统通用型TMS and 粗放人工调度极难支撑。丰行必须打造专门面向高技术精密制造在途可视化与高保冷链异常预警控制塔。",
        "rating": 3,
        "summary": "1—4月全国社会物流总额达121.7万亿元，同比增长5.5%。高附加值高端制造物流高歌猛进，倒逼运输透明化。"
      },
      {
        "id": "i26-0605-3",
        "sourceTitle": "浙江151个重大项目织密现代化物流网",
        "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202606/t20260602_4206702.html",
        "date": "2026-06-02",
        "eventProperty": "现代化物流网建 / 数实融合 / 重大物流基建",
        "coreFacts": "浙江‘十五五’时期前置谋划151个重大物流基建与数据平台项目，推动从传统公路/场站单一物理通道向集海港、陆港、空港、海关信息一体的现代化物流网组网方向突围。",
        "strategicSignal": "地方物流建设开始从枢纽、园区、通道建设转向数据运营 and 网络协同。",
        "businessConnection": "此类基建项目主体庞杂、系统林立、数据标准不一，运营评估困难。丰行能提供统一的多式联运数字标准接口与集疏港路径微观优化看板，作为数字基建优质协同方。",
        "rating": 3,
        "summary": "浙江前置谋划“十五五”151个数实融合重大项目，拉动地方公路及铁路港口向跨网协同、全局数据化调度底座平移。"
      },
      {
        "id": "i26-0605-4",
        "sourceTitle": "浙江首座高速公路省际重卡充电站投运",
        "sourceUrl": "https://www.mot.gov.cn/xinwen/jiaotongyaowen/202606/t20260603_4206781.html",
        "date": "2026-06-03",
        "eventProperty": "新能源重卡补能 / 省际高速干线 / 长三角干线",
        "coreFacts": "浙江利用原有的省界省际站场拆除腾退余地，建成首座高速公路省际高压大输出功率重卡专用充电站，正式支撑江浙沪省际绿色干线低碳货车长续航。",
        "strategicSignal": "重卡补能网络开始进入高速干线场景，线路电动化评估需求上升。",
        "businessConnection": "车队无法科学评估到底哪些线路可以全换电/充电，也难以量化对时效、油电差价、在途等待成本的动态影响。丰行可嵌入‘线路全生命周期电动化智能算法评估箱’，精准算路、算电、算利润。",
        "rating": 3,
        "summary": "浙江投运首座高速公路省界重卡专用超快充站，加速重卡由短倒向长途高速干线渗透，绿色线路电动化评估成为车队强诉求。"
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
        "id": "pt26-0605-1",
        "sourceTitle": "【Samsara】Samsara Approaches $2 Billion in ARR Amid Physical Economy Boom",
        "sourceUrl": "https://www.samsara.com/company/news/press-releases/q1-fiscal-year-27-results",
        "date": "2026-06-04",
        "eventProperty": "运营AI",
        "coreFacts": "Samsara将车队、重型设备、司机在途状态以及路网突发微环境多维数据高度深度对齐接入其‘有深度控制能力的 Connected Operations 开放云平台’。通过Operational AI在底侧对视频与路径偏离进行多核校验 and AI Agents自动通知，消解人工分析负荷。",
        "strategicSignal": "车队安全和在途物联网已从单一的硬件GPS sales彻底演进为高毛利、高壁垒的‘端端协同AI订阅服务（SaaS）+硬件低价托管’模式。",
        "businessConnection": "丰行应将车队安全、货主履约、政府监管、道路事件、车辆设备接入统一运营AI层，用AI减少人工盯屏、人工报表 and 人工催办。",
        "rating": 5,
        "summary": "Samsara强力注入Connected Operations运营AI及AI Agents，对车队在途轨迹及端侧AI摄像头多维数据进行低负荷托管。"
      },
      {
        "id": "pt26-0605-2",
        "sourceTitle": "【Motive】Beyond Dashcams—Motive Edge AI Unlocks New Future For Fleet Vehicles",
        "sourceUrl": "https://www.forbes.com/sites/jamesmorris/2026/05/31/beyond-dashcams-motive-edge-ai-unlocks-new-future-for-fleet-vehicles/",
        "date": "2026-05-31",
        "eventProperty": "边缘AI",
        "coreFacts": "Motive推出基于全新低功耗边缘端感知算力处理芯片的端云一体边缘AI平台，直接重塑普通的车厢/车前方在途记录仪。所有高频驾驶疲劳、分神、盲区入侵在设备端即时高精度识别与本地安全纠葛处理，云端只存储结构化高危快照，消除隐私顾虑与高额云端流量开销。",
        "strategicSignal": "车队主动安全智能硬件正面临底层低耗能算力跃迁，纯传输硬件将被边缘算力智能全方位取缔。",
        "businessConnection": "丰行主动安全产品应从报警采集升级为车端识别、云端分级、人工干预、培训闭环、保险证据链。",
        "rating": 5,
        "summary": "Motive推出端侧车载智能边缘AI系统，实现疲劳、盲撞在边缘端的高精实时避险并最小化高额云视频流量带宽损耗。"
      },
      {
        "id": "pt26-0605-3",
        "sourceTitle": "【project44】project44 appoints Karthik Somasundaram as Vice President of Engineering",
        "sourceUrl": "https://www.project44.com/press-releases/project44-appoints-karthik-somasundaram-as-vice-president-of-engineering/",
        "date": "2026-06-04",
        "eventProperty": "供应链决策智能",
        "coreFacts": "全球在途可视化巨头project44任命新任研发工程VP，战略性指向并重拳打磨其Movement可视化底层底座与Decision Intelligence在途决策大脑的底层并发能效，以高颗粒度应对全班列、近海以及公路异常自愈。",
        "strategicSignal": "供应链在途可视化正由单纯的轨迹追踪‘知晓大盘’向能高精微预报晚点的‘智能干预、异常自愈诊断’高级演进。",
        "businessConnection": "丰行货主控制塔不能只做轨迹展示，应升级为延误预测、替代线路建议、承运商绩效评分 and 异常处置闭环。",
        "rating": 4,
        "summary": "project44发力升级Movement可视化在途决策智能，推动单纯 of GIS 轨迹地图可视化向“分钟级延误自愈”挺进。"
      },
      {
        "id": "pt26-0605-4",
        "sourceTitle": "【千方科技】以“车路运能”聚势，千方科技自动驾驶干线物流业务稳步推进",
        "sourceUrl": "https://www.stcn.com/article/detail/3943394.html",
        "date": "2026-06-04",
        "eventProperty": "自动驾驶重卡运营",
        "coreFacts": "千方科技推进L3/L4级在途智能集疏港重卡车队全生命化安全与合规。技术上将自动卡车载重能耗与路侧边缘传感器感知融合、动态下发远程安全监控指令，实现多式联运大宗全时空受控状态。",
        "strategicSignal": "自动驾驶重卡竞争正在从车辆技术转向车、路、运、能一体化运营能力。",
        "businessConnection": "丰行应沉淀干线路线库、场站库、补能库、订单履约库 and 监管规则库，为无人重卡商业化提供运营底座。",
        "rating": 4,
        "summary": "千方科技以L3/L4智能车辆与交通要素耦合多点卡位，推动智驾重卡面向大宗运输的高动态精细导航及远程在途拦截监控自愈。"
      },
      {
        "id": "pt26-0605-5",
        "sourceTitle": "【华为数字能源】华为兆瓦超充助力全国首个县域物流全面电动化落地",
        "sourceUrl": "https://digitalpower.huawei.com/cn/news/smart-charging-network/county-megawatt-charging",
        "date": "2026-06-02",
        "eventProperty": "重卡超充",
        "coreFacts": "华为部署业界首款兆瓦级全液冷超大功率高压重卡直充底座。实现对高端特种、大件重整在途在15分钟内极速补充大额航程电量，保障大宗 and 特运的高精ETA不延误。",
        "strategicSignal": "重卡在途充换能技术已经正式突破长干线的时间折磨瓶颈，绿电重卡大盘即将进入加速长程重整爆发期。",
        "businessConnection": "丰行应把补能数据纳入线路规划、成本测算、车辆调度、运单利润 and 车队经营分析。",
        "rating": 4,
        "summary": "华为成功落地超高功率兆瓦级液冷大宗物流重载一站超快充标杆点，使单次补能耗损极大下降。将补能效率要素完美契合在途大盘。"
      }
    ]
  }
];
