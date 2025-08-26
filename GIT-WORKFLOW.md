# Git Workflow for Flight BPMN Editor

This document outlines the recommended Git workflow for managing the Flight BPMN Process Editor project.

## Basic Git Commands

### Initial Setup

If you're new to the project:

```bash
# Clone the repository
git clone https://github.com/sDutkiewicz/flight.git
cd flight

# Set up your Git identity
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Daily Workflow

```bash
# Get the latest changes from the remote repository
git pull origin main

# Create a new branch for your feature or bugfix
git checkout -b feature/my-new-feature

# Make your changes...

# Add files to staging
git add .

# Commit your changes
git commit -m "Add feature X that does Y"

# Push your branch to the remote repository
git push origin feature/my-new-feature

# Then create a Pull Request on GitHub
```

## Branch Naming Conventions

- `feature/` - For new features
- `bugfix/` - For bug fixes
- `hotfix/` - For critical fixes in production
- `release/` - For release preparation
- `docs/` - For documentation updates

Example: `feature/system-tagging-improvements`

## Commit Message Guidelines

Follow this format for commit messages:

```
[type]: Short summary (50 chars or less)

More detailed explanation if necessary. Wrap at around 72 characters.
Explain what the change is and why it's needed.

Issue: #123
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc; no code change
- `refactor`: Refactoring code
- `test`: Adding tests, refactoring tests; no production code change
- `chore`: Updating build tasks, package manager configs, etc; no production code change

Example:
```
feat: Add system color filtering to BPMN tasks

Added a system color filtering mechanism that allows users to visually 
identify tasks by their associated system through color coding.

Issue: #42
```

## Pull Request Process

1. Update your branch with the latest changes from main
   ```bash
   git checkout main
   git pull
   git checkout your-branch-name
   git merge main
   ```

2. Resolve any conflicts

3. Push your changes
   ```bash
   git push origin your-branch-name
   ```

4. Create a Pull Request on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference to any related issues
   - Screenshots if UI changes were made

5. Request review from team members

6. Address feedback if requested

7. Once approved, merge your PR into main

## Versioning

We use semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR: Incompatible API changes
- MINOR: New functionality in a backwards-compatible manner
- PATCH: Backwards-compatible bug fixes

When releasing a new version:

```bash
# Create and push a tag
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

## Git Best Practices

1. Make small, focused commits
2. Pull frequently to avoid large merge conflicts
3. Write meaningful commit messages
4. Never commit sensitive information like API keys
5. Don't commit files specified in .gitignore (build artifacts, dependencies, etc.)
6. Rebase your branch before merging if necessary for a cleaner history
