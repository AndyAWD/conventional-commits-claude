---
name: commit
description: 依照慣例式提交（Conventional Commits）v1.0.0 規範自動產生 git commit。分析目前 workspace 變更，若包含多個獨立任務會自動拆分成多個 commit。整合 Git Flow 分支策略（main/develop 禁止直接提交，自動建 feature/* 或 hotfix/*）。每個 commit 的 author 沿用 git config，committer 設為 claude <81847+claude@users.noreply.github.com>（連結至 GitHub @claude），並在 body 尾端加上帶當前模型名的 Co-Authored-By trailer。無論使用者說「commit」「提交」「幫我 commit」「conventional commit」「拆 commit」「整理提交」等相關字眼，只要涉及建立 git commit 就使用此 skill。
---

# Conventional Commits with Git Flow

依照 [慣例式提交 v1.0.0](https://www.conventionalcommits.org/zh-hant/v1.0.0/) 規範產生 commit，並整合 Git Flow 分支策略。

## 何時使用此 Skill

當使用者提出下列任何請求時，都應該啟用此 skill：

- 「幫我 commit」「幫我提交」「commit 一下」
- 「整理提交」「拆 commit」「分成幾個 commit」
- 「conventional commit」「按規範提交」
- 只要涉及建立新的 git commit，即使沒有明確使用以上字眼，也應觸發

## 執行流程（7 步驟）

```
Step 1: git add -A           ← 一定要在分析之前
Step 2: analyze.js           ← 蒐集資訊
Step 3: 分組任務              ← 判斷是否拆分
Step 4: branch-guard.js      ← Git Flow 分支檢查
Step 5: 決定 type/scope
Step 6: 撰寫符合規範的訊息
Step 7: 逐組 reset → add → commit.js
```

### Step 1 — 全量 stage

```bash
git add -A
```

**為何一定要先 stage？** 未追蹤檔案（untracked files）不會出現在 `git diff` 中，只有 `git diff --cached` 才能看到它們。若跳過此步驟直接分析，會遺漏新增的檔案，造成拆分不完整。

### Step 2 — 蒐集資訊

執行 skill 內附的 analyze 腳本：

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/commit/scripts/analyze.js
```

腳本輸出：當前分支、`git status --short`、`git diff --cached --stat`、staged 完整 diff、最近 10 個 commit、所有分支清單。

> 若環境沒有 `CLAUDE_PLUGIN_ROOT`，改以絕對路徑或相對路徑呼叫腳本即可。

### Step 3 — 判斷是否需要拆分

依 diff 內容分組，先在心中或給使用者的訊息裡列出計畫（不需要徵求同意，使用者已授權自動拆分）。

**應該拆分**：
- 不同 type（例如同時有新功能 `feat:` 和文件 `docs:`）
- 不同 scope 且無邏輯依賴（例如同時改 `auth` 與 `billing` 模組）
- 跨越無關模組
- 修 bug 順手改格式（`fix:` + `style:`）

**應該合併**：
- 單一 feature 橫跨多個檔案
- Rename 造成的連動修改
- 修 bug 同時新增對應的 test（同一個修正的兩面）
- 純資料/文件的批次更新

### Step 4 — Git Flow 分支檢查

**先判斷變更意圖**：
- 若拆分後所有任務的 type 都是 `fix:` → 意圖 = `hotfix`
- 其他情況 → 意圖 = `feature`

**分支名稱**由你根據所有變更的「主要主題」歸納，優先繁體中文短語（≤ 20 字元）或英文 kebab-case。避免特殊字元（空白、`:`、`?`、`*`、`~`、`^`），含空白改用 `-` 連接。

範例：`使用者登入`、`api-refactor`、`修正登入崩潰`、`null-pointer`

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/commit/scripts/branch-guard.js feature 使用者登入
# 或
node ${CLAUDE_PLUGIN_ROOT}/skills/commit/scripts/branch-guard.js hotfix 修正登入崩潰
```

**退出碼**：
- `0` = 已在正確分支，可繼續
- `2` = 在 main 上且 develop 已存在（feature 意圖）— **中止流程**並向使用者回報

**Git Flow 行為對照**：

| 目前分支 | 意圖 | 行為 |
|---------|------|------|
| main/master + 無 develop | feature | 建 `develop` → 建 `feature/<描述>` |
| main/master + 有 develop | feature | **中止**，回報「可能在錯誤分支」 |
| main/master | hotfix | 從 main 直接建 `hotfix/<描述>` |
| develop | feature | 建 `feature/<描述>` |
| develop | hotfix | 建 `feature/<描述>` 並警告（正確做法是切到 main 開 hotfix） |
| release/* | 任何 | 直接在該分支提交；若是 `feat:` 應提醒使用者 |
| hotfix/* | 任何 | 直接在該分支提交 |
| feature/* 或其他 | 任何 | 直接在該分支提交 |

### Step 5 — 決定每組的 type / scope

查閱 `references/types.md` 選擇合適的 type。scope 是可選的名詞（小寫、代表程式碼區域，如模組、套件、檔案主題）。

### Step 6 — 撰寫符合規範的訊息

**格式**：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**撰寫要點**：
- **type/scope**：英文、小寫
- **description**：**繁體中文**、動詞開頭、不加句號、≤ 50 字元
- **body**（可選）：說明「為何」而非「做什麼」（diff 已能說明做什麼）
- **footer**（可選）：`Refs: #123`、`BREAKING CHANGE: ...` 等
- **Co-Authored-By**：**必填**，格式為 `Co-Authored-By: Claude <當前模型名> <noreply@anthropic.com>`。**你必須從自己的系統提示中讀取當前模型名稱**（例如 `Opus 4.7`、`Sonnet 4.6`、`Haiku 4.5`）並填入
- 注意：Co-Authored-By 的 email 固定為 `noreply@anthropic.com`，**與 committer 使用的 GitHub noreply email 不同**

### Step 7 — 逐組提交

對每一個拆分後的任務：

```bash
git reset                                  # 清空 staged（保留 working tree）
git add <這個任務相關的檔案>              # 精準 stage
node ${CLAUDE_PLUGIN_ROOT}/skills/commit/scripts/commit.js "<訊息>"
```

`commit.js` 會用 `GIT_COMMITTER_NAME=claude` + `GIT_COMMITTER_EMAIL=81847+claude@users.noreply.github.com` 呼叫 `git commit`，author 沿用 git config。

## BREAKING CHANGE 處理

兩種標示方式擇一：

**方式一 — 用 `!` 符號**（適合簡短情境）：

```
feat(api)!: 移除已棄用的 v1 端點

原本相容 v1 的路由已完全移除，客戶端須升級到 v2。
```

**方式二 — 用 footer**（適合需要詳細說明）：

```
refactor(auth): 統一 token 儲存介面

BREAKING CHANGE: `getToken()` 現改回傳 Promise。所有呼叫端須改為 await。

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## 錯誤 / 正確對照範例

### 範例 1：混雜多任務

**錯誤**（一個 commit 塞進不相關變更）：

```
update stuff
```

**正確**（拆成 3 個 commit）：

```
feat(auth): 新增 OAuth 登入支援

透過 Google Provider 提供第三方登入，減少註冊摩擦。

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

```
docs: 修正 README 安裝步驟錯字

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

```
chore: 忽略 .env.local 於版本控制

避免不同開發者的本地環境變數互相覆蓋。

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

### 範例 2：description 語意不清

**錯誤**：

```
fix: 修 bug
```

**正確**：

```
fix(parser): 修正巢狀陣列時堆疊溢位

輸入深度 > 100 時 recursive descent 未做尾遞迴優化，改用迭代版本。

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

### 範例 3：Committer 資訊錯放

**錯誤**（把 committer 塞進 author）：

```bash
git -c user.name=claude -c user.email=... commit -m "..."
```

**正確**（使用 `commit.js` 讓 author 與 committer 分離）：

```bash
node scripts/commit.js "feat(...): ...

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

這樣 `git log` 會看到：
- Author = 你自己（沿用 git config）
- Committer = `claude <81847+claude@users.noreply.github.com>`
- Trailer = 帶當前模型名的 Co-Authored-By

## 常見問題

**Q: 為什麼要先 `git add -A`？**
A: 未追蹤檔案不會出現在 `git diff` 中；先 stage 才能一次看到所有變更並正確分組。

**Q: 為什麼 Committer 是 claude 但 Author 是我？**
A: Author 代表「誰寫的」（你的想法/決策），Committer 代表「誰執行了 commit」（AI 協作）。這種分離讓 git 歷史清楚呈現人機協作關係，同時保留你的原創貢獻歸屬。

**Q: 為什麼 Committer email 用 GitHub noreply 格式？**
A: `81847+claude@users.noreply.github.com` 是 GitHub 為 @claude 帳號（id 81847）的官方 noreply 格式，能自動把 commit 連結到該 GitHub profile，同時保護實際 email 隱私。

**Q: `main` 上做小修改為什麼要開分支？**
A: Git Flow 規範 main/master 保護不可直接提交，透過 feature/hotfix 分支確保所有變更都能被 review 與追蹤。
