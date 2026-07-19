# 丰行慧运情报中心网站

当前目录保存与最后一次发布保持一致的 Vite + React 只读门户。周报内容由
`publish/weekly/*/issue.json` 生成，专家观点、竞品看板和站点说明由
`output/site/portal-content.json` 生成。React 代码不保存业务正文，`legacy/`
只用于迁移参考。

## 本地启动

在仓库根目录运行：

```bash
npm --prefix apps/web install
npm --prefix apps/web run dev
```

浏览器访问：`http://localhost:3000/`

本地基线已经移除旧站 Firebase 运行时。点赞只保存在浏览器本地存储，
反馈表单只演示交互，不会向远端发送内容。

每周更新流程见 `docs/operations/weekly-site-publishing.md`。新增一期不应修改
`src/App.tsx` 或 `src/data.ts`。

生成新一期站点 JSON：

```bash
npm --prefix apps/web run content:issue -- YYYY-MM-DD
npm --prefix apps/web run dev
```

生成 JSON 不需要批准记录。人工在本地页面确认内容与排版后，明确允许 Git
push；推送生产分支后由 Netlify 自动构建和部署。没有人工明确确认时不得推送。

## 验证

```bash
npm --prefix apps/web run lint
npm --prefix apps/web run test:all
npm --prefix apps/web run build
npm --prefix apps/web run preview
```
