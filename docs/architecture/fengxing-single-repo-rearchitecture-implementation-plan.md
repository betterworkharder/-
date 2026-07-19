# 丰行慧运情报中心单仓库重构实施方案

> 文档状态：待人工审核草稿  
> 编制日期：2026-07-17  
> 适用对象：丰行慧运互联网情报生产流程与内部展示站  
> 目标仓库：[betterworkharder/-](https://github.com/betterworkharder/-)

## 1. 结论

丰行慧运情报中心采用“单仓库、只读门户、JSON 自动生成、Git 推送前人工门禁”的重构路线。

以现有网站仓库的 Git 历史为基础，将网站移动到 `apps/web/`，再导入经过清理的丰行情报生产流程。`output/weekly/YYYY-MM-DD/selected-intelligence.json` 继续作为每期唯一正式结构化内容源，不新建第二套正式周报 Schema。质量校验通过后立即生成脱敏站点 JSON 并本地预览；人工审核控制是否允许 Git push，推送生产分支后由 Netlify 自动部署。

第一阶段保留 Vite、React、Tailwind、Netlify 和现有蓝白视觉风格；不建设后台、点赞、反馈、客户端写入、应用内账号或在线编辑能力。

## 2. 实施计划前置工作：完整备份（已完成）

本方案编写前已完成当前工作区的完整快照。备份发生在任何清理、迁移或删除动作之前。

### 2.1 备份范围

创建快照时工作区共 528 个普通文件，整体约 152 MB。归档包含：

- 根目录隐藏文件和项目规则。
- `config/`、`knowledge/`、`fengxing_knowledge_pack/`。
- `scripts/`、`templates/`、`tests/`、`state/`。
- 全部 `output/` 历史产物。
- `examples/` 样例 PDF。
- `tmp/` 下全部可再生成渲染文件和兼容软链接。
- 当前文档和历史方案。

归档只排除创建归档时新建的 `backups/` 目录本身，避免压缩包递归包含自己。

### 2.2 备份位置

工作区内快速恢复副本：

```text
backups/fengxing-intelligence-research-workspace-2026-07-17-pre-refactor.tar.gz
```

工作区外持久副本：

```text
../workspace-backups/fengxing-intelligence-research-workspace-2026-07-17-pre-refactor.tar.gz
```

备份记录：

```text
backups/README.md
```

### 2.3 验证结果

- 压缩包大小：135 MB。
- 归档条目数：575（包含目录和软链接）。
- 完整解压成功。
- 原工作区普通文件数：528。
- 解压后普通文件数：528。
- 三个代表性文件抽样哈希一致。
- 工作区内外两个压缩包 SHA-256 一致。
- SHA-256：`19558d651107bcd0ba1e2f6187b5a9d438009911934a62f7d020741c589e5d34`。

备份目录不提交 Git、不进入网站构建物。重构验收和异地备份确认前，不删除工作区外副本。

## 3. 当前工作区整体结构与清理判断

### 3.1 总体判断

当前工作区已经具备完整的情报研究骨架，但同时混合了五种不同生命周期的内容：

1. 长期有效的研究规则和知识摘要。
2. 每期正式研究产物和去重状态。
3. 历史迁移留下的兼容文件、旧字段和旧知识副本。
4. 专项复扫、修正版和中间工作稿。
5. 可再生成缓存、系统垃圾文件和重复文件。

问题不是主要目录完全错误，而是“正式入口、历史材料、内部敏感材料、临时缓存和网站内容”没有形成足够强的构建边界。Step 0 应先清理生命周期和唯一入口，再开始网站单仓库迁移。

### 3.2 顶层目录说明

| 路径 | 当前规模 | 作用 | 判断 |
|---|---:|---|---|
| `AGENTS.md` | 约 40 KB | 项目最高优先级规则 | 必须保留，作为根规则唯一入口 |
| `README.md` | 约 4 KB | 工作区导航与命令 | 保留，单仓库落地时重写 |
| `config/` | 约 120 KB | 来源、观察名单、查询库、格式和业务简报 | 必须保留；历史审计文件移入文档归档 |
| `knowledge/` | 约 240 KB | 分层知识导航和业务文档抽取文本 | 导航保留；`source-extracts/` 按敏感材料处理，不进入网站构建物 |
| `fengxing_knowledge_pack/` | 约 96 KB | 结构化业务知识包 | 核心知识保留；重复配置和嵌套规则需合并 |
| `state/` | 约 64 KB | URL 和事件去重状态 | 必须保留，禁止清空 |
| `output/` | 约 620 KB | 六期周报和专项工作稿 | 五个正式文件保留；中间稿归档；明确重复文件删除 |
| `scripts/` | 约 72 KB | 扫描、校验、渲染和网站文本审计 | 必须保留并扩展 |
| `templates/` | 约 12 KB | 正式 JSON Schema 和栏目模板 | 必须保留；先修复 Schema 漂移 |
| `tests/` | 约 28 KB | 研究流水线测试 | 必须保留并扩展 |
| `examples/` | 约 33 MB | 历史页面样例 PDF | 研究规则要求读取，不能直接删除；建议 Git LFS 或受控私有资产存储 |
| `intelligence-library/` | 约 44 KB | 早期可复用情报和论文研究 | 当前内容均为论文/预印本且使用旧分类，应迁入隔离研究区 |
| `docs/` | 约 52 KB | 操作说明、历史方案和当前架构方案 | 当前操作文档保留；已执行的旧计划移入归档 |
| `tmp/` | 约 117 MB | 文档渲染 PNG 和兼容软链接 | 绝大部分可删除，是主要清理对象 |
| `backups/` | 约 135 MB | 重构前完整快照 | 本地保留但永不提交或部署 |

### 3.3 可以在 Step 0 直接移除的内容

这些内容已进入完整备份，且不承载唯一业务事实：

| 目标 | 原因 | 预计影响 |
|---|---|---|
| 所有 `.DS_Store` | macOS 系统元数据 | 无业务影响 |
| `scripts/__pycache__/`、`tests/__pycache__/` 和 `*.pyc` | Python 可再生成缓存 | 无业务影响 |
| `tmp/business_doc_renders/` | 401 个可再生成 PNG，约 117 MB | 需要时重新渲染 |
| `output/weekly/2026-06-12/google-ai-studio-input.txt` | 与同目录 `.md` 内容哈希完全一致 | 保留 `.md` 即可 |

执行删除后必须重新运行现有 11 个单元测试，并确认正式文件数量、周报目录和去重状态未变化。

### 3.4 应迁移或隔离，而不是直接删除的内容

| 目标 | 处理方式 | 原因 |
|---|---|---|
| `intelligence-library/` | 移至 `legacy/research-notes/academic/` | 现有条目全部是 arXiv/预印本，已不允许进入正式栏目；仍可能有后台研究价值 |
| `docs/superpowers/` | 移至 `docs/archive/2026-06-workspace-migrations/` | 属于已执行的历史设计和实施记录，不应继续占用当前操作入口 |
| `config/watchlist-audit.md` | 移至 `docs/archive/config-audits/` | 是一次性审计记录，不是运行配置 |
| 2026-07-03 的修正版、重索引、补充稿和专项复扫 | 移至该期 `working-notes/` | 保留研究过程，但从正式五文件入口分离 |
| 2026-07-10 的市场趋势补充稿 | 移至该期 `working-notes/` | 不是正式五文件之一，不参与网站导出 |
| 2026-06-12 的 `recent-7d-link-pool.txt`、链接格式稿 | 移至该期 `working-notes/` | 属于早期过程文件，不能作为正式内容源 |

隔离和归档是路径调整，不是内容批准。导出器必须显式忽略 `legacy/`、`docs/archive/` 和所有 `working-notes/`。

### 3.5 需要核对后才能移除的内容

以下文件存在重复或兼容关系，但仍可能包含独有信息，Step 0 只能先比较、确定唯一入口，再移除旧副本：

| 目标 | 当前问题 | 决策条件 |
|---|---|---|
| `tmp/business_doc_extracts` | 指向 `knowledge/source-extracts` 的兼容软链接 | 更新全部引用后删除软链接和 `tmp/README.md` |
| `knowledge/source-extracts/manifest.json` 与 `manifest_v2.json` | 指向两套不同命名和不同字符数的抽取文本 | 完成逐项完整度比较，生成一个不含本机绝对路径的规范清单后再归档旧清单 |
| `fengxing_knowledge_pack/07_watchlist.yaml` | 与 `config/watchlist.yaml` 功能重复且明显较旧 | 确认根 `config/` 已覆盖所有独有实体后移除或归档 |
| `fengxing_knowledge_pack/08_query_library.yaml` | 与 `config/query-library.yaml` 功能重复 | 合并仍有效的独有查询后移除旧副本 |
| `fengxing_knowledge_pack/09_terms_aliases.yaml` | 与 `config/entity-aliases.yaml` 功能重复 | 合并独有别名后移除旧副本 |
| `fengxing_knowledge_pack/AGENTS.md` | 嵌套规则较旧，可能与根 `AGENTS.md` 产生优先级混淆 | 将仍有效规则合并到根规则或知识 README 后移除 |
| `fengxing_knowledge_pack/codex_bootstrap_prompt.md` | 初始引导用途已被根规则和 README 替代 | 确认无外部流程引用后移入归档 |
| `fengxing_knowledge_pack/knowledge.json` | 与多个 Markdown 知识文件内容重叠 | 确认它是生成物还是人工权威源，决定保留或改为可再生成文件 |

### 3.6 明确不能清理的内容

- `state/seen-urls.jsonl` 和 `state/seen-events.jsonl`。
- 各期 `candidate-pool.md`、`source-audit.md`、`analyst-review.md`、`selected-intelligence.json`、`google-ai-studio-input.md`。
- 根 `AGENTS.md`、`config/` 当前有效配置、`scripts/`、`templates/` 和 `tests/`。
- `knowledge/` 中经过确认的知识入口和知识摘要。
- `examples/` 样例 PDF，除非已迁移到可被正式研究流程稳定读取的受控存储。
- 当前完整备份和工作区外副本。

本轮只完成判断和计划，没有执行上述删除或迁移。实际清理统一放入实施阶段 Step 0，并在每组动作后验证和记录。

## 4. 实施前硬门槛

以下条件未满足时，不得将当前研究目录导入网站仓库，也不得发布新的内部站点：

1. **目标 GitHub 仓库必须改为私有仓库。** 当前网站仓库可以匿名读取，应按公开仓库处理。仓库变为私有并确认公司组织成员权限前，禁止导入知识包、来源审计、候选池或其他内部资料。
2. **确认仓库归属。** 优先迁移至公司 GitHub Organization；若暂时保留个人账号仓库，必须记录管理员、备份负责人和移交方式。
3. **确认 Netlify 访问控制。** 核对站点所属团队、生产分支、域名和站点保护策略；如门户仅限公司内部，必须在 Netlify 或公司统一身份层配置访问保护，不能在前端代码中自建临时账号系统代替。
4. **确认敏感材料边界。** `knowledge/source-extracts/` 中可能包含内部客户、经营、项目和规划材料，默认不提交 Git。只提交经过审查的知识摘要、规则和导航文件。
5. **建立可恢复基线。** 网站现状创建只读备份分支和发布标签；重构在独立分支进行，旧版本在新站验收前保持可部署。

## 5. 当前基线

### 5.1 情报研究工作区

- 当前目录没有可用的 `.git` 仓库元数据，因此不能作为单仓库 Git 历史底座。
- 已有 6 个周度目录：`2026-06-12`、`2026-06-19`、`2026-06-26`、`2026-06-27`、`2026-07-03`、`2026-07-10`。
- `scripts/intelligence_pipeline.py` 已包含五类字段校验、星级校验、重复 URL、学术来源阻断、来源审计联动和网站文本审计。
- `templates/selected-intelligence.schema.json` 是现有正式结构定义。
- 现有 11 个流水线单元测试全部通过。
- 只有 `output/weekly/2026-07-10` 通过当前正式校验。
- 当前 JSON Schema 与实际产物存在技术漂移：Schema 将 `source_facts` 定义为字符串，但除 2026-06-19 外的现有期刊使用数组；Python 校验器目前没有执行完整 JSON Schema 校验。发布导出前必须先统一类型并把 Schema 校验接入质量门禁。

历史周报状态：

| 期刊 | 当前结果 | 首发处理 |
|---|---|---|
| 2026-07-10 | 通过当前校验 | 首批正式发布候选 |
| 2026-07-03 | 市场、竞合字段仍使用旧结构 | 隔离，修复后复核 |
| 2026-06-27 | 市场、竞合字段仍使用旧结构 | 隔离，修复后复核 |
| 2026-06-26 | 市场、竞合字段仍使用旧结构 | 隔离，修复后复核 |
| 2026-06-19 | 缺少字段并存在“待补核”证据阻断 | 隔离，补证后复核 |
| 2026-06-12 | 使用旧分类 `competitor_benchmark` | 隔离，完成分类迁移后复核 |

### 5.2 网站仓库

- 当前网站是 Vite + React + TypeScript + Tailwind 单页应用。
- `src/App.tsx` 超过 1,400 行，布局、数据、详情、竞品看板、Firebase 和交互逻辑耦合。
- 周报数据保存在 `src/news_*.ts`，新增一期需要修改前端代码和多个硬编码日期。
- 网站 2026-07-10 内容与研究工作区同日 `selected-intelligence.json` 不一致，存在二次改写风险。
- Firebase 点赞、反馈、消息服务和 Gemini/Express 依赖不属于只读门户目标。
- 当前生产构建可以完成，但单个 JavaScript 产物过大，并存在依赖安全告警。
- 旧站的专家观点、论文、静态竞品年度看板和未复核文本不能自动迁入正式页面。

## 6. 架构决策

### ADR-001：单仓库以网站 Git 历史为底座

原因：

- 网站已有可追溯提交历史；研究工作区当前没有 Git 历史。
- 保留网站历史便于比较视觉和功能变化，也便于快速回滚。
- 单仓库可以让内容校验、人工审批、导出、前端测试和部署处于同一 CI 提交中。

实施方式：

1. 在目标网站仓库创建 `refactor/single-repo-foundation` 分支。
2. 使用 `git mv` 将网站代码移动到 `apps/web/`，保留文件历史。
3. 分批导入当前研究工作区中允许提交的规则、脚本、测试和正式产物。
4. 原始敏感材料、缓存、临时渲染、账号和本地密钥不进入 Git。

### ADR-002：保留 `selected-intelligence.json` 为唯一正式内容源

不新增 `weekly-report.json`，也不复制丰图项目的正式 Schema。

正式内容源固定为：

```text
output/weekly/YYYY-MM-DD/selected-intelligence.json
```

现有五类字段、来源事实、业务推演和丰行启示规则继续由：

```text
templates/selected-intelligence.schema.json
scripts/intelligence_pipeline.py
config/output-format.md
```

共同约束。

站点 DTO Schema 只描述“哪些已审核字段允许进入浏览器”，不能反向修改或替代正式内容 Schema。

实施时先完成一次正式 Schema 校准：确定 `source_facts` 的规范类型，迁移历史文件，并让 Python 校验器实际调用 JSON Schema 校验。该校准只统一技术表示，不改写来源事实和业务内容。

### ADR-003：JSON 生成与线上发布解耦

现有 Schema 将 `review_status` 固定为“待人工审核草稿”，该字段只描述研究内容状态，不控制 JSON 生成或网站索引。

周报通过质量校验后，导出器立即生成：

```text
publish/weekly/YYYY-MM-DD/issue.json
publish/issues.json
apps/web/src/generated/site-content.json
```

不再创建 `publish/reviews/YYYY-MM-DD.json`，也不再读取 `approved_for_publication`、`approved_for_internal_display`、`archived` 等批准状态。人工审核发生在本地预览之后，只决定 Agent 是否可以执行 Git commit/push。未收到人工明确确认时，Agent 可以生成和验证 JSON，但不得推送或触发 Netlify 生产部署。

### ADR-004：第一阶段不大规模移动现有研究目录

为降低同一版本同时重构研究流水线和网站的风险，第一阶段保留现有目录名：

- `config/`
- `knowledge/`
- `fengxing_knowledge_pack/`
- `state/`
- `output/`
- `scripts/`
- `templates/`
- `tests/`

只新增 `apps/web/`、`workflows/web-publishing/`、`publish/` 和 `legacy/`。待网站稳定运行至少两期后，再单独评估是否将研究脚本迁入 `workflows/weekly-intelligence/`。

## 7. 目标目录

```text
/
├── AGENTS.md
├── README.md
├── apps/
│   └── web/
│       ├── package.json
│       ├── vite.config.ts
│       ├── src/
│       │   ├── app/                 # 路由、应用入口、错误边界
│       │   ├── pages/               # 首页、期刊、归档、详情、说明
│       │   ├── components/          # 通用布局和基础组件
│       │   ├── features/
│       │   │   ├── current-issue/
│       │   │   ├── archive/
│       │   │   ├── intelligence-detail/
│       │   │   └── search/
│       │   ├── data/                # 站点 DTO、加载器、字段映射
│       │   └── styles/              # 设计令牌、基础样式、响应式规则
│       ├── public/data/              # 自动生成，禁止手工编辑
│       └── tests/
├── config/                           # 丰行研究规则
├── knowledge/                        # 经审查的知识入口和摘要
├── fengxing_knowledge_pack/          # 经审查后允许提交的结构化知识
├── state/                             # 去重状态，不进入网站构建物
├── output/weekly/YYYY-MM-DD/          # 完整研究产物
├── publish/
│   ├── weekly/YYYY-MM-DD/issue.json   # 校验后自动生成的脱敏站点 DTO
│   └── issues.json                    # 自动生成的站点期刊索引
├── workflows/web-publishing/
│   ├── export_site_data.py
│   ├── schemas/
│   │   └── site-issue.schema.json
│   └── tests/
├── scripts/                            # 现有研究校验与渲染脚本
├── templates/                          # 唯一正式内容 Schema
├── tests/                              # 现有研究流水线测试
├── legacy/frontend-content/            # 旧站未复核内容
└── docs/
    ├── architecture/
    └── operations/
```

## 8. 内容导出契约

### 8.1 导出输入

每一期必须同时存在：

```text
output/weekly/YYYY-MM-DD/selected-intelligence.json
output/weekly/YYYY-MM-DD/candidate-pool.md
output/weekly/YYYY-MM-DD/source-audit.md
output/weekly/YYYY-MM-DD/analyst-review.md
output/weekly/YYYY-MM-DD/google-ai-studio-input.md
```

### 8.2 JSON 导出检查

导出脚本按以下顺序执行：

1. 调用现有 `validate_weekly_dir()`，不得复制一套质量规则。
2. 执行 `templates/selected-intelligence.schema.json` 的完整 JSON Schema 校验。
3. 验证每个正式条目在 `candidate-pool.md` 和 `source-audit.md` 中有记录。
4. 验证期刊中不存在重复 URL、低于 75 分条目、C 级单一来源、论文或未解决证据阻断。
5. 只按字段白名单生成站点 DTO。
6. 计算源 JSON 和站点 DTO 的 SHA-256 校验值。
7. 更新 `publish/issues.json` 和本地聚合内容。
8. `--check` 模式比较生成结果与已提交结果，不一致时 CI 失败。

### 8.3 浏览器允许字段

通用字段：

- `id`
- `category`
- `title`
- `summary`
- `published_at`
- `stars`
- `fields` 中对应栏目正式字段
- `source.name`
- `source.url`
- `source.tier`
- `source.is_original`

默认不得进入浏览器：

- `score`
- `entities`
- `competitor_relation`
- `source_facts`
- `business_inference`
- `recommended_actions`
- `uncertainties`
- `review_status`
- 候选池淘汰项和观察池
- 来源审计内部备注
- 内部路径、联系人和本地文件名

如果后续确需展示证据摘录，必须先扩展正式 Schema、字段白名单和敏感信息测试，不能直接把整个 `evidence` 或 `source-audit.md` 复制到前端。

### 8.4 证据状态

第一阶段只显示能够可靠计算的状态：

- 来源层级：直接读取 `source.tier`。
- 是否原始来源：直接读取 `source.is_original`。
- 内容校验状态：当且仅当整期通过 `validate_weekly_dir()` 时标记为 `validated`。
- 本地/生产状态不写入内容 DTO；同一份 JSON 在本地预览通过后由 Git push 进入部署流程。

`detail_read_status`、`original_source_status` 等状态只有在研究产物中形成结构化字段后才能展示，禁止从 Markdown 自由文本中猜测。

### 8.5 站点接口

```text
/data/issues.json
/data/issues/{issueId}.json
```

`issues.json` 至少包含：

- `schema_version`
- `generated_at`
- `latest_issue_id`
- `issues[].issue_id`
- `issues[].issue_date`
- `issues[].title`
- `issues[].category_counts`
- `issues[].content_hash`

单期 JSON 固定保持五类顺序：

1. 政策趋势与监管
2. 资金与项目机会
3. 竞合与标杆动向
4. 市场与客户趋势
5. 技术与能力演进

空栏目输出空数组和标准空状态，不生成占位事实。

## 9. 前端实施

### 9.1 路由

```text
/                              最新一期
/issues                        历史期刊中心
/issues/:issueId               单期完整内容
/issues/:issueId/:categoryId   单期指定模块
/about                         使用说明和免责声明
```

第一阶段不保留无正式数据支撑的“专家观点”和“竞品看板”路由。

### 9.2 页面职责

- 首页：最新一期日期、五类摘要、重点条目和验证状态。
- 历史中心：期刊切换、全文关键词搜索、栏目、星级和来源层级筛选。
- 详情页：标题、摘要、正式栏目字段、来源、原文链接、官方/解读链接和证据状态。
- 关于页面：内部参考说明、审核边界、更新时间和问题反馈渠道；不建设表单。

### 9.3 组件边界

```text
AppShell
├── GlobalHeader
├── IssueSelector
├── FilterBar
├── CategorySection
│   ├── IntelligenceCard
│   └── EmptyCategoryState
├── IntelligenceDetail
│   ├── FactSummary
│   ├── AnalysisFields
│   └── SourceLinks
└── GlobalFooter
```

事实摘要与分析判断必须使用不同的视觉区块。页面不得根据 ID 前缀或字符串标签推断栏目字段，必须使用显式的五类映射表。

### 9.4 设计系统

保留蓝白品牌和卡片式阅读体验，新增统一令牌：

- 品牌主色、背景、边框、文字和状态色。
- 4/8 像素间距体系。
- 标题、正文、辅助文字和数据文字层级。
- 卡片、表格、标签、链接、空状态、错误状态和加载状态。
- 桌面、平板和移动端断点。
- 可见焦点、键盘导航、语义标题和足够对比度。

## 10. 删除和隔离范围

### 删除

- Firebase SDK、配置、规则和相关服务。
- 点赞、反馈、留言和所有客户端写入。
- 未使用的 Gemini、Express、dotenv、Firebase Admin 依赖。
- `vite.config.ts` 中向浏览器注入 `GEMINI_API_KEY` 的配置。
- 运行时数据库连接测试。
- 与只读门户无关的消息、认证和计数逻辑。

### 隔离

旧站内容先移动至：

```text
legacy/frontend-content/
```

包括：

- `src/news_*.ts`
- 原 `src/data.ts` 中的期刊索引
- 静态战略洞察
- ArXiv 或论文卡片
- 静态年度竞品看板
- 无法与当前正式 JSON 对齐的历史文本

隔离区不参与构建、不参与搜索索引，也不能被导出脚本扫描。每一期只有完成来源核验、当前 Schema 迁移和质量校验后，才可生成站点 JSON；人工本地审核通过后才允许推送上线。

## 11. 安全边界

### 11.1 Git 边界

必须忽略：

```text
.env*
tmp/
.DS_Store
knowledge/source-extracts/
**/*secret*
**/*credential*
apps/web/public/data/
apps/web/dist/
```

`apps/web/public/data/` 默认由构建前命令生成并忽略。如果实施时决定提交生成结果，则从忽略清单移除该目录，同时要求 CI 用 `--check` 验证确定性；两种模式不能混用。

### 11.2 构建边界

- Netlify 只运行 `netlify.toml` 中声明的测试和前端构建，发布目录固定为 `apps/web/dist`。
- `backups/`、`knowledge/source-extracts/`、密钥和本地凭据不得提交 Git；构建脚本不得读取 `legacy/`、候选池、来源审计或分析审查。
- CI 在构建后扫描 `dist/` 或容器文件系统，命中内部目录名、联系人、绝对路径或禁止字段即失败。
- 浏览器环境变量只能包含非敏感公开配置；任何服务端密钥不得以 `VITE_` 或 `define` 注入前端。

### 11.3 运行边界

- 站点无写 API、无数据库、无 Cookie 业务状态。
- 外链统一使用 `target="_blank"`、`rel="noopener noreferrer"`。
- 内容以文本渲染为主；如支持 Markdown，禁用原始 HTML。
- Netlify 站点按确认后的团队和访问保护策略开放，公司内部站不得默认公开。
- 日志不得记录完整内部内容，只记录请求状态、构建版本和错误编号。

## 12. 实施阶段

### 阶段 0：工作区清理、安全与仓库准备

Step 0 是正式实施的第一阶段，所有删除和目录清理都在这里完成。执行顺序不可调整为“先删再备份”。

#### Step 0.1：冻结与恢复点

- 使用本方案第 2 节已完成的完整备份作为清理前基线。
- 再次核对工作区内外备份 SHA-256。
- 输出清理前文件数量、目录大小和周报目录清单。
- 将 `backups/` 加入 Git、Cloud Build、Docker 和网站导出的全局忽略规则。
- 在网站仓库创建当前线上版本标签和只读备份分支。

#### Step 0.2：删除明确可再生成或完全重复的文件

只删除第 3.3 节已经确认的目标：

```text
.DS_Store
output/.DS_Store
output/weekly/.DS_Store
intelligence-library/.DS_Store
scripts/__pycache__/
tests/__pycache__/
tmp/business_doc_renders/
output/weekly/2026-06-12/google-ai-studio-input.txt
```

删除后记录每个目标、删除原因、释放空间和恢复来源。预计主要释放约 117 MB 临时渲染文件；备份文件本身不计入清理收益。

#### Step 0.3：整理过程稿和历史文档

- 创建 `docs/archive/`、`legacy/research-notes/` 和各期 `working-notes/`。
- 将 `docs/superpowers/` 移入历史迁移归档。
- 将 `config/watchlist-audit.md` 移入配置审计归档。
- 将 `intelligence-library/` 中的论文和预印本条目移入 `legacy/research-notes/academic/`，修正或移除失效的本机绝对路径索引。
- 将 2026-07-03、2026-07-10 等期刊中的专项复扫、修正版和补充稿移入对应 `working-notes/`。
- 导出器和前端构建器明确忽略上述归档及工作稿目录。

#### Step 0.4：消除重复入口和兼容路径

按第 3.5 节逐项处理，不允许批量删除：

1. 对 `manifest.json` 与 `manifest_v2.json` 做逐项抽取完整度比较，生成唯一规范清单；规范清单不得保留本机绝对路径。
2. 对 `07_watchlist.yaml`、`08_query_library.yaml`、`09_terms_aliases.yaml` 与根 `config/` 做字段级合并，确认无独有配置后归档旧副本。
3. 将 `fengxing_knowledge_pack/AGENTS.md` 中仍有效但根规则缺失的内容合并到根规则或知识 README，随后删除嵌套规则，避免规则优先级歧义。
4. 明确 `knowledge.json` 是人工权威源还是生成物；若为生成物，增加生成和一致性检查后停止手工维护。
5. 更新所有 `tmp/business_doc_extracts` 引用，删除兼容软链接；`tmp/` 清空后删除 `tmp/README.md`，保留空目录与否由工具需求决定。

#### Step 0.5：敏感材料分级

生成“允许提交、私有仓库可提交、本机保留、禁止部署”四级清单：

- 根规则、配置、脚本、Schema、测试：允许提交。
- 候选池、来源审计、分析审查、去重状态：仅私有仓库可提交，禁止部署。
- `knowledge/source-extracts/` 和未公开业务材料：默认本机或受控私有存储保留，需逐项批准后才能提交。
- 密钥、账号、联系人、原始敏感文档、备份包和本机绝对路径：禁止提交及部署。
- 33 MB 样例 PDF：选择私有 Git LFS 或受控资产存储，禁止以普通 Git Blob 无限制增长仓库。

#### Step 0.6：Git 与部署安全准备

- 目标网站仓库改为私有并确认公司组织权限。
- 确认仓库管理员、备份负责人和移交方式。
- 创建 `refactor/single-repo-foundation` 分支。
- 建立根 `.gitignore`、Netlify 构建输入白名单和浏览器敏感字段审计。
- 调查并记录 Netlify 站点 ID、团队、域名、生产分支、Deploy Preview 和访问控制方式。

#### Step 0.7：清理后验证

必须执行：

```bash
python3 -m unittest tests/test_intelligence_pipeline.py -v
python3 scripts/validate_weekly.py output/weekly/2026-07-10
```

同时确认：

- `state/` 两个去重文件未变化。
- 六个周报目录仍存在。
- 每期五个正式文件没有被移动或删除。
- 2026-07-10 仍通过质量校验。
- 删除目标不再出现，归档目标位于新路径。
- 清理报告记录清理前后文件数、体积、测试结果和备份哈希。

Step 0 交付物：

- `docs/operations/workspace-cleanup-report-2026-07-17.md`。
- 目标仓库私有化和权限核对记录。
- 敏感材料分级清单。
- 清理后的目录树和忽略规则。
- 当前线上版本标签、备份分支和重构分支。

退出条件：清理报告通过人工确认；仓库不能匿名读取；备份可恢复；研究测试和最新周报校验通过；重构失败时可以恢复旧站。

### 阶段 1：单仓库骨架

交付：

- 使用 `git mv` 将现有网站移动到 `apps/web/`。
- 更新根 README、包名、工作目录和构建命令。
- 导入经允许的 `AGENTS.md`、`config/`、`scripts/`、`templates/`、`tests/`、`state/` 和正式输出。
- 排除原始敏感知识材料和临时文件。
- 保持旧站在新路径下仍可构建，暂不改变页面内容。

退出条件：目录迁移后 TypeScript 和生产构建仍通过，Git 历史可追溯。

### 阶段 2：质量校验与 JSON 导出

交付：

- `site-issue.schema.json`。
- 统一 `source_facts` 等漂移字段，并把正式 JSON Schema 校验接入 Python 质量门禁。
- `export_site_data.py`，支持按期刊生成 JSON 和 `--check`。
- 导出确定性、字段白名单、质量失败阻断和旧站隔离测试。
- 本地预览命令与人工检查清单。

退出条件：任何通过现有质量校验的期刊都能直接生成站点 JSON，不依赖批准文件或批准状态。

### 阶段 3：前端数据化重构

交付：

- 拆分 `App.tsx`。
- 建立路由、页面、功能模块、数据加载器和错误边界。
- 删除 Firebase、Gemini 和客户端写入。
- 从 `/data/issues.json` 和单期 JSON 加载内容。
- 支持期刊、栏目、星级、来源层级和关键词筛选。
- 保留蓝白视觉并完成基础移动端适配。

退出条件：在不修改 React 文件的情况下，重新生成站点 JSON 即可在本地出现新一期。

### 阶段 4：旧内容隔离与首发

交付：

- 所有 `news_*.ts` 和无正式数据支撑内容进入隔离区。
- 首发索引只包含通过校验并完成人工本地预览的期刊。
- 历史页对未发布期刊不显示虚构占位。
- 首发预览与旧站逐项对比。

退出条件：正式页面内容全部能回溯到对应 `selected-intelligence.json` 和内容哈希。

### 阶段 5：CI、部署和访问控制

PR 必须执行：

```bash
python3 -m unittest tests/test_intelligence_pipeline.py -v
python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD
python3 workflows/web-publishing/export_site_data.py --check
npm --prefix apps/web ci
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run build
```

另需执行：

- 桌面与移动端烟雾测试。
- 基础无障碍检查。
- 生成物敏感内容扫描。
- 外链安全属性检查。
- Netlify 生产分支、站点关联和访问保护验证。

退出条件：所有门禁通过后才允许部署；失败时保留线上上一版本。

### 阶段 6：历史周报逐期恢复

顺序建议：

1. 2026-07-03
2. 2026-06-27
3. 2026-06-26
4. 2026-06-19
5. 2026-06-12

每一期单独完成：

```text
旧字段映射
→ 来源和证据补核
→ 当前 Schema 校验
→ 站点导出
→ 本地预览
→ 人工确认后 Git push
```

不得通过降低校验标准或删除不确定性来批量放行旧内容。

## 13. 测试矩阵

### 研究流水线

- 正式字段完整性。
- 五类模块边界。
- 星级与分数映射。
- 重复 URL 和重复事件。
- C 级来源、论文和证据阻断。
- `source-audit.md` 日期与 JSON 一致性。
- 候选池固定来源扫描留痕。

### 发布导出

- 通过质量校验的期刊可以直接生成 JSON 并进入本地索引。
- 质量校验失败时不得生成或更新期刊 JSON。
- 缺少候选池或来源审计记录时失败。
- 内部字段不进入站点 DTO。
- 输出字段顺序和内容哈希稳定。
- 隔离区永远不被扫描。
- `--check` 能发现手工修改生成文件。

### 前端

- 五类栏目字段映射。
- 最新一期和历史切换。
- 关键词、栏目、星级和来源层级筛选。
- 原文、官方原文和解读链接。
- 空栏目、索引加载失败和单期加载失败。
- URL 直达与刷新。
- 键盘操作和焦点顺序。
- 桌面、平板、移动端布局。

### 安全

- 构建物不包含禁止目录或内部字段。
- 无 Firebase、写 API 或密钥注入。
- 外链安全属性。
- Markdown 不执行原始 HTML。
- Netlify 构建不读取本地密钥、知识抽取文本或备份。

## 14. 发布与回滚

发布顺序固定为：

```text
研究校验
→ 生成站点 DTO
→ 导出一致性检查
→ 前端测试
→ 本地网站预览
→ 人工验收并明确允许推送
→ Git commit/push
→ Netlify 自动部署
```

回滚策略：

- 每次正式部署记录 Git SHA 和内容索引哈希。
- Netlify 保留可回溯的历史 Deploy。
- 内容错误使用 Git revert 恢复上一版源文件和生成数据。
- 代码错误回滚至上一发布标签。
- 不直接手改线上或生成目录中的静态 JSON。

## 15. 验收标准

全部满足后，第一阶段重构才算完成：

1. 工作区内外备份仍可读取且哈希一致。
2. Step 0 清理报告列出的删除、归档和保留项均可追溯。
3. 清理后 11 个研究单元测试和 2026-07-10 校验继续通过。
4. 目标仓库为私有仓库，访问权限定公司授权成员。
5. 网站与情报生产流程位于同一 Git 仓库。
6. `selected-intelligence.json` 仍是唯一正式结构化内容源。
7. 通过质量校验的期刊无需批准文件即可生成站点 JSON。
8. 新增一期周报不修改任何 React 文件。
9. 旧站硬编码内容全部隔离且不参与构建。
10. Firebase、点赞、反馈、Gemini Key 和客户端写入全部移除。
11. 正式页面每条内容都能回溯到来源 URL、正式 JSON 和内容哈希。
12. CI 通过研究校验、导出一致性、前端测试、生产构建和敏感内容扫描。
13. GitHub 推送能够触发 Netlify 构建，生产分支和访问策略已确认。
14. 线上故障可以恢复到上一版本。
15. 人工审核发生在最后一次变更之后，未获明确确认时 Agent 不执行 Git push。

## 16. 建议实施批次

| 批次 | 内容 | 建议提交 |
|---|---|---|
| Step 0 | 当前研究工作区清理、归档、唯一入口和敏感分级 | 导入 Git 前完成，生成清理报告 |
| A | 仓库私有化、网站备份、分支保护 | `chore(repo): establish private migration baseline` |
| B | 网站移动至 `apps/web` | `refactor(web): move app into monorepo workspace` |
| C | 导入已清理的研究流程与敏感文件边界 | `chore(research): import validated intelligence workflow` |
| D | JSON 导出、本地预览和 Git 推送门禁 | `feat(publishing): add validated json preview pipeline` |
| E | 前端拆分与静态数据加载 | `refactor(web): render validated issue data` |
| F | 删除 Firebase/Gemini 与隔离旧站内容 | `chore(web): remove writes and quarantine legacy content` |
| G | CI、访问控制和首发 | `ci: enforce validation build and deployment gates` |

每个批次独立可审查、可测试和可回滚，不以一次大提交完成全部迁移。

## 17. 待人工确认

实施前需要确认：

1. 目标 GitHub 仓库是否迁入公司 Organization，以及私有仓库管理员名单。
2. 哪些 `fengxing_knowledge_pack/` 文件允许提交 Git，哪些必须仅保存在受控内部存储。
3. 首发是否只包含 2026-07-10，还是等待更多历史期刊修复后一起上线。
4. Netlify 生产分支是否固定为 `main`，以及谁有权合并或直接推送。
5. Netlify 站点 ID、团队、域名和访问控制方式。
6. 是否启用分支 Deploy Preview 和 PR 合并保护。
7. `publish/weekly/` 与 `publish/issues.json` 提交生成结果；`apps/web/src/generated/` 继续仅在构建时生成。

这些事项未确认时可以完成 JSON 生成、本地预览和测试，但不得导入敏感材料、执行 Git push 或触发正式发布。
