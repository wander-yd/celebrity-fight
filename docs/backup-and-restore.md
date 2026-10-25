# GitHub backup and restore

## Status

Repository: private `wander-yd/celebrity-fight`. Sites remains the live publishing source. Build48 is published as0.4.0.

The GitHub connector mirrors source files into a backup commit; this creates a different Git commit SHA from the exact Sites source SHA. For Build48, GitHub `main` and `release/v0.4.0-build48` contain the same source tree. The published source SHA, Site saved-version ID and deployment ID are recorded in `planning/published-versions.json`. The original Git bundle in GitHub retains the historical commit/tag graph through Build46. Builds47–48 are backed up as source-tree snapshots, not copied Git history or native remote Git tags. The local Sites source history contains the exact `v0.4.0-build48` tag.

The original Git bundle `backups/celebrity-fight-build46.bundle` retains the exact source history/tags through Build46. Keep GitHub's connector-created snapshot commits separate from the exact Sites source history. The connector does not create remote Git tag refs. Build48 has a `release/v0.4.0-build48` GitHub checkpoint branch with the matching source tree; the local Site source tag points to the exact published source commit. For an exact live rollback, use the saved Site version ID; a GitHub source snapshot alone does not redeploy the Site.

## Current workflow

The private repository already exists. Sites publishes the game; GitHub is a one-way source backup. For each update:

1. Implement within approved scope and run the full regression suite.
2. Publish through the existing Sites workflow; record the exact Site source SHA, saved version ID and deployment ID.
3. Create and verify the local release tag at the exact Site source SHA.
4. Mirror changed source files to GitHub `main` with an expected-head check. Create a `release/<version>` checkpoint branch at that GitHub snapshot commit.
5. Verify the public/private setting, remote commit and branch tree. Record both the Sites source SHA and GitHub snapshot SHA because they identify different commits with the same source tree.

Tags for original builds use v1–v32. New-style local source tags use names such as `v0.4.0-build48` and point to the exact published source SHA. A GitHub checkpoint branch points to the matching source tree but has a GitHub-created commit SHA.

## Each future game update

1. Implement within the approved scope and run appropriate checks.
2. Update the release history; publish through the existing Sites workflow.
3. After successful publication, record the returned Build, saved version ID and exact source SHA in the release mapping.
4. Create the matching local version tag only if absent. If it exists, verify the target; never move it to a different commit.
5. Mirror the new source tree into GitHub `main` with a concurrency check. Add a `release/<version>` checkpoint branch at the backup commit and verify both refs before reporting success.

No CI, Vercel deployment or background synchronization is configured. If backup fails, report the game publication and backup results separately. Do not overwrite divergent GitHub work; investigate it. Keep Sites as the source of edits until a different workflow is explicitly approved.

## Restore or inspect

Use the matching Site saved version ID to recover an exact published build. Use a GitHub `release/<version>` checkpoint branch to inspect its source snapshot; use the Build46 bundle only when the original historical commit graph is needed.

For a live rollback, identify the exact Sites saved version ID from `planning/published-versions.json` or current Sites version discovery, then deploy that saved version through Sites after the user requests rollback. Checking out a Git tag does not change the live site. Do not reset or force-push main to perform a rollback.

## Scope and contents

Back up tracked source, assets, tests, planning and documentation with complete reachable Git history. Do not include credentials, temporary files, generated deployment archives or executor configuration. Current release tags were matched to native Sites records. Older builds retain their historical behavior and may lack subsequent fixes.
