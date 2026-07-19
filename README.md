# 丰行慧运情报中心

丰行慧运情报中心公开展示站，使用 Vite + React 构建。

仓库只包含浏览器安全的周报数据、公开门户内容和网站构建代码；候选池、来源审计、分析复核、公司知识包及其他内部研究材料不进入公开仓库。

## 本地运行

```bash
npm --prefix apps/web ci
npm --prefix apps/web run dev
```

默认访问地址：`http://localhost:3000/`。

## 发布验证

```bash
npm --prefix apps/web run test:all
npm --prefix apps/web run build
```

Netlify 使用根目录的 `netlify.toml` 完成测试、构建和静态站点发布。
