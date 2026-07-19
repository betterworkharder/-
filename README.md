# 丰行慧运互联网情报中心工作区

本工作区只服务于丰行慧运互联网情报研究。所有输出默认是“待人工审核草稿”，不得代表公司正式发布。

## 目录地图

```text
AGENTS.md                    项目最高优先级工作规则
config/                      研究简报、来源规则、查询库、观察名单、别名
knowledge/                   稳定知识入口和分层导航
fengxing_knowledge_pack/     丰行慧运结构化知识包
scripts/                     校验、渲染和网站文本审计脚本
templates/                   JSON 结构、栏目模板、Google AI Studio 保护提示词
workflows/web-publishing/     站点 JSON 导出、构建审计和测试
apps/web/                    Vite + React 只读展示站
publish/                     自动生成并提交的浏览器安全周报 JSON
state/                       已见 URL 和事件去重状态
output/                      周度、日度正式研究产物
examples/                    历史样例，仅学习格式，不当作新情报
legacy/                      旧论文条目、旧配置和待核验历史材料
docs/operations/             操作说明和目录说明
backups/                     本地重构备份（禁止提交 Git）
```

## 正式研究启动清单

每次正式研究开始前先读：

1. `AGENTS.md`
2. `knowledge/README.md`
3. `config/research-brief.md`
4. `config/output-format.md`
5. `config/source-policy.md`
6. `config/source-index.yaml`
7. `config/watchlist.yaml`
8. `config/query-library.yaml`
9. `config/entity-aliases.yaml`
10. `state/seen-urls.jsonl`
11. `state/seen-events.jsonl`
12. `examples/`

知识读取顺序优先参考 `knowledge/README.md`，再进入 `knowledge/current/`、`knowledge/product-strategy/`、`knowledge/historical/` 和 `fengxing_knowledge_pack/`。

## 周度产物工作流

正式周度输出目录：

```text
output/weekly/YYYY-MM-DD/
```

每期至少包含：

```text
candidate-pool.md
source-audit.md
analyst-review.md
selected-intelligence.json
google-ai-studio-input.md
```

推荐流程：

```bash
python3 scripts/intelligence_pipeline.py scan-taibo --days 7 --pages 3 --format markdown
python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD
python3 scripts/render_google_ai_studio.py output/weekly/YYYY-MM-DD
python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD
npm --prefix apps/web run content:issue -- YYYY-MM-DD
npm --prefix apps/web run dev
```

`google-ai-studio-input.md` 是由 `selected-intelligence.json` 渲染生成的格式化周报。不要手工把未核验候选、观察池、淘汰项或内部审计内容写进成品文本。

站点 JSON 在周报校验通过后立即生成，不需要 `approve-review` 或批准状态。人工在本地网站审核通过并明确允许推送后，才执行 Git commit/push；推送生产分支后由 Netlify 自动构建和部署。

## 目录使用边界

- `knowledge/source-extracts/`：业务文档抽取文本，供研究理解使用，不得直接泄露内部数字、客户或未公开规划。
- `tmp/`：仅用于按需生成的临时文件，目录内容不进入版本控制。
- `examples/`：只学习格式和风格，不复用其中历史新闻。
- `legacy/research-notes/academic/`：旧论文与预印本研究条目，只能用于后台研究，不能进入正式情报栏目。
- `.ignore`：供 `rg` 排除临时文件和备份，保持日常搜索结果干净。

## 验证命令

```bash
python3 -m unittest tests/test_intelligence_pipeline.py -v
python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD
```

如果历史周报校验失败，先确认是否是旧产物已有的来源审计问题；不要为了通过校验而删除必要的不确定性记录。

## 网站本地调试

重构后网站位于 `apps/web/`。首次启动：

```bash
npm --prefix apps/web install
npm --prefix apps/web run dev
```

然后访问 `http://localhost:3000/`。本地默认采用只读模式，不连接旧站
Firebase 写入；详细说明见 `apps/web/README.md`。

网站构建会从 `publish/weekly/` 和 `output/site/portal-content.json` 生成脱敏内容包，
并校验期刊索引、扩展栏目结构与内容哈希。`legacy/` 不参与正常构建或测试。
每周发布步骤见 `docs/operations/weekly-site-publishing.md`。

发布前必须运行：

```bash
python3 -m unittest tests/test_intelligence_pipeline.py -v
npm --prefix apps/web run test:all
npm --prefix apps/web run build
```

没有人工明确的“可以提交并推送”指令时，不得执行 `git push`。
