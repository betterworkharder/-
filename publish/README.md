# 网站发布数据

该目录是研究产物与浏览器之间的发布边界。

- `weekly/YYYY-MM-DD/issue.json`：经过脱敏的周报 DTO。
- `issues.json`：期刊索引、栏目数量与内容哈希。

网站扩展栏目以 `output/site/portal-content.json` 为唯一结构化输入。正常构建
不会读取 `legacy/`；历史来源字段只作为快照溯源元数据保留，并且不会进入浏览器。

2026-06-05 至 2026-07-10 为最后一次发布网站的只读快照，来源提交为
`e22ba8b8e13a8c85e59f948687437508848e26ef`。这些快照用于保证重构首发的
内容连续性，不代表研究工作区同日期文件已按当前 Schema 重新校验和生成。

不要手工修改 `weekly/` 下的 JSON。新一期必须按
`docs/operations/weekly-site-publishing.md` 完成研究校验、格式化周报、JSON 导出和
本地预览。生成 JSON 不需要批准记录；人工审核只决定是否允许 Git push。
