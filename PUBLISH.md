# 发布与上架

包名 `dsh-keynav`，当前版本 **1.1.0**，仓库 `https://github.com/lijianbin2/dsh-keynav`。

两个已配置的市场索引都不是「上传接口」，而是**从 npm + GitHub 自动同步**出来的：

| 市场 | 索引地址 | 收录方式 |
| --- | --- | --- |
| DSH Plugin Market（realguan） | `https://cdn.jsdelivr.net/gh/realguan/dsh-plugin-market@dist/dsh-index.json` | 每天 03:17 UTC 重建，条目来自 [awesome-dsh-plugin](https://awesome-dsh-plugin.com/)（CC0），逐条回源核实 npm 版本 / Git commit |
| dshfind | `https://api.dshfind.com/market/dsh-index.json` | 每日从 GitHub 同步，只收「npm 包与仓库对得上」的插件 |

所以顺序是：**推仓库 → 发 npm → 进收录清单 → 等索引重建**。

## 已经就绪的东西

```text
market/dsh-index.json    format 1 索引条目，已用 DSH 官方 parseMarketIndex 验证通过
market/awesome-entry.md  可直接提交的 awesome-dsh-plugin 条目 + 分类 + 收录标准对照
.git/                    已 git init，main 分支，remote=origin，工作区干净
```

`npm pack --dry-run` 结果：18 个文件、16.2 kB，包含 `client.js`、`cordis.patch.yml`、8 个 locale、
`docs/`、`icon.svg`、LICENSE、README、CHANGELOG；`market/` 与 `PUBLISH.md` 不进包。

## ① 建远端仓库并推送（需要你的 GitHub 账号）

在 GitHub 上新建**空仓库** `dsh-keynav`（不要带 README / LICENSE），然后：

```powershell
cd C:\Users\1\Documents\deepseek-harness\default-workspace\dsh-keynav
git push -u origin main
```

推完在仓库 About 里加 topic：`dsh`、`dsh-plugin`、`deepseek-harness`（dshfind 与
awesome-deepseek-harness 按 topic 同步）。

## ② 发布 npm（需要你的 npm 账号）

```powershell
cd C:\Users\1\Documents\deepseek-harness\default-workspace\dsh-keynav
npm login                    # 交互式
npm whoami                   # 确认身份
npm publish --access public
npm view dsh-keynav version  # 应输出 1.1.0
```

## ③ 立刻能在自己的 Discover 里看到（不必等市场收录）

仓库推上去之后，`market/dsh-index.json` 就有一份可通过 jsDelivr 访问的地址：

```text
https://cdn.jsdelivr.net/gh/lijianbin2/dsh-keynav@main/market/dsh-index.json
```

在 DSH：**插件 → 发现 → 添加索引源** 填这个地址，就能看到「键盘导航 / Keyboard navigation」
条目并从 npm 安装。这是验证索引格式与安装链最快的方式。

## ④ 进收录清单（进公共市场的唯一路径）— 已提交

- **awesome-dsh-plugin**：已提交 PR [#17468](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/17468)，
  只加一个数据文件 `data/plugins/lijianbin2__dsh-keynav.yml`（清单只收这种文件，两个 README 由脚本生成）。
  现在等两件事：CI 的「仓库满 1 天」门槛自动重跑，以及维护者读代码后合并。细节见 `market/awesome-entry.md`。
- **dshfind**：仓库公开后每日从 GitHub 同步；发布 npm 后条目还能显示下载量。

## ⑤ 验证收录

索引重建后（GitHub Pages 约 10 分钟，jsDelivr 最长 12 小时）：

1. DSH → **插件** → **发现** → 搜 `keynav`；
2. 卡片显示「键盘导航 / Keyboard navigation」、图标、描述，来源 `dsh-keynav@1.1.0`（npm）；
3. 点安装 → 确认框显示来源 → 装好刷新页面，出现侧栏「键盘导航」行与五条快捷键。

## 版本约定

- 改了用户可见行为 → `npm version minor` 并更新 CHANGELOG；
- 只修 bug → `patch`；
- 每次发布后同步更新 `market/dsh-index.json` 的 `versions[0]`（`version` 与 `publishTimestamp`），
  索引条目的版本必须与 npm 上实际存在的版本一致，否则市场无法安装。
