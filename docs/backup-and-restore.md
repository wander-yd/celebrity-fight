# GitHub backup and restore

## Status

Repository: private `wander-yd/celebrity-fight`. Game publication remains on Sites at 0.3.3 / Build43.

The connector sync uploads the current tracked source and a full Git bundle at `backups/celebrity-fight-build43.bundle`. The bundle retains exact original commits and all release tags through Build43. GitHub main keeps its pre-existing history and gains a source-backup commit; newer original commits/tags are inside the bundle, not native GitHub refs. This is a complete restorable history backup, not an ordinary Git push. Remote verification is recorded separately in `backups/manifest.json`.

Restore the exact history after cloning/downloading the bundle:

```sh
git clone backups/celebrity-fight-build43.bundle ../celebrity-fight-restored
cd ../celebrity-fight-restored
git tag --list
node tests/run.cjs
```

Keep GitHub native branch history separate from the restored Sites history until an authenticated Git migration is chosen. Do not force-push either history.

## Initial setup

1. Create an empty private repository under the intended account. Do not initialize it with a README, license or ignore file; the existing project already has history.
2. Use an authenticated Git environment with access to that repository. Keep credentials in the platform's credential mechanism, never in source, remote URLs or chat.
3. Keep the Sites source remote/workflow unchanged. Configure a separate `github-backup` remote, checking any existing value first:

   ```sh
   git remote get-url github-backup
   git remote add github-backup https://github.com/wander-yd/celebrity-fight.git
   ```

   Run the add command only if that remote is absent. An unexpected existing URL requires inspection, not replacement.

4. From the clean, verified checkout, push the source history and prepared release tags without force:

   ```sh
   node scripts/prepare-release-tags.mjs
   git push --atomic github-backup main --tags
   git ls-remote github-backup refs/heads/main 'refs/tags/*'
   ```

5. Compare the remote main SHA to local main. Compare every release tag to `planning/published-versions.json`, and independently confirm the repository is private. Only then record backup status as synced.

Tags for original builds use v1–v32. New-style tags use names such as `v0.1.3-build35`. Each tag must point to the exact published source SHA; later documentation commits on main must not move an existing release tag.

## Each future game update

1. Implement within the approved scope and run appropriate checks.
2. Update the release history; publish through the existing Sites workflow.
3. After successful publication, record the returned Build, saved version ID and exact source SHA in the release mapping. This bookkeeping can be a following documentation commit; the release tag always targets the published SHA.
4. Create the matching version tag only if absent. If it exists, verify the target; never move it to a different commit.
5. Push main and tags to `github-backup` without force. Verify remote refs before reporting success.

No CI, Vercel deployment or background synchronization is configured. If backup fails, report the game publication and backup results separately. Do not overwrite divergent GitHub work; investigate it. Keep Sites as the source of edits until a different workflow is explicitly approved.

## Restore or inspect

To inspect an old version without overwriting current work:

```sh
git fetch github-backup --tags
git worktree add --detach ../donald-build35 v0.1.3-build35
```

Run checks from that checkout. Historical parity tests require the retained Git history, so a source ZIP alone is insufficient.

For a live rollback, identify the exact Sites saved version ID from `planning/published-versions.json` or current Sites version discovery, then deploy that saved version through Sites after the user requests rollback. Checking out a Git tag does not change the live site. Do not reset or force-push main to perform a rollback.

## Scope and contents

Back up tracked source, assets, tests, planning and documentation with complete reachable Git history. Do not include credentials, temporary files, generated deployment archives or executor configuration. Current release tags were matched to native Sites records. Older builds retain their historical behavior and may lack subsequent fixes.
