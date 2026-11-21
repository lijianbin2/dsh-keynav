# 市场收录（已提交）

投稿仓库：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>（CC0，同时是 DSH 市场索引
`dsh-plugin-catalog` 的数据源）。

**已提交 PR：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/17468>**

## 这个清单的投稿方式

清单不是改 README，而是**只加一个数据文件**：`data/plugins/<owner>__<repo>.yml`。
README / README.zh 由脚本从 `data/plugins/*.yml` 生成，PR 合并后在 main 上自动重建。

本插件提交的内容就是下面这一个文件：

```yaml
url: https://github.com/lijianbin2/dsh-keynav
name: lijianbin2/dsh-keynav
category: ui
description:
  en: 'Keyboard navigation inside the DSH web UI: Ctrl+Up/Down cycles the sidebar plugin area (the Conversation first), Alt+Up/Down steps through the sessions of the current workspace, and Ctrl+J returns the caret to the message input. All five bindings are editable in Settings → General → Keyboard shortcuts; the plugin runs no Host service and makes no network requests.'
  zh: 'DSH 网页端的键盘导航：Ctrl+↑/↓ 在左侧栏插件区里切换（会话排第一），Alt+↑/↓ 在当前工作区的会话间切换，Ctrl+J 把光标送回消息输入框。五条键位都能在「设置 → 通用 → 快捷键」里改；插件不占用 Host 服务，也不联网。'
icon: https://raw.githubusercontent.com/lijianbin2/dsh-keynav/main/assets/icon-180.png
```

- `category: ui` —— 侧栏导航与快捷键属于界面行为；
- `description` 含 `: `（冒号加空格），必须加引号，否则 YAML 会当成嵌套键；
- `icon` 必须是 **GitHub 托管的位图**（png/jpg/webp，约 96px 显示）；SVG 会被拒绝，
  所以仓库里放了由同一份几何图形栅格化出来的 `assets/icon-180.png`；
- 不写 `npm:` 字段——npm 映射由 registry 自动采集，手写会被校验拒绝。

## 收录标准对照

| 要求 | 本仓库 |
| --- | --- |
| `dsh.bundle` manifest | `package.json` 的 `dsh.bundle.patch` + 旁边的 `cordis.patch.yml` |
| 真实可用的代码 | 纯浏览器端插件，5 条命令 + 侧栏页 |
| 仓库建满 1 天 | 2026-11-21 创建，CI 门槛会自动重跑 |
| `dsh-plugin` topic | 已加（另加 dsh / deepseek-harness / keyboard / shortcuts / navigation） |
| 描述与源码一致 | 五条命令 id 见 `client.js`：`keynav.panel.previous/next`、`keynav.session.previous/next`、`keynav.focus` |
| 一个 PR 最多 3 条 | 本 PR 只有 1 条 |

## 后续

- CI 里的「仓库满 1 天」是快照，会自动重跑，不需要推空提交；
- 维护者可能需要改描述或分类，届时在同一分支推送修复 + **留一条**评论说明即可；
- 合并后索引重建：清单目录包每日重建，DSH Plugin Market 每天 03:17 UTC 转换，
  dshfind 每日从 GitHub 同步。
