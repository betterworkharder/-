# 各类信息标准模板

本模板用于 `selected-intelligence.json` 入库和 `google-ai-studio-input.md` 渲染。所有正式候选必须先通过 `scripts/validate_weekly.py`。

## 通用字段

- `id`
- `category`
- `title`
- `summary`
- `published_at`
- `stars`
- `score`
- `entities`
- `competitor_relation`
- `fields`
- `source.name`
- `source.url`
- `source.tier`
- `source.is_original`
- `evidence`
- `source_facts`
- `business_inference`
- `implication_for_fengxing`
- `recommended_actions`
- `uncertainties`
- `review_status`

## 政策趋势与监管

`fields` 必填：

- `政策方向`
- `核心内容`
- `趋势分析`
- `对丰行的启示`
- `官方原文链接`
- `解读链接`

质量要求：

- 政策类必须优先回溯政府官网、公文原文或官方解读。
- 如果 `source-audit.md` 写有“正式文件原文待补核”，不得进入 Google AI Studio 成品。
- 摘要只写政策发布事实和可确认指标，不写“驱使、迫使、全面升级”等判断。

## 资金与项目机会

`fields` 必填：

- `机会类型`
- `牵头主体`
- `涉及地区/行业`
- `可跟进点`

质量要求：

- 必须有采购、招标、中标、试点、资金、工程建设或明确实施任务。
- 普通政策表态、企业宣传、行业趋势不得包装成项目机会。
- 优先中文官方来源，不用英文网站填充本栏目。

## 竞合与标杆动向

`fields` 必填：

- `动态类别`
- `核心内容`
- `战略意义`
- `对丰行的启示`

质量要求：

- 只收企业具体动作：产品、客户、合作、财报、融资、项目、海外扩张、组织变化等。
- 低价值专利公开默认进入观察池，除非能证明该专利与货运安全、车队管理、监管平台或保险风控形成明确产品化动作。
- 必须重新判断 `competitor_relation`，不能只套用企业默认关系。

## 市场与客户趋势

`fields` 必填：

- `客户行业`
- `需求变化`
- `业务痛点`
- `丰行契合点`

质量要求：

- 原则上需要两个独立来源、高可信报告，或多家客户/企业同向动作。
- 单家公司新闻不能直接写成市场趋势。
- 必须写清客户从什么状态转向什么状态。

## 技术与能力演进

`fields` 必填：

- `技术/能力方向`
- `核心变化`
- `应用场景`
- `能力启示`

质量要求：

- 本栏目写能力范式变化，不写单家公司普通产品发布。
- arXiv、预印本和论文不得作为正式情报条目，只能放入后台研究或专家观点专栏。
- 必须写清能力成熟度门槛，如精度、覆盖、时效、自动化、可解释、可审计、可集成、稳定性和成本效率。
