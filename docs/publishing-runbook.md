# Publishing Runbook

Daily source runs are not done when the JSON changes locally. They are done when the newest story is visible on production.

## Required Finish

1. Write or update the stories and source items in `data/`.
2. Run `npm run publish:check` from the repo root.
3. Commit the coherent publish state, including generated files.
4. Push `main` to the production remote.
5. Wait for Render to finish deploying.
6. Run `npm run verify:live`.

Only call the issue live after `npm run verify:live` passes.

## What The Live Check Proves

`npm run verify:live` reads the highest-priority story in `data/stories.json`, then checks production for two things:

- the homepage contains that story slug
- the story URL returns 200 and contains the expected title

If the homepage is still on an older prerendered build, the command fails with the expected slug and the site it checked.

## Common Failure

If local content is current but production still shows an older issue, the fix is usually not code. It means the content was not pushed, Render has not deployed yet, or the deployment failed. Check GitHub for the latest commit on `main`, then check Render's deploy log.
