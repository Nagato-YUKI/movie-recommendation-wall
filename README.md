# 🎬 影荐墙 — 经典高分电影推荐站

<p align="center">
  <img src="https://img.shields.io/github/stars/Nagato-YUKI/movie-recommendation-wall?style=social" alt="GitHub Stars">
  <img src="https://img.shields.io/github/license/Nagato-YUKI/movie-recommendation-wall" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/platform-web-blue" alt="Platform">
</p>

<p align="center">
  <b>🎯 收录 100 部 IMDb / 豆瓣 / Letterboxd 高分佳作 &nbsp;|&nbsp; 🔍 模糊搜索 &nbsp;|&nbsp; ⭐ 评分收藏 &nbsp;|&nbsp; 💬 观影留言</b>
</p>

<p align="center">
  <a href="https://nagato-yuki.github.io/movie-recommendation-wall/">🔗 在线体验</a>
  &nbsp;·&nbsp;
  <a href="#-功能速览">⚡ 功能速览</a>
  &nbsp;·&nbsp;
  <a href="#-技术栈">🛠 技术栈</a>
  &nbsp;·&nbsp;
  <a href="#-本地运行">💻 本地运行</a>
</p>

---

## 📖 项目简介

**影荐墙**是一个专注于**高分电影推荐**的静态展示网站。我们综合 IMDb Top 250、豆瓣 Top 250、Letterboxd、烂番茄四大权威榜单，精选 **100 部 2000 年后的经典佳作**，用精致的卡片式设计呈现给你。

> 🎯 **核心关键词**：电影推荐 · 高分电影 · 经典电影 · 电影排行榜 · 影视推荐 · 电影收藏 · movie recommendation

### ✨ 为什么做这个项目？

- 🤔 片荒了不知道看什么？打开影荐墙，100 部高分好片任你挑选
- 📊 综合四大榜单评分，比单一平台更权威
- 🔗 每部电影直连小宝影院在线播放，即点即看
- 💾 收藏 + 评分 + 留言，打造你的私人观影笔记

---

## ⚡ 功能速览

| 功能 | 说明 | 状态 |
|------|------|:----:|
| 🔍 **模糊搜索** | 支持缺字、漏标点搜索，"哈利波特"也能找到「哈利·波特」 | ✅ |
| 🏷️ **分类筛选** | 9 大类型标签（科幻 / 悬疑 / 动画 / 剧情 / 爱情 / 喜剧 / 战争 / 传记 / 历史） | ✅ |
| 📊 **多维度排序** | 按排名 / 评分 / 年份 / 片名排序 | ✅ |
| 📄 **智能分页** | 每页 24 部，流畅滚动浏览 | ✅ |
| ❤️ **收藏功能** | 心形按钮一键收藏，localStorage 持久化 | ✅ |
| 👍 **点赞系统** | 为心仪电影点赞，数据本地留存 | ✅ |
| ⭐ **五星评分** | 用户评分与系统评分独立展示 | ✅ |
| 💬 **留言板** | 访客留言 + 昵称，时间倒序展示 | ✅ |
| 🖼️ **电影弹窗** | 点击卡片查看详情、简介、台词、在线播放链接 | ✅ |
| 🔗 **在线观看** | 直连小宝影院播放页，99/100 部精准匹配 | ✅ |
| 🎨 **深色模式** | 明暗主题一键切换 | ✅ |
| 📱 **响应式布局** | 手机 / 平板 / 桌面完美适配 | ✅ |
| ⚡ **图片懒加载** | IntersectionObserver + shimmer 骨架屏 | ✅ |
| 🔝 **回到顶部** | 平滑滚动 + 进度指示条 | ✅ |
| 🔗 **一键分享** | 复制页面链接 | ✅ |

---

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|:--|------|------|
| 🏗 **结构** | HTML5 语义化标签 | SEO 友好，无障碍访问 |
| 🎨 **样式** | TailwindCSS CDN | 原子化 CSS，零构建配置 |
| ⚙️ **逻辑** | 原生 JavaScript (ES6+) | 无框架依赖，模块化组织 |
| 💾 **存储** | localStorage | 收藏 / 评分 / 留言本地持久化 |
| 👁️ **懒加载** | IntersectionObserver API | 图片进入视口才加载 |
| 🔤 **字体** | Google Fonts (Noto Sans SC) | 中文优化，清晰易读 |

---

## 📁 项目结构

```
movie-recommendation-wall/
├── index.html              # 🏠 首页（电影展示 / 筛选 / 留言板）
├── resume.html             # 👤 站长简历
├── css/
│   ├── style.css           # 🎨 主样式（卡片动效 / 标签 / 弹窗 / 留言板 / 暗色模式）
│   └── resume.css          # 📄 简历页样式
├── js/
│   ├── data.js             # 📦 100 部电影数据（片名 / 评分 / 导演 / 简介 / 台词）
│   ├── app.js              # 🧠 核心逻辑（渲染 / 搜索 / 筛选 / 收藏 / 评分 / 留言）
│   └── watch_urls.js       # 🔗 小宝影院播放链接映射
├── images/                 # 🖼️ 电影海报图片（100 张）
└── README.md               # 📖 本文件
```

---

## 💻 本地运行

纯静态项目，零依赖安装，打开即用：

```bash
# 方式一：直接用浏览器打开
start index.html

# 方式二：本地服务器（推荐）
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```

---

## ❓ 常见问题 (FAQ)

<details>
<summary><b>Q: 为什么只有 2000 年后的电影？</b></summary>
<p>四大榜单中 2000 年后的电影占比高、画质好、对当代观众更友好。老电影爱好者请见谅 🙏</p>
</details>

<details>
<summary><b>Q: 搜索支持模糊匹配吗？</b></summary>
<p>✅ 支持！缺字、漏标点、错别字都能搜到。例如搜索「哈利波特」能找到「哈利·波特」，搜索「盗梦空间」能找到「盗梦空间」。</p>
</details>

<details>
<summary><b>Q: 在线播放链接稳定吗？</b></summary>
<p>链接指向小宝影院 (xiaoheimi.cc)，99/100 部电影已通过标题+年份精准匹配。若链接失效请提 Issue 📮</p>
</details>

<details>
<summary><b>Q: 我的收藏和评分会丢失吗？</b></summary>
<p>数据存储在浏览器 localStorage 中，只要不清除浏览器数据就不会丢失。清除缓存前建议导出备份 🔒</p>
</details>

<details>
<summary><b>Q: 可以添加新的电影吗？</b></summary>
<p>欢迎 PR！在 <code>js/data.js</code> 中按格式添加电影数据，并在 <code>js/watch_urls.js</code> 中补充播放链接即可 🎉</p>
</details>

---

## 👤 作者

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/Nagato-YUKI.png" width="80" height="80" style="border-radius: 50%;" alt="Nagato-YUKI"><br>
      <b>陈政廷</b><br>
      <sub>福州软件职业技术学院 · 专任教师</sub>
    </td>
    <td>
      🐙 <a href="https://github.com/Nagato-YUKI">GitHub</a><br>
      📧 <a href="mailto:1564629814@qq.com">1564629814@qq.com</a><br>
      🌐 <a href="https://nagato-yuki.github.io/movie-recommendation-wall/">项目主页</a>
    </td>
  </tr>
</table>

---

## 📜 许可证

本项目仅供学习交流使用。海报图片来源 Unsplash 免费图库。

---

<p align="center">
  <sub>⭐ 如果这个项目对你有帮助，请给一个 Star ~ &nbsp;|&nbsp; Made with ❤️ by Nagato-YUKI</sub>
</p>
