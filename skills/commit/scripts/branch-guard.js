#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const [, , kind, name] = process.argv;
if (!kind || !name || !['feature', 'hotfix'].includes(kind)) {
  console.error('usage: branch-guard.js <feature|hotfix> <branch-name>');
  process.exit(1);
}

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const gitLoud = (args) => execFileSync('git', args, { stdio: 'inherit' });
const branchExists = (b) => {
  try {
    execFileSync('git', ['show-ref', '--verify', '--quiet', `refs/heads/${b}`]);
    return true;
  } catch {
    return false;
  }
};

const cur = git(['symbolic-ref', '--short', 'HEAD']);

const create = (b) => {
  console.log(`建立分支 ${b}...`);
  gitLoud(['checkout', '-b', b]);
};

if (cur === 'main' || cur === 'master') {
  if (kind === 'hotfix') {
    console.log(`在 ${cur} 上偵測到 hotfix — 從 ${cur} 建立 hotfix/${name}`);
    create(`hotfix/${name}`);
  } else {
    if (branchExists('develop')) {
      console.error(`ERROR: 目前在 ${cur}，但 develop 分支已存在。`);
      console.error('可能在錯誤分支 — 請先手動切到 develop 或適當分支後重試。');
      process.exit(2);
    }
    create('develop');
    create(`feature/${name}`);
  }
} else if (cur === 'develop') {
  if (kind === 'hotfix') {
    console.warn(
      'WARN: 偵測到 hotfix 意圖，但目前在 develop。若需上線緊急修正，建議手動切到 main 後重試。此次以 feature 分支處理。'
    );
  }
  create(`feature/${name}`);
} else if (cur.startsWith('release/') || cur.startsWith('hotfix/')) {
  console.log(`已在 ${cur}，Git Flow 允許直接提交。`);
} else {
  console.log(`已在分支 ${cur}，直接使用該分支提交。`);
}
