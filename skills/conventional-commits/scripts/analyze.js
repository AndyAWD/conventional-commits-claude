#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const run = (args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' });
  } catch (e) {
    return e.stdout || `(git ${args.join(' ')} failed: ${e.message})`;
  }
};

const section = (title, out) => {
  console.log(`=== ${title} ===`);
  console.log(out.trimEnd() || '(empty)');
  console.log('');
};

section('current branch', run(['symbolic-ref', '--short', 'HEAD']));
section('git status', run(['status', '--short']));
section('staged diff (--stat)', run(['diff', '--cached', '--stat']));
section('staged full diff', run(['diff', '--cached']));
section('recent commits (last 10)', run(['log', '--oneline', '-10']));
section('branches', run(['branch', '--list']));
