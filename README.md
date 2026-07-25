# conventional-commits-claude

一個 [Claude Code](https://claude.com/claude-code) plugin，讓 Claude 依 [慣例式提交（Conventional Commits）v1.0.0 繁體中文規範](https://www.conventionalcommits.org/zh-hant/v1.0.0/) 自動產生 git commit，並整合 [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) 分支策略。

## 特色

- 📝 **符合慣例式提交規範**：`<type>[scope]: <繁中描述>` + body + footer 全部按規範
- 🔀 **多任務自動拆分**：偵測到不相關的變更會自動分成多個 commit，不再一鍋燉
- 🌿 **整合 Git Flow**：`main`/`develop` 禁止直接提交，依變更意圖自動建 `feature/*` 或 `hotfix/*`
- 👥 **Author 與 Committer 分離**：Author 沿用你的 git config，Committer 設為 GitHub [@claude](https://github.com/claude) 帳號
- 🤖 **標示 AI 協作**：每個 commit body 尾端自動附上 `Co-Authored-By: Claude <當前模型名> <noreply@anthropic.com>`
- 🈶 **全繁體中文**：description、body、footer 說明文字採用繁體中文（type/scope 保持英文以符合國際慣例）

## 安裝

### 方式一：透過 marketplace（推薦）

```bash
claude plugin marketplace add AndyAWD/conventional-commits-claude
```

```bash
claude plugin install conventional-commits-claude@conventional-commits-claude
```

### 方式二：直接從 GitHub 安裝

```bash
claude plugin install github:AndyAWD/conventional-commits-claude
```

### 需求

- [Claude Code](https://claude.com/claude-code)
- Node.js ≥ 18
- git ≥ 2.20

## 使用方式

有兩種方式可以啟動：

### 方式一：斜線指令（明確觸發）

在 Claude Code 對話輸入：

```
/conventional-commits-claude:commit
```

支援 tab 自動補全，實務上打 `/co` 加 tab 就會出現這個指令。

### 方式二：自然語言（讓 Claude 自動判斷）

對 Claude 說任一句話：

- 「幫我 commit」
- 「整理提交」
- 「拆 commit」
- 「conventional commit 一下」

---

兩種方式最終行為相同，Claude 會自動：

1. 執行 `git add -A`（含未追蹤檔案）
2. 分析 staged 內容，判斷是否需要拆分成多個 commit
3. 依 Git Flow 策略檢查 / 建立分支
4. 為每組任務產生符合規範的 commit 訊息並提交

## 行為說明

### 執行流程

```
Step 1: git add -A                    ← 先 stage 全部
Step 2: 蒐集 git status / diff        ← analyze.js
Step 3: 分組任務（自動拆分）
Step 4: Git Flow 分支檢查              ← branch-guard.js
Step 5: 決定每組 type / scope
Step 6: 撰寫符合規範的訊息
Step 7: 逐組 reset → add → commit     ← commit.js
```

### Git Flow 分支對照

| 目前分支 | 變更意圖 | 行為 |
|---------|---------|------|
| `main` / `master` + 無 `develop` | feature | 建 `develop` → 建 `feature/<描述>` |
| `main` / `master` + 有 `develop` | feature | **中止**，回報「可能在錯誤分支」 |
| `main` / `master` | hotfix（全 `fix:`） | 從 `main` 直接建 `hotfix/<描述>` |
| `develop` | feature | 建 `feature/<描述>` |
| `develop` | hotfix | 建 `feature/<描述>` 並警告 |
| `release/*` | 任何 | 直接在該分支提交（`feat:` 會提醒） |
| `hotfix/*` | 任何 | 直接在該分支提交 |
| `feature/*` 或其他 | 任何 | 直接在該分支提交 |

**變更意圖判斷**：拆分後所有任務都是 `fix:` → hotfix；其他情況 → feature。

### Commit 訊息範例

```
feat(auth): 新增 OAuth 登入支援

現有 email/密碼流程對非技術使用者摩擦太大，透過 Google OAuth 一鍵登入減少註冊流失。

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

檢視 `git log` 會看到：

- **Author**：你自己（沿用 `git config user.name` / `user.email`）
- **Committer**：`claude <81847+claude@users.noreply.github.com>`（連結至 GitHub [@claude](https://github.com/claude)）
- **Co-Authored-By trailer**：帶當前執行的 Claude 模型名（例如 `Opus 4.7`、`Sonnet 4.6`）

### 為何 Author 與 Committer 分離？

- **Author** = 誰發起這個變更的想法與決策 → 你
- **Committer** = 誰實際執行了 `git commit` 這個動作 → Claude

這樣 git 歷史可以清楚呈現「人機協作」關係，同時完整保留你的原創貢獻歸屬。GitHub 也會把兩者分別顯示（頭像、commit 頁的 authored/committed 標籤）。

### 為何 Committer email 用 GitHub noreply 格式？

`81847+claude@users.noreply.github.com` 是 GitHub 為 [@claude](https://github.com/claude) 帳號（user id `81847`）的官方 noreply 格式。用這個 email：

- Commit 會自動連結到 [@claude](https://github.com/claude) profile
- 保護實際 email 隱私
- 符合 GitHub 官方推薦做法

Co-Authored-By trailer 中的 `noreply@anthropic.com` 則沿用 Claude Code 官方慣例，兩者職責不同、故 email 不同。

## 授權

[MIT](./LICENSE) © 2026 [AndyAWD](https://github.com/AndyAWD)

## 貢獻

Issue 與 Pull Request 歡迎！請務必：

1. 用此 plugin 自身的規範來寫 commit（吃自己的狗糧）
2. PR 描述說明「為何」而非「做什麼」
3. 若涉及分支策略變更，請先開 issue 討論
