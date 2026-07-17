# 丰行慧运情报流水线优化方案

## 目标

把当前“Codex 生成内容 -> 人工复制给 Google AI Studio -> 网站被二次改写”的流程，改为“结构化候选 -> 自动校验 -> 模板渲染 -> 受保护输入”的流程。

## 新索引模式

1. 先读 `knowledge/README.md` 和 `fengxing_knowledge_pack/`，确认丰行业务边界。
2. 再读 `config/source-index.yaml`，从固定可信来源开始扫描。
3. 先执行泰伯数据 API 固定扫描，再按 `config/watchlist.yaml` 检查固定竞品和标杆企业。
4. 按 `config/query-library.yaml` 补充主题搜索。
5. 每个候选生成去重键，写入 `state/seen-urls.jsonl` 和 `state/seen-events.jsonl`。

## 泰伯数据固定扫描

泰伯信息不得只依赖搜索引擎或 `site:taibo.cn`。每次周度研究必须用 API 扫描 `data.taibo.cn`：

```bash
python3 scripts/intelligence_pipeline.py scan-taibo --days 7 --pages 3 --format markdown
```

也可以对人工给出的泰伯详情 ID 做复核：

```bash
python3 scripts/intelligence_pipeline.py scan-taibo --ids 32009544 32009656 --format markdown
```

执行要求：

- 覆盖最新监测、产业动态、市场情报三个入口。
- 打开 detail API，读取标题、来源、发布时间、摘要、正文和关联企业。
- 直接相关条目进入候选池并回溯原始来源。
- 邻近相关条目至少进入观察池或淘汰留痕。
- 背景观察条目即使淘汰，也要写明低相关原因。
- 未执行该步骤时，不得写“泰伯网未发现有效新增信息”。

泰伯数据扫描结果不是正式成品。它的作用是保障行业相关信息先进入候选池，再由来源等级、业务相关度、去重和评分决定是否入选。

## 生成效率

每期只维护一个权威数据源：

```text
output/weekly/YYYY-MM-DD/selected-intelligence.json
```

之后用脚本生成 Google AI Studio 输入：

```bash
python3 scripts/render_google_ai_studio.py output/weekly/YYYY-MM-DD
```

生成前必须校验：

```bash
python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD
```

如果校验报错，不能把该期内容交给 Google AI Studio。

## 质量闸门

`scripts/validate_weekly.py` 会拦截：

- 缺少必填字段；
- 缺少真实 URL；
- 重复 URL；
- 星级与分数不匹配；
- 75 分以下进入正式成品；
- C 级来源单独支撑正式情报；
- arXiv、预印本或论文进入正式成品；
- `uncertainties` 中仍有“待补核、待补充、无法核验、未打开”等阻断项；
- Google AI Studio 成品缺少 JSON 中的来源 URL；
- 成品文本里混入英文连接词、无 URL 的链接按钮、ArXiv 内容等。

## 根据本次网站结果的修正

本次网页导出暴露出以下问题，应由新流程强制拦截：

- “查看官网原文”只有按钮文字，没有可见真实 URL；
- 市场趋势说明中出现 `and`；
- arXiv 预印本进入前台专家观点，与正式周报规则混用；
- “高峰物流”“廊坊经洽会”等表述缺少可追溯来源；
- 专利公开被放入重点竞品摘要，但没有证明其已形成产品、客户、项目或业务动作；
- 政策条目显示日期与来源审计日期不一致时，没有自动报错；
- 年度竞品看板混入周度报告页面，但没有字段说明数据来源、口径和更新时间的可核验 URL。
- 泰伯数据未完成 API 扫描却声称“泰伯网未发现有效新增信息”的候选池摘要。

## 推荐操作顺序

1. Codex 研究并写入 `candidate-pool.md`、`source-audit.md`、`analyst-review.md`。
2. 只有通过来源核验的条目进入 `selected-intelligence.json`。
3. 运行 `python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD`。
4. 运行 `python3 scripts/render_google_ai_studio.py output/weekly/YYYY-MM-DD`。
5. 粘贴 `templates/google-ai-studio-lock-prompt.md`。
6. 再粘贴 `google-ai-studio-input.md`。
7. 如果网页生成后仍有问题，将网页复制文本保存为 txt，运行：

```bash
python3 scripts/audit_website_text.py path/to/pasted-text.txt
```
