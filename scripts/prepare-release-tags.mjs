import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const { versions } = JSON.parse(readFileSync(new URL('../planning/published-versions.json', import.meta.url), 'utf8'));
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// Validate every target before creating tags. Existing tags are never moved.
for (const entry of versions) {
  if (!/^v[0-9]+(?:\.[0-9]+\.[0-9]+-build[0-9]+)?$/.test(entry.tag) || !/^[a-f0-9]{40}$/.test(entry.commitSha)) {
    throw new Error('Invalid release reference in published-versions.json');
  }
  git(['cat-file', '-e', `${entry.commitSha}^{commit}`]);
  const existing = spawnSync('git', ['show-ref', '--verify', '--quiet', `refs/tags/${entry.tag}`], { cwd: root });
  if (existing.status !== 0 && existing.status !== 1) throw new Error(`Cannot inspect ${entry.tag}`);
  if (existing.status === 0 && git(['rev-parse', `${entry.tag}^{commit}`]) !== entry.commitSha) {
    throw new Error(`Tag ${entry.tag} already points elsewhere; stopped without changing tags.`);
  }
}
for (const entry of versions) {
  const existing = spawnSync('git', ['show-ref', '--verify', '--quiet', `refs/tags/${entry.tag}`], { cwd: root });
  if (existing.status === 1) git(['tag', entry.tag, entry.commitSha]);
}
console.log(`Verified ${versions.length} release tags. No network or publication performed.`);
