# 格式化周报、网站预览与 Netlify 发布流程

## 核心原则

每周内容更新只修改研究产物和生成的 JSON，不为单期情报修改 React 页面。

- `output/weekly/YYYY-MM-DD/selected-intelligence.json` 是本期唯一正式结构化内容源。
- `google-ai-studio-input.md` 是由正式 JSON 渲染得到的格式化周报，供人工阅读和核对。
- `publish/weekly/YYYY-MM-DD/issue.json` 是浏览器安全的站点 DTO，由脚本自动生成。
- 生成站点 JSON 不需要 `approve-review`、批准文件或批准状态。
- 人工审核控制的是“是否允许 Git push”，不是“是否允许生成 JSON”。
- 推送 GitHub 生产分支后，由 Netlify Git 集成自动构建和部署。

## 端到端流程

```text
互联网研究与来源核验
    ↓
生成 selected-intelligence.json
    ↓
校验并渲染格式化周报 google-ai-studio-input.md
    ↓
立即生成 publish/weekly/<issue>/issue.json 与期刊索引
    ↓
本地启动网站，人工检查内容与页面
    ↓
人工明确确认可以发布
    ↓
执行发布前测试和生产构建
    ↓
Git commit + push GitHub
    ↓
Netlify 自动构建和部署
```

JSON 生成、本地预览和本地构建都不代表内容已发布。只有 GitHub 生产分支发生推送并被 Netlify 成功部署后，才构成线上发布。

## 1. 生成本期正式研究产物

假设本期期号为 `YYYY-MM-DD`。先完成：

```text
output/weekly/YYYY-MM-DD/
├── candidate-pool.md
├── source-audit.md
├── analyst-review.md
├── selected-intelligence.json
└── google-ai-studio-input.md
```

`selected-intelligence.json` 必须先满足来源、评分、去重、栏目字段和证据要求。格式化周报必须从该 JSON 渲染，不得另写一套事实。

```bash
python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD
python3 scripts/render_google_ai_studio.py output/weekly/YYYY-MM-DD
python3 scripts/validate_weekly.py output/weekly/YYYY-MM-DD
```

第二次校验用于确认格式化周报与结构化 JSON 的链接、日期和字段一致。

## 2. 生成站点 JSON

校验通过后立即执行：

```bash
npm --prefix apps/web run content:issue -- YYYY-MM-DD
```

该命令会：

1. 再次运行本期研究质量校验；
2. 从 `selected-intelligence.json` 读取正式条目；
3. 按字段白名单生成 `publish/weekly/YYYY-MM-DD/issue.json`；
4. 更新 `publish/issues.json`；
5. 生成 `apps/web/src/generated/site-content.json`；
6. 计算并写入确定性的内容哈希。

该步骤不得创建或读取 `publish/reviews/`，也不得要求 `approved_for_publication`、`approved_for_internal_display`、`archived` 等批准状态。

不要手工编辑 `publish/weekly/`、`publish/issues.json` 或 `apps/web/src/generated/`。需要修改内容时，回到 `selected-intelligence.json` 和对应研究产物修正，然后重新校验、渲染和导出。

## 3. 本地预览

首次使用或锁文件变化后安装依赖：

```bash
npm --prefix apps/web ci
```

启动本地网站：

```bash
npm --prefix apps/web run dev
```

浏览器访问 `http://localhost:3000/`。`dev` 会重新生成聚合站点 JSON，但不会推送 Git、不会连接 Netlify，也不会修改线上网站。

本地预览必须完成运行态验收，不能仅凭源文件、生成 JSON 或生产构建通过就判断页面已经更新：

1. 确认开发服务器进程仍在运行，预览端口返回 HTTP 200；
2. 在人工审核所使用的原标签页执行重新加载，不能沿用服务器停止前残留的旧 DOM；
3. 在重新加载后的页面 DOM 中核对新增、修改和移除的标题；被移除条目的匹配数必须为 0；
4. 核对页面显示的期号、栏目顺序和条目数量与 `publish/weekly/YYYY-MM-DD/issue.json` 一致；
5. 若端口没有监听，即使浏览器仍显示页面，也一律视为失效的旧页面，不得作为验收依据。

如临时改用其他端口，例如 3004，应同时用该端口完成服务响应检查和浏览器重新加载，不得只修改访问地址。

## 4. 人工审核

Agent 将本地预览地址、期号、条目数量、内容哈希和验证结果交给人工审核，然后停止在推送动作之前。人工至少检查：

- 最新一期和历史期刊切换是否正确；
- 五个栏目及空栏目呈现是否正确；
- 标题、摘要、日期、星级和模块专属字段是否完整；
- 原文、官方原文和解读链接是否可用且指向正确来源；
- 事实摘要与业务判断是否清楚分区；
- 桌面端、移动端、键盘操作和空状态是否正常；
- 页面中没有候选池、来源审计、内部路径、联系人或知识包内容；
- 当前预览端口仍可访问，且审核标签页已在最后一次数据导出后重新加载；
- 本次明确移除的标题在页面 DOM 中匹配数为 0；
- `git diff` 中只有本期研究产物、生成 JSON 和必要的代码/配置变更。

如果人工提出修改，必须回到第 1 步重新执行全链路。不得直接修改生成 JSON 来绕过源文件和哈希校验。

人工确认应通过当前任务中的明确指令表达，例如“审核通过，可以提交并推送”。不再维护机器读取的批准 JSON，也不得把 Agent 自己的判断当成人工确认。

## 5. 发布前门禁

收到明确人工确认后，执行：

```bash
python3 -m unittest tests/test_intelligence_pipeline.py -v
npm --prefix apps/web run test:all
npm --prefix apps/web run build
git status --short
git diff --check
```

如项目已安装并链接 Netlify CLI，可额外运行：

```bash
netlify status
netlify build
```

`netlify build` 用于在本地模拟 Netlify 构建；未安装 CLI 时，以 `netlify.toml` 中同等的构建命令和 `npm --prefix apps/web run build` 为最低门禁。

任一校验、测试、构建或敏感信息审计失败时，不得推送。

## 6. GitHub 与 Netlify 发布

推送前必须确认：

- 远程仓库是预期的私有 GitHub 仓库；
- 当前分支与目标生产分支正确；
- 没有 `.env`、密钥、内部抽取材料或备份进入暂存区；
- 人工确认发生在最后一次内容变更之后。

然后使用正常 Git 流程：

```bash
git add <本次明确范围内的文件>
git commit -m "content(weekly): publish YYYY-MM-DD intelligence issue"
git push origin <branch>
```

Netlify 行为：

- 推送普通分支或 PR：如站点已开启 Deploy Preview，生成预览部署；
- 合并或推送 Netlify 配置的生产分支（当前约定为 `main`）：触发生产部署；
- Netlify 执行 `netlify.toml` 中的测试和构建命令，输出 `apps/web/dist`；
- Agent 在具备访问能力时检查部署结果；无法读取 Netlify 状态时，明确要求人工在 Netlify 控制台确认成功。

Agent 未收到明确“可以推送”指令时，只能完成 JSON 生成、本地预览和验证，不得自行执行 `git push`。

## 7. 自动阻断条件

- 周报质量校验失败；
- 格式化周报与 `selected-intelligence.json` 不一致；
- 站点 DTO 缺少固定栏目、链接、必要字段或内容哈希不一致；
- 生成数据和 `publish/issues.json` 不一致；
- 浏览器构建物出现内部字段、内部路径或敏感材料；
- 人工审核后源 JSON、生成 JSON 或前端代码又发生变化；
- 远程仓库、生产分支或 Netlify 站点关联无法确认；
- 用户尚未明确允许提交或推送；
- 测试或生产构建失败。

## 8. 回滚

线上内容错误时使用新的 Git 回滚提交恢复上一版本，让 Netlify 重新部署。不要直接在线上控制台或生成目录中手改 JSON。

```bash
git revert <bad-commit>
git push origin <production-branch>
```

回滚前仍需确认目标提交和影响范围。若只是本地预览内容有误且尚未推送，修正源 JSON 后重新导出即可，不需要创建发布批准或撤回状态。

## 9. 数据边界

浏览器只接收 `publish/weekly/*/issue.json` 的白名单字段和经过结构校验的 `output/site/portal-content.json`。以下内容不得进入前端构建物：

- 内部评分明细和证据原文；
- `source_facts`、`business_inference`、`recommended_actions`；
- 候选池、来源审计、分析审查；
- 联系人、内部路径和知识包；
- `legacy/`、`backups/`、`knowledge/source-extracts/`；
- 任何密钥、令牌或部署凭据。
