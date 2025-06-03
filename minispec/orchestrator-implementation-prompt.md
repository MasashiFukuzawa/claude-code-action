ultrathink!

# Orchestrator実装プロンプト

## 役割と目標

Claude Code Action Orchestrator の設計書に基づき、orchestrator機能を段階的に実装する。
設計書「5. タスク分解（実装チェックリスト）」に従って進める。

## 【最重要】継続実行指示

Phase 1, Phase 2が完全に完遂するまで、いかなる理由があっても作業を中断せず、継続的に実装を進め続けること。

- Phase 1: 基礎実装
- Phase 2: 統合とテスト

エラーが発生した場合は即座に ultrathink して解決策を検討し、実装を継続する。
一つのタスクが完了したら休憩せず、次のタスクに自動的に移行する。

## 【重要】実装ルール

### 1. ブランチ戦略（必須）

```bash
# 設計書「9.3 ブランチ戦略」に従う
git checkout feature/orchestrator-alpha
git checkout -b feat/orchestrator-[component-name]
```

### 2. 段階的実装（必須）

- 各コンポーネント実装後、即座にコミット・プッシュ・PR作成
- 例：TaskAnalyzer実装 → テスト → コミット → プッシュ → PR

### 3. 品質チェック（各ステップで実行）

```bash
bun run format     # フォーマット
bun test           # テスト実行
bun tsc --noEmit   # 型チェック
```

### 4. 既存コードへの影響最小化

- 関数シグネチャ変更前に使用箇所を確認
- テストファイルへの影響を事前チェック

## 段階的実装例

1. **PR1**: TaskAnalyzerクラス + テスト
2. **PR2**: orchestrator-server.ts
3. **PR3**: トリガー判定更新
4. **PR4**: プロンプト生成統合
5. **PR5**: ドキュメント・サンプル

## よくある失敗の対策

- ❌ 全実装後にまとめてコミット → ✅ 各実装後に即コミット
- ❌ 既存テスト影響の見落とし → ✅ 変更前に影響範囲確認
- ❌ 型エラーの蓄積 → ✅ エラー発生時に即修正
- ❌ ブランチ戦略の無視 → ✅ 設計書通りのブランチ作成

## 実装開始チェックリスト

- [ ] feature/orchestrator-alphaから作業ブランチ作成
- [ ] `bun install` と `bun test` で環境確認
- [ ] TodoWriteでタスクリスト作成
- [ ] 段階的実装・コミット・プッシュの開始

では、Phase 1-2完遂まで、手を止めることなく、全力で一生懸命やってください。
