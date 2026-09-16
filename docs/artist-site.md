# 音乐人首页维护

WU 雾 是音乐人身份；Harper Live Sessions 是音乐写作与现场记录项目。名称在 config/_default/params.yaml 中分别保存在 identity.name 和 identity.label。

## 恢复作品入口

将 config/_default/params.yaml 中 features.showWorks 改为 true，即可恢复现有 Projects 导航、首页作品部分和通用列表中的作品条目。

关闭时只过滤 UI 入口，不删除内容，也不改变 draft 状态。作品原有 URL 仍可直接访问；这不是访问权限控制。

## 首页文章

Field Notes 的 front matter 使用 home_group: live（现场记录）或 home_group: writing（音乐随笔）。首页每组按日期展示最多三篇，完整列表保留在 /field-notes/，未分类条目也会显示。仅展示当前语言实际参与构建的内容，不补造译文。

## 排版与预览

标题沿用原字体；新增调整集中在 assets/css/05-pages/musician.css。旧封面布局保存在 layouts/home-cover.html，需要时可用首页 front matter 的 layout: home-cover 选择。

运行 hugo server -D 可预览草稿；运行 hugo --environment production 可检查正式构建。已有摄影原文件保留，首页只生成校正方向、缩放后的 WebP。
