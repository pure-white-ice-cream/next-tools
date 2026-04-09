# next-tools

面向「一个路由一个小工具」的 Next.js 应用：根路径为工具入口面板（导航与分类），每个独立功能占单独页面，界面以 shadcn/ui 为主构建。

## 目标与约定（对 AI 友好）

- **入口页面**：`/` 作为导航面板，集中展示所有工具入口
- **主题切换**：全局暗色模式切换；**默认跟随系统主题**（system）
- **UI 风格**：使用 `shadcn/ui` 的组件组织方式（`src/components/ui/*`）+ Tailwind
- **路由规划**：所有工具页统一放在 `src/app/tools/<tool-slug>/page.tsx`

## 技术栈

- **Next.js (App Router)**：页面与布局在 `src/app/*`
- **React**：交互型工具页使用 Client Component
- **Tailwind CSS v4**：全局样式 `src/app/globals.css`
- **主题**：`next-themes`（`attribute="class"`，通过 `.dark` 驱动）

## 已实现页面

- **导航面板**：`/`
- **小工具：Excel 列号/字母互转**：`/tools/excel-column`
  - 数字 → 字母：1→A，26→Z，27→AA
  - 字母 → 数字：A→1，Z→26，AA→27（不区分大小写）

## 项目结构（重点）

```txt
src/
  app/
    layout.tsx                # 全局布局：Header + ThemeProvider + ThemeToggle
    page.tsx                  # 导航面板
    tools/
      excel-column/
        page.tsx              # Excel 列号/字母互转工具页
  components/
    theme-provider.tsx        # next-themes Provider
    theme-toggle.tsx          # 暗色切换按钮
    ui/                       # shadcn/ui 风格组件目录
  lib/
    utils.ts                  # cn() 工具
```

## 开发

```bash
npm run dev
```

访问 `http://localhost:3000`。

## Cloudflare（OpenNext）相关脚本

```bash
npm run preview
npm run deploy
```

更多信息见 OpenNext 文档：`https://opennext.js.org/cloudflare`。

## 如何新增一个工具页（给 AI / 贡献者）

1. 在 `src/app/tools/<tool-slug>/page.tsx` 新增页面
2. 在 `src/app/page.tsx` 的 `tools` 数组中添加入口（title/description/href）
3. 工具页如需交互，请使用 `"use client"` 并优先复用 `src/components/ui/*`
