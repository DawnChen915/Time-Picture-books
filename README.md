# 时光绘本

为孩子定制一本以 TA 为主角的绘本：填一张表，Claude 写出 6–8 页故事，OpenAI gpt-image 画插图，可以在线翻看并导出 PDF。

## 快速开始

```bash
npm install
cp .env.example .env.local   # 填入 ANTHROPIC_API_KEY 和 OPENAI_API_KEY
npm run dev                  # http://localhost:3000
```

没有 key 也能把流程跑一遍：`.env.local` 里设 `STORY_PROVIDER=mock`，并且不填 `OPENAI_API_KEY`（会自动用占位图）。

## 生成流程

1. **表单**（`src/components/BookForm.tsx`）：名字、年龄、性别、外貌、喜好、主题、画风、页数。
2. **写故事**（`POST /api/books` → `src/lib/story.ts`）：Claude 用结构化输出返回标题、献词、角色设定（英文，供每张插图复用）、封面和每页的文字与插图提示词。
3. **画插图**（`POST /api/books/:id/illustrations/:slot` → `src/lib/illustrate.ts`）：先画封面，再以封面为参考图画每一页，保持主角长相一致。前端同时画 2 页，页面会实时显示进度，失败的页可以单独重画。
4. **翻看与导出**（`src/components/BookViewer.tsx`）：左右键或按钮翻页；插图画完后可导出 PDF（在浏览器里把每页渲染成图片再拼成 PDF，中文字体不会丢）。

## 目录

```
src/
  app/                    页面与 API 路由
  components/             表单、阅读器、PDF 导出
  lib/
    story.ts              Claude 生成故事
    images/               图像服务（openai / placeholder），换服务只需加一个 provider
    illustrate.ts         插图生成与状态管理
    storage.ts            本地文件存储（.data/books/<id>/）
```

## 现阶段的限制

- 数据存在本地磁盘，没有数据库、登录和付费；部署到 Serverless 平台前需要换成对象存储。
- 一次生成大约 9 张图，按 OpenAI 的计费会产生费用，`OPENAI_IMAGE_QUALITY` 可以调低。
