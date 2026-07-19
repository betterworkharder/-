# 工作区目录地图

## 最高优先级入口

- `AGENTS.md`：项目工作规则、研究范围、栏目定义、来源核验、去重、输出要求。
- `README.md`：目录地图和日常启动命令。
- `knowledge/README.md`：丰行知识入口和知识优先级。

## 研究配置

- `config/research-brief.md`：丰行研究定位和业务边界。
- `config/output-format.md`：五类情报字段和 Google AI Studio 成品格式。
- `config/source-policy.md`：来源等级、淘汰规则、去重规则。
- `config/watchlist.yaml`：固定竞品、标杆企业、别名、搜索语句和待确认字段。
- `config/query-library.yaml`：按栏目组织的主题查询库。
- `config/entity-aliases.yaml`：丰行、丰图、竞品、产品和客户词表。
- `config/source-index.yaml`：优先扫描的稳定可信来源。

## 知识材料

- `fengxing_knowledge_pack/`：结构化丰行知识包，优先读取。
- `knowledge/current/`：当前有效资料的导航入口。
- `knowledge/product-strategy/`：产品和业务规划资料的导航入口。
- `knowledge/historical/`：历史项目和方案资料的导航入口。
- `knowledge/source-extracts/`：从业务文档抽取的文本材料。
- `examples/`：历史 PDF 样例，只用于学习格式。

## 流水线

- `scripts/intelligence_pipeline.py`：校验、渲染、网站文本审计核心逻辑。
- `scripts/validate_weekly.py`：校验周度输出目录。
- `scripts/render_google_ai_studio.py`：从 `selected-intelligence.json` 渲染成品输入。
- `scripts/audit_website_text.py`：检查 Google AI Studio 或网站生成文本中的链接和内容问题。
- `tests/test_intelligence_pipeline.py`：流水线单元测试。
- `workflows/web-publishing/export_site_data.py`：从通过校验的正式 JSON 生成浏览器安全站点 JSON；不读取批准记录。
- `workflows/web-publishing/audit_site_bundle.py`：阻断内部字段或路径进入前端构建物。
- `workflows/web-publishing/tests/`：站点 JSON、确定性和敏感字段测试。

## 网站与发布

- `apps/web/`：Vite + React 只读展示站。
- `publish/weekly/YYYY-MM-DD/issue.json`：校验后生成并提交的单期站点 DTO。
- `publish/issues.json`：自动生成的期刊索引和内容哈希。
- `output/site/portal-content.json`：专家观点、竞品看板和站点说明。
- `netlify.toml`：Netlify 测试、构建、发布目录、重定向和安全响应头。
- `docs/operations/weekly-site-publishing.md`：格式化周报、JSON 生成、本地预览、人工审核、Git push 和 Netlify 部署的完整管线。

## 输出和状态

- `output/weekly/YYYY-MM-DD/`：每周正式研究产物。
- `output/daily/YYYY-MM-DD/`：每日扫描产物。
- `state/seen-urls.jsonl`：已报告 URL。
- `state/seen-events.jsonl`：已报告事件去重记录。
- `legacy/research-notes/academic/`：旧论文和预印本研究条目，不参与正式情报发布。

## 临时材料

- `tmp/`：运行时临时目录，可再生成且禁止提交 Git。
- `backups/`：本地重构备份，禁止提交 Git。

新长期材料不要放入 `tmp/`。
