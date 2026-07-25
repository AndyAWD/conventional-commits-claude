# 慣例式提交（Conventional Commits）v1.0.0 規範摘要

原文：<https://www.conventionalcommits.org/zh-hant/v1.0.0/>

## 訊息結構

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Type

| type       | 用途說明                           | 對應 SemVer |
|------------|-----------------------------------|-------------|
| `feat`     | 對程式增加了一個功能               | MINOR       |
| `fix`      | 對程式修正了一個 bug               | PATCH       |
| `docs`     | 文件變更                           | -           |
| `style`    | 不影響行為的格式變更（空白、縮排） | -           |
| `refactor` | 既不修 bug 也不新增 feature 的重構 | -           |
| `perf`     | 效能改善                           | -           |
| `test`     | 新增或修改測試                     | -           |
| `build`    | 影響建置系統或外部相依             | -           |
| `ci`       | CI 設定檔或腳本變更                | -           |
| `chore`    | 其他不修改 src 或 test 的雜項      | -           |

規範原文：「除了 `fix:` 與 `feat:` 之外也允許其他的類型」— 上表為社群常用擴充。

## Scope

- **可選**
- 由括號包覆的**名詞**組成，描述程式碼區段
- 範例：`fix(parser):`、`feat(lang):`

## Description

- **必填**
- 簡短描述變更內容
- 建議：動詞開頭、不加句號、≤ 50 字元

## Body

- **可選**
- 於 description 空一行後開始
- 說明「為何」而非「做什麼」
- 可分多段

## Footer

- **可選**
- 於 body 空一行後開始
- 每個 footer 包含一個 token，接著以 `: <space>` 或 ` #` 分隔
- Token 使用 `-` 作為空白字元（如 `Acked-by`），**唯一例外是 `BREAKING CHANGE`**
- 範例：`Reviewed-by: Z`、`Refs: #123`、`Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`

## BREAKING CHANGE

**方式一：`!` 符號**

在 type 或 scope 後、`:` 之前加上 `!`：

```
feat!: 送出商品運送 email 通知客戶
feat(api)!: 送出商品運送 email 通知客戶
```

**方式二：footer**

於 footer 用 `BREAKING CHANGE:` 開頭：

```
feat: 允許透過 config 檔提供 provider

BREAKING CHANGE: config 檔中的 `extends` key 現用於延伸而非覆寫。
```

備註：`BREAKING-CHANGE`（含連字號）與 `BREAKING CHANGE` 於 footer 中視為等價。

## 與 SemVer 的對應關係

- `fix` → **PATCH**（例：1.0.0 → 1.0.1）
- `feat` → **MINOR**（例：1.0.0 → 1.1.0）
- 任何含 `BREAKING CHANGE` 的 commit → **MAJOR**（例：1.0.0 → 2.0.0）

## 大小寫規則

- 除了 `BREAKING CHANGE` 必須大寫外，其他單元不區分大小寫
- 建議一致使用小寫 type/scope
