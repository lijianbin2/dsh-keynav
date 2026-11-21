# 发布到插件市场

这份清单把 `dsh-keynav` 推到 DSH 的第三方市场。两个已配置的索引源都不是「上传接口」，而是**从 npm + GitHub 自动同步**出来的，所以要进入市场，只要让这两处存在：

| 市场 | 索引地址 | 收录方式 |
| --- | --- | --- |
| DSH Plugin Market（realguan） | `https://cdn.jsdelivr.net/gh/realguan/dsh-plugin-market@dist/dsh-index.json` | 每天 03:17 UTC 重建，条目数据来自 [awesome-dsh-plugin](https://awesome-dsh-plugin.com/)（CC0），逐条回源核实 npm 包 / Git commit |
| dshfind | `https://api.dshfind.com/market/dsh-index.json` | 每日从 GitHub 同步，只收 npm 包与仓库能对上的插件 |

所以顺序是：**① 发 npm → ② 开公开 GitHub 仓库 → ③ 进 awesome-dsh-plugin / 打 topic → ④ 等索引重建**。

## 现在卡在哪

- 本机 npm **未登录**（`npm whoami` → `ENEEDAUTH`），`npm publish` 需要一个 npm 账号。
- 还没有公开 GitHub 仓库，`git` 可用但没有远端。

包名已确认可用：`npm view dsh-keynav` → 404（未占用）。

## ① 发布 npm 包

在包目录（`dsh-keynav`）执行：

```powershell
npm login                 # 交互式，需要你自己的账号（或设置 NPM_TOKEN 环境变量）
npm whoami                # 确认身份
npm publish --access public
npm view dsh-keynav version
```

发布前自检（不影响实际发布）：

```powershell
npm pack --dry-run        # 只打印将要打包的文件
```

应当只包含：`index.js`、`client.js`、`cordis.patch.yml`、`locale/*.json`、`docs/`、`README.md`、`CHANGELOG.md`、`LICENSE`、`icon.svg`。

> `market/dsh-index.json` 不在 `files` 里，不会被打进包；它是给你自己托管索引或提 PR 时用的样例。

## ② 建公开 GitHub 仓库

```powershell
git init
git add .
git commit -m "feat: dsh-keynav 1.1.0"
git branch -M main
git remote add origin https://github.com/<你的账号>/dsh-keynav.git
git push -u origin main
```

仓库里要能看出它是一个 DSH 插件：`package.json` 带 `dsh.bundle.patch`（已满足），README 写清安装方式（`dsh plugin add dsh-keynav` 或 插件页安装）。

到仓库 **About** 里加上 topic：`dsh`、`dsh-plugin`、`deepseek-harness` —— dshfind 与 awesome-deepseek-harness 按 topic 同步。

## ③ 进收录清单

- **awesome-dsh-plugin**（realguan 索引的数据源，CC0）：按它的收录标准提 PR/issue——只收能用 `dsh plugin add` 安装、且声明了 `dsh.bundle` 的插件。加一条即可，字段与 `market/dsh-index.json` 里的 `name` / `version` / 仓库地址一致。
- **dshfind**：仓库 + npm 包对上之后会被每日同步收录，也可以在它的 GitHub（hikariming/dshfind）提 issue 申请。

## ④ 验证收录

索引重建后（GitHub Pages 约 10 分钟，jsDelivr 最长 12 小时）：

1. DSH → **插件** → **发现** → 搜 `keynav`；
2. 卡片应显示「键盘导航 / Keyboard navigation」、图标、描述，来源为 `dsh-keynav@1.1.0`（npm）；
3. 点安装 → 确认框显示来源 → 装好后刷新页面，出现侧栏「键盘导航」行与五条快捷键。

## 自己先看效果（不发布也能验）

`market/dsh-index.json` 已用 DSH 官方校验器（`@deepseek-ai/dsh-plugin-market-index` 的 `parseMarketIndex`）验证通过，`format: 1`、名称 `dsh-keynav`、版本 `1.1.0`、图标为内嵌 SVG data URL。把它托管到任意 https 地址（GitHub Pages / 自建静态站），在 DSH 里 **发现 → 添加索引源** 填入地址，就能在自己的 Discover 里看到这条条目。
