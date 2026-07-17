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
```

`google-ai-studio-input.md` 应由 `selected-intelligence.json` 渲染生成。不要手工把未核验候选、观察池、淘汰项或内部审计内容写进 Google AI Studio 成品文本。

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
