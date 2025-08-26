# Contributing to Flight BPMN Process Editor

Thank you for considering contributing to the Flight BPMN Process Editor! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as much detail as possible:

- Clear and descriptive title
- Step-by-step reproduction instructions
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Environment details (browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide detailed description of the proposed functionality
- Include mock-ups or examples if possible
- Explain why this enhancement would be useful

### Pull Requests

- Fill in the required template
- Follow the code style used in the project
- Include tests when adding new features
- Update documentation as needed
- Submit PRs to the `develop` branch, not `main`

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   cd flight/bpmn-app
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Code Structure

- `src/App.jsx`: Main application component
- `src/BpmnEditorClean.jsx`: Core editor implementation
- `src/components/`: Reusable UI components
- `src/utils/`: Helper functions

## Style Guidelines

### JavaScript

- Use ES6+ features
- Follow the ESLint configuration included in the project
- Use meaningful variable and function names

### CSS

- Use Tailwind utility classes when possible
- Follow BEM naming convention for custom CSS

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference issue numbers in commit messages when applicable
- Make small, focused commits

## Testing

Before submitting a pull request:

- Run `npm run lint` to check for code style issues
- Ensure your changes work in major browsers (Chrome, Firefox, Safari, Edge)

Thank you for contributing!
