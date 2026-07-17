# Step 0 工作区清理报告

执行日期：2026-07-17  
状态：本地清理和回归验证完成；目标 GitHub 仓库已确认公开，等待私有化。

## 1. 恢复点

清理前生成了两份完整归档，均为 141,959,973 bytes：

- 工作区内：`backups/fengxing-intelligence-research-workspace-2026-07-17-pre-refactor.tar.gz`
- 工作区外：`../workspace-backups/fengxing-intelligence-research-workspace-2026-07-17-pre-refactor.tar.gz`

两份归档 SHA-256 均为：

```text
19558d651107bcd0ba1e2f6187b5a9d438009911934a62f7d020741c589e5d34
```

归档已完整解压验证；源文件数与恢复文件数均为 528，抽样文件校验值一致。

## 2. 清理前基线

- 排除 `backups/` 后文件数：528。
- `tmp/`：约 117 MB，其中 401 个可再生成的渲染 PNG。
- `intelligence-library/`：约 44 KB，内容全部为论文或预印本研究条目。
- `state/seen-urls.jsonl` SHA-256：`8cc93d8a53752316fc695ddd3d55266944618b4db07bb7c217467258b0f399cc`。
- `state/seen-events.jsonl` SHA-256：`4aa7726cfd6c06c8fcfb143d62fcbb74cc53ced73cb63bfb8cc7f59477091c0b`。

## 3. 已删除内容

- 四个 `.DS_Store` 系统文件。
- `scripts/__pycache__/` 和 `tests/__pycache__/`。
- `tmp/business_doc_renders/`：401 个可再生成 PNG，约 117 MB。
- `output/weekly/2026-06-12/google-ai-studio-input.txt`：与同目录 `.md` 内容完全相同的重复导出。
- `tmp/business_doc_extracts`：指向规范路径 `knowledge/source-extracts/` 的兼容软链接。
- 清空后的 `tmp/README.md` 和 `tmp/` 目录。

这些内容均可从清理前备份恢复；渲染缓存也可由源材料重新生成。

## 4. 已迁移和隔离内容

- `intelligence-library/` → `legacy/research-notes/academic/`，共 6 个文件；索引中的本机绝对路径已改为仓库相对路径。
- `docs/superpowers/` → `docs/archive/2026-06-workspace-migrations/`。
- `config/watchlist-audit.md` → `docs/archive/config-audits/watchlist-audit-2026-06-25.md`。
- 13 份周报扫描、修订和补充稿 → 对应期刊的 `working-notes/`。
- 知识包内旧 `AGENTS.md`、启动提示词、观察名单、查询库和术语别名 → `legacy/knowledge-pack-config-v0.2/`。

仓库根目录 `AGENTS.md` 和 `config/` 现为规则与运行配置的唯一活动入口。

## 5. 明确保留内容

- 六期周报的五个正式文件，共 30 个，全部仍在原期刊目录。
- `state/seen-urls.jsonl` 和 `state/seen-events.jsonl`；清理前后校验值完全一致。
- `knowledge/source-extracts/manifest.json` 与 `manifest_v2.json`：两者结构和覆盖范围不同，在建立规范化清单前均保留。
- `fengxing_knowledge_pack/knowledge.json`：在确认其生成关系前保留。
- `examples/` 中的 PDF 格式样例：属于项目规则要求的必读样例，暂不删除。

## 6. 忽略和敏感边界

`.gitignore` 已新增：

- `tmp/`、`backups/`；
- `.env` 与本地凭据文件；
- `knowledge/source-extracts/`；
- 前端生成数据和构建目录。

详细分级见 `docs/security/repository-content-classification.md`。

## 7. 清理后验证

- 排除 `backups/` 后文件数：120（包含本次新增的清理报告和内容分级文件）。
- 未发现 `.DS_Store`、`__pycache__`、`.pyc` 或遗留软链接。
- 11 个 Python 单元测试全部通过。
- `output/weekly/2026-07-10` 通过当前周报质量校验。
- 六期周报五个正式文件共 30 个，数量完整。
- 两个去重状态文件 SHA-256 与清理前一致。

## 8. GitHub 前提核对

- `git ls-remote` 确认目标仓库默认分支为 `main`，当前 HEAD 为 `e22ba8b8e13a8c85e59f948687437508848e26ef`。
- GitHub 官方 API 返回 `private: false`、`visibility: public`。
- 当前环境未安装 GitHub CLI；Git 命令本身不能修改仓库可见性。
- 因此未把任何研究内容导入目标仓库，也未执行推送。

## 9. 尚未执行

- 未删除两个来源抽取清单，也未合并 `knowledge.json`。
- 未改写历史周报以强行通过新校验。
- 未把研究工作区导入网站仓库。
- 未变更 GitHub 仓库可见性、默认分支或部署配置；目标仓库必须先由仓库所有者设为私有。

上述动作需要在目标仓库私有化和内容契约设计确认后继续执行。
