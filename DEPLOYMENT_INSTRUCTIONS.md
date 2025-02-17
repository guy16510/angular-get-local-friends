# Deployment Instructions

To resolve the current build failure, please follow these steps:

1. The build is failing because the `package-lock.json` file is out of sync with `package.json`. Two dependencies are missing from the lock file:
   - json-schema-to-ts@3.1.1
   - ts-algebra@2.0.0

2. To resolve this, run the following commands locally:
   ```bash
   npm install
   git add package-lock.json
   git commit -m "chore: update package-lock.json with missing dependencies"
   git push
   ```

3. This will regenerate the package-lock.json file with the correct dependencies and their respective versions.

4. Once pushed, the CI build should succeed as both package.json and package-lock.json will be in sync.

Note: Always ensure to commit both package.json and package-lock.json files together when making dependency changes to maintain consistency between the two files.