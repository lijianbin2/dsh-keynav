# awesome-dsh-plugin 收录条目

收录清单：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>（CC0，同时是 DSH 市场索引
`dsh-plugin-catalog` 的数据源）。它只收**能用 `dsh plugin add` 安装、且声明了 `dsh.bundle`** 的插件，
所有描述都会回到源码核对。

## 分类

**UI Enhancements**（侧栏导航 + 快捷键属于界面增强）。

## 条目

贴到 `README.md` 的 UI Enhancements 一段，按字母序（`lijianbin2` 落在 l 段）：

```markdown
- [lijianbin2/dsh-keynav](https://github.com/lijianbin2/dsh-keynav) - Keyboard navigation for the DSH web UI: Ctrl+Up/Down cycles the sidebar plugin area (the Conversation first), Alt+Up/Down steps through the sessions of the current workspace, and Ctrl+J returns the caret to the message input. All five bindings are editable in Settings → General → Keyboard shortcuts, and the plugin runs no Host service and makes no network requests.
```

## 为什么它符合收录标准

| 要求 | 本仓库 |
| --- | --- |
| 能用 `dsh plugin add` 安装 | `package.json` 声明 `dsh.bundle.patch`，`cordis.patch.yml` 插入一行 `keynav` |
| 有已知版本号 | `dsh-keynav@1.1.0` |
| 描述与源码一致 | 五条命令（`keynav.panel.previous/next`、`keynav.session.previous/next`、`keynav.focus`）+ 一个侧栏入口；无 Host 服务、无网络、无模型请求 |
| 长期维护 | 仓库带 CHANGELOG 与语义化版本 |

## 顺序

1. 先 `npm publish`，让 npm 上存在 `dsh-keynav@1.1.0`（清单按 npm 版本取数）；
2. 再确保 GitHub 仓库公开且默认分支可读；
3. 最后提 PR/issue 加这一条。索引重建后（每天 03:17 UTC）这条会进入 DSH Plugin Market。
