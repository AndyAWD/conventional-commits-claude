#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const msg = process.argv[2];
if (!msg) {
  console.error('usage: commit.js "<full commit message>"');
  process.exit(1);
}

execFileSync('git', ['commit', '-m', msg], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GIT_COMMITTER_NAME: 'claude',
    GIT_COMMITTER_EMAIL: '81847+claude@users.noreply.github.com',
  },
});
