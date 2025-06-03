ultrathink!

# Orchestrator実装プロンプト（改良版）

## 役割と目標

Claude Code Action Orchestrator の設計書に基づき、orchestrator機能を**マイクロタスク単位**で段階的に実装する。
設計書「5. マイクロタスク分解（実装チェックリスト）」に従って進める。

## 【最重要】5-15分ルールによる継続実行

**前回の失敗要因を踏まえた改善アプローチ**：

### 🚫 前回の失敗パターン

- タスク分解が粗すぎた（TaskAnalyzer全体で実装）
- 品質チェックが最後（全実装後にテスト）
- TDDを無視（実装→テストの順序）
- ブランチ戦略を軽視（一つのブランチで全実装）

### ✅ 今回の必須アプローチ

#### 1. マイクロタスク分解（5-15分ルール）

```
❌ TaskAnalyzer実装（60分）
✅ クラス定義のみ（5分） → 日本語検出（10分） → パターン定義（10分）...
```

#### 2. 即座の品質ガード

```bash
# 各5-15分の実装後に必ず実行
bun run format && bun tsc --noEmit && bun test [specific]

# エラーがあれば即修正、Green状態でコミット
git add . && git commit -m "feat: specific micro change" && git push
```

#### 3. テストファースト（TDD厳守）

```
Red → Green → Refactor のサイクルを5-15分で回す

例：
1. テスト書く（5分） → Red確認
2. 最小実装（10分） → Green確認
3. リファクタ（5分） → Green維持
4. コミット・プッシュ
```

#### 4. 厳格なブランチ戦略

```bash
# コンポーネントごとに必ずブランチ分離
git checkout -b feat/orchestrator-types        # 型定義のみ
git checkout -b feat/orchestrator-analyzer-core # TaskAnalyzer基本構造のみ
git checkout -b feat/orchestrator-jp-detection  # 日本語検出のみ
```

## 【必須】実装フロー

### Step 1: マイクロタスク分解 (5分)

設計書のマイクロタスクを確認し、TodoWriteで15分以内のタスクを作成

### Step 2: テストファースト実装

```bash
# 1. テスト作成（Red状態）
# 2. 最小実装（Green状態）
# 3. 品質チェック
bun run format && bun tsc --noEmit && bun test [specific]
# 4. コミット・プッシュ
git add . && git commit -m "feat: [specific micro change]" && git push
```

### Step 3: PR作成タイミング

- 各主要コンポーネント完了時（TaskAnalyzer完了、MCP Server完了など）
- 5-10個のマイクロタスクで1つのPR

## 実装時の必須チェックポイント

### ❌ 絶対にやってはいけないこと

- 15分を超えるタスクを一度に実装
- テストを後回しにする
- 複数コンポーネントを同じブランチで実装
- エラーがある状態でコミット
- 品質チェックをスキップ

### ✅ 必ず実行すること

- 各実装は5-15分で完了
- Red → Green → Refactor のTDDサイクル
- 毎回の品質チェック（format, typecheck, test）
- Green状態でのみコミット・プッシュ
- 一つのマイクロタスク＝一つのコミット

## マイクロタスク実行テンプレート

```
タスク: [具体的な5-15分のタスク]
制限時間: 15分

1. 【テスト作成】(5分以内)
   - 期待される動作をテストで表現
   - Red状態を確認

2. 【最小実装】(10分以内)
   - テストが通る最小の実装
   - Green状態を確認

3. 【品質チェック】(2分以内)
   bun run format && bun tsc --noEmit && bun test [specific]

4. 【コミット】(1分以内)
   git add . && git commit -m "feat: [具体的な変更]" && git push

5. 【次タスク開始】
   休憩なしで次のマイクロタスクへ
```

## 実装開始前チェックリスト

- [ ] 設計書のマイクロタスクリスト確認
- [ ] `bun install` と `bun test` で環境確認
- [ ] TodoWriteで5-15分のタスクリスト作成
- [ ] TDDサイクルの準備確認
- [ ] ブランチ戦略の理解確認

## 継続実行の心構え

**Phase 1, Phase 2完遂まで、5-15分のマイクロタスクを積み重ね続ける。**

- 一つのマイクロタスク完了→即座に次へ
- エラー発生→ultrathinkで即修正→継続
- Green状態維持→安全な進歩を確保
- 小さく確実に→確実な積み上げ

前回の失敗を教訓に、今度は確実に完遂してください。
