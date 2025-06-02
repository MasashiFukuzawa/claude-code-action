# フェーズ0: フォーク対応 - 詳細設計

## 概要

このフェーズでは、フォークしたリポジトリでオーケストレーション機能を開発するための基本的な参照更新を行います。

**📌 参考実装**: RooCode（RooCline）のオーケストレーション実装を参考にしてください：
- GitHub: https://github.com/RooCodeInc/Roo-Code
- UIthub: https://uithub.com/RooCodeInc/Roo-Code
- DeepWiki: https://deepwiki.com/RooCodeInc/Roo-Code

**💡 重要な点**: RooCodeの実装パターンを参考にしつつ、Claude Code Actionの環境に適応させることが重要です。

## 実装タスク

### タスク0.1: アクション参照の更新

#### 対象ファイル

1. **README.md**
   - アクション使用例の更新
   - インストール手順の更新

2. **examples/*.yml**
   - claude.yml
   - claude-auto-review.yml
   - claude-pr-path-specific.yml
   - claude-review-from-author.yml

#### 変更内容

```yaml
# 変更前
uses: anthropics/claude-code-action@beta

# 変更後
uses: MasashiFukuzawa/claude-code-action@orchestrator-alpha
```

## TDD実装計画

### テストケース設計

```typescript
// test/fork-update.test.ts
import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Fork Update Validation', () => {
  const rootDir = join(__dirname, '..');

  test('README.md should reference forked action', () => {
    const readme = readFileSync(join(rootDir, 'README.md'), 'utf-8');
    expect(readme).not.toContain('anthropics/claude-code-action@beta');
    expect(readme).toContain('MasashiFukuzawa/claude-code-action@orchestrator-alpha');
  });

  test('all example files should reference forked action', () => {
    const exampleFiles = [
      'claude.yml',
      'claude-auto-review.yml',
      'claude-pr-path-specific.yml',
      'claude-review-from-author.yml'
    ];

    exampleFiles.forEach(file => {
      const content = readFileSync(join(rootDir, 'examples', file), 'utf-8');
      expect(content).not.toContain('anthropics/claude-code-action@beta');
      expect(content).toContain('MasashiFukuzawa/claude-code-action@orchestrator-alpha');
    });
  });

  test('should maintain YAML structure integrity', () => {
    const exampleFiles = [
      'claude.yml',
      'claude-auto-review.yml',
      'claude-pr-path-specific.yml',
      'claude-review-from-author.yml'
    ];

    exampleFiles.forEach(file => {
      const content = readFileSync(join(rootDir, 'examples', file), 'utf-8');
      // YAMLの基本構造が保たれていることを確認
      expect(content).toMatch(/^name:/m);
      expect(content).toMatch(/^\s+uses:/m);
      expect(content).toMatch(/^\s+with:/m);
    });
  });
});
```

### 実装スクリプト

```typescript
// scripts/update-fork-references.ts
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

const OLD_REFERENCE = 'anthropics/claude-code-action@beta';
const NEW_REFERENCE = 'MasashiFukuzawa/claude-code-action@orchestrator-alpha';

function updateFile(filePath: string): boolean {
  const content = readFileSync(filePath, 'utf-8');
  if (content.includes(OLD_REFERENCE)) {
    const updatedContent = content.replace(
      new RegExp(OLD_REFERENCE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      NEW_REFERENCE
    );
    writeFileSync(filePath, updatedContent);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  const files = [
    'README.md',
    ...await glob('examples/*.yml')
  ];

  let updatedCount = 0;
  for (const file of files) {
    if (updateFile(file)) {
      updatedCount++;
    }
  }

  console.log(`\n✨ Updated ${updatedCount} files`);
}

main().catch(console.error);
```

## コミット計画

### コミット1: テストの追加
```bash
# プリコミットチェック
bun test
bun run format:check
bun run typecheck

# 全てのチェックが通った場合のみコミット
git add test/fork-update.test.ts
git commit -m "test: add tests for fork reference updates"
```

### コミット2: 更新スクリプトとREADME更新
```bash
# プリコミットチェック
bun test
bun run format:check
bun run typecheck

# 全てのチェックが通った場合のみコミット
git add scripts/update-fork-references.ts README.md
git commit -m "feat: update README action references for orchestrator fork"
```

### コミット3: サンプルファイルの更新
```bash
# プリコミットチェック
bun test
bun run format:check
bun run typecheck

# 全てのチェックが通った場合のみコミット
git add examples/*.yml
git commit -m "feat: update example workflows for orchestrator fork"
```

## 実行手順

### 実行フロー
```bash
# 1. feature/orchestrator-alpha から作業ブランチを作成
git checkout feature/orchestrator-alpha
git pull origin feature/orchestrator-alpha # 念のため最新化
git checkout -b phase0-fork-update feature/orchestrator-alpha

# 2. AI実装（Claude Code、Cursor等）
# TDDに従ってテストファーストで実装 (プロジェクトルートで行う)

# 3. プリコミットチェック
bun test && bun run format:check && bun run typecheck

# 4. コミット
git add .
git commit -m "feat: update action references for fork"

# 5. プッシュしてPR作成
git push origin phase0-fork-update

# 6. GitHubでPR作成・レビュー・マージ
#    PRのターゲットブランチは feature/orchestrator-alpha とする

# 7. クリーンアップ (PRマージ後)
git checkout feature/orchestrator-alpha
git pull origin feature/orchestrator-alpha # リモートの変更を取り込み最新化
git branch -d phase0-fork-update # ローカルの作業ブランチを削除
# git push origin --delete phase0-fork-update # (任意) リモートの作業ブランチも削除する場合
```

### 詳細ステップ（TDD）
```bash
# 1. feature/orchestrator-alpha から作業ブランチ作成
git checkout feature/orchestrator-alpha
git pull origin feature/orchestrator-alpha # 念のため最新化
git checkout -b phase0-fork-update feature/orchestrator-alpha

# プロジェクトルートで作業を進める

# 2. テストファイル作成
mkdir -p test
# test/fork-update.test.ts を作成 (内容はドキュメントの「テストケース設計」を参照)

# 3. テスト実行（失敗確認）
bun test test/fork-update.test.ts

# 4. 更新スクリプト作成
mkdir -p scripts
# scripts/update-fork-references.ts を作成 (内容はドキュメントの「実装スクリプト」を参照)

# 5. スクリプト実行
bun run scripts/update-fork-references.ts

# 6. テスト再実行（成功確認）
bun test test/fork-update.test.ts

# 7. 全体チェック
bun test && bun run format:check && bun run typecheck

# 8. コミット
git add .
git commit -m "feat: update action references for fork"

# 9. 統合 (PR経由でのマージ)
#    上記「実行フロー」のステップ5以降に従ってPRを作成し、マージする
git push origin phase0-fork-update
# GitHub上で feature/orchestrator-alpha をターゲットブランチとしてPRを作成・レビュー・マージ
# マージ後、ローカルブランチをクリーンアップ
git checkout feature/orchestrator-alpha
git pull origin feature/orchestrator-alpha
git branch -d phase0-fork-update
```

## 検証項目

1. **参照の完全性**
   - すべての `anthropics/claude-code-action@beta` が置換されている
   - 新しい参照が正しい形式である

2. **ファイルの整合性**
   - YAMLファイルの構文が正しい
   - Markdownのフォーマットが保たれている

3. **機能の維持**
   - 既存の機能に影響がない
   - ドキュメントの読みやすさが維持されている

## リスクと対策

### リスク1: 不完全な置換
- **対策**: grepで確認
  ```bash
  grep -r "anthropics/claude-code-action" .
  ```

### リスク2: YAMLの破損
- **対策**: YAML linterの使用
  ```bash
  # yamllintがインストールされている場合
  yamllint examples/*.yml
  ```

## 完了基準

- [ ] すべてのテストが通る
- [ ] フォーマットチェックが通る
- [ ] 旧参照が残っていない
- [ ] PRがorchestrator-alphaブランチにマージされる

## 次のステップ

フェーズ0完了後、以下のフェーズを並列で開始可能：
- フェーズ1.1: モードシステム（型定義）
- フェーズ1.2: タスクシステム（型定義）
