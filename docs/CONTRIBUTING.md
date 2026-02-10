# Contributing to Vibot Mobile

Thank you for your interest in contributing to Vibot Mobile! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards others
- Accept constructive criticism gracefully

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. Read the [README.md](../README.md)
2. Set up your development environment following [DEVELOPMENT.md](./DEVELOPMENT.md)
3. Familiarized yourself with the [ARCHITECTURE.md](./ARCHITECTURE.md)
4. Created a GitHub account

### Finding Something to Work On

1. **Check Existing Issues**
   - Browse [open issues](https://github.com/guyigood/vibot-mobile/issues)
   - Look for issues labeled `good first issue` or `help wanted`
   - Comment on the issue to let others know you're working on it

2. **Propose New Features**
   - Open an issue to discuss your idea first
   - Wait for maintainer feedback before starting work
   - Ensure it aligns with the project vision

3. **Report Bugs**
   - Search existing issues first
   - Provide detailed reproduction steps
   - Include device/OS information
   - Add screenshots or videos if helpful

## Development Process

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/vibot-mobile.git
cd vibot-mobile
git remote add upstream https://github.com/guyigood/vibot-mobile.git
```

### 2. Create a Branch

Use descriptive branch names:

```bash
# Feature branch
git checkout -b feature/add-room-sorting

# Bug fix branch
git checkout -b fix/recording-crash-android

# Documentation branch
git checkout -b docs/update-api-guide
```

### 3. Make Your Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed
- Commit regularly with clear messages

### 4. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(voice): add audio compression before upload

Implement audio compression using expo-av to reduce file size
before uploading to Whisper API. This reduces costs and improves
upload speed.

Closes #123
```

```bash
fix(android): resolve recording crash on Android 12

The app was crashing when requesting microphone permissions on
Android 12 due to new permission model. Updated permission
handling to use new API.

Fixes #456
```

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push Your Changes

```bash
git push origin feature/your-feature-name
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No console warnings or errors
- [ ] Tested on both iOS and Android (if applicable)
- [ ] Branch is up to date with main

### Submitting a PR

1. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

2. **PR Title**
   - Use the same format as commit messages
   - Be concise but descriptive

   Examples:
   - `feat: add room color customization`
   - `fix: resolve memory leak in TalkScreen`
   - `docs: improve API setup instructions`

3. **PR Description**

   Include:
   - What changes were made and why
   - How to test the changes
   - Screenshots/videos (for UI changes)
   - Related issues (e.g., "Closes #123")
   - Breaking changes (if any)

   Template:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How to test these changes

   ## Screenshots
   (if applicable)

   ## Related Issues
   Closes #123
   ```

### Review Process

1. **Automated Checks**
   - CI/CD will run tests automatically
   - Fix any failing checks

2. **Code Review**
   - Maintainers will review your code
   - Address feedback promptly
   - Be open to suggestions

3. **Approval**
   - Once approved, a maintainer will merge
   - Your changes will be in the next release!

## Coding Standards

### TypeScript

- Use strict TypeScript
- No `any` types (use `unknown` if necessary)
- Export types explicitly with `type` keyword
- Define interfaces for all data structures

```typescript
// ✅ Good
import type { Memory } from '../types';

interface Props {
  memory: Memory;
  onPress: () => void;
}

// ❌ Bad
import { Memory } from '../types';

interface Props {
  memory: any;
  onPress: Function;
}
```

### React Components

- Use functional components
- Use hooks for state and effects
- Destructure props
- Use meaningful variable names
- Extract complex logic to custom hooks

```typescript
// ✅ Good
export function MemoryCard({ memory, onPress }: MemoryCardProps) {
  const { state, dispatch } = useApp();

  const handlePress = useCallback(() => {
    onPress(memory.id);
  }, [memory.id, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{memory.content}</Text>
    </TouchableOpacity>
  );
}

// ❌ Bad
export function MemoryCard(props: any) {
  const ctx = useApp();

  return (
    <TouchableOpacity onPress={() => props.onPress(props.memory.id)}>
      <Text>{props.memory.content}</Text>
    </TouchableOpacity>
  );
}
```

### Styling

- Use theme tokens, not magic numbers
- Use StyleSheet.create()
- Group related styles
- Use descriptive style names

```typescript
// ✅ Good
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
});

// ❌ Bad
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1A1A3E',
    borderRadius: 12,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
```

### File Organization

- One component per file
- Co-locate tests with source files
- Use named exports, not default exports
- Keep files under 300 lines (refactor if larger)

```
src/
  components/
    MemoryCard.tsx
    MemoryCard.test.tsx
    SurpriseCard.tsx
    SurpriseCard.test.tsx
```

### Comments

- Write self-documenting code first
- Add comments for complex logic
- Use JSDoc for public APIs
- Keep comments up to date

```typescript
/**
 * Analyzes a memory and extracts tags, summary, and suggested room.
 *
 * @param content - The memory content to analyze
 * @returns Analysis results with tags, summary, and room suggestion
 * @throws Error if API key is not configured
 */
async analyzeMemory(content: string): Promise<AnalysisResult> {
  // Implementation
}
```

### Error Handling

- Always handle errors
- Provide user-friendly messages
- Log errors for debugging
- Use try-catch for async operations

```typescript
// ✅ Good
try {
  const result = await AIService.chat(messages);
  return result;
} catch (error) {
  console.error('AI chat failed:', error);
  dispatch(actions.setError('Unable to connect to AI. Please try again.'));
  return null;
}

// ❌ Bad
const result = await AIService.chat(messages);
return result;
```

## Testing Guidelines

### Writing Tests

- Test behavior, not implementation
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies

```typescript
describe('MemoryCard', () => {
  it('should display memory content', () => {
    // Arrange
    const memory = createMockMemory();
    const { getByText } = render(<MemoryCard memory={memory} />);

    // Act
    // (no action needed for display test)

    // Assert
    expect(getByText(memory.content)).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    // Arrange
    const onPress = jest.fn();
    const memory = createMockMemory();
    const { getByTestId } = render(
      <MemoryCard memory={memory} onPress={onPress} />
    );

    // Act
    fireEvent.press(getByTestId('memory-card'));

    // Assert
    expect(onPress).toHaveBeenCalledWith(memory.id);
  });
});
```

### Test Coverage

Aim for:
- 80%+ coverage for services
- 70%+ coverage for components
- 90%+ coverage for utilities

Run coverage:
```bash
npm test -- --coverage
```

## Documentation

### Code Documentation

- Document all public APIs
- Add README to complex modules
- Keep docs in sync with code

### User Documentation

- Update README.md for user-facing changes
- Add screenshots for UI changes
- Update guides in docs/ folder

### Examples

Provide examples for new features:

```typescript
// Example: Using the new room sorting feature
import { sortRooms } from '../utils/sorting';

const sortedRooms = sortRooms(rooms, 'alphabetical');
```

## Community

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Questions and general discussion
- **Discord**: Real-time chat (if available)

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in commit history

## Project Roadmap

### Current Focus

- Improving voice recording quality
- Enhancing AI connections
- Performance optimization
- Bug fixes

### Future Plans

- Cloud sync with Supabase
- Collaborative rooms
- Vector search for memories
- Export/import functionality
- Widget support
- Watch app

### Feature Requests

To propose a feature:

1. Check if it's already requested
2. Open an issue with:
   - Clear description
   - Use cases
   - Mockups (if UI change)
   - Technical considerations
3. Wait for feedback before implementing

## Release Process

Maintained by core team:

1. Version bump (semantic versioning)
2. Update CHANGELOG.md
3. Create release branch
4. Build and test
5. Merge to main
6. Tag release
7. Publish to app stores

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues
3. Open a new issue with the `question` label
4. Reach out to maintainers

## Thank You!

Your contributions make Vibot Mobile better for everyone. We appreciate your time and effort!

---

*This contributing guide is based on best practices from the open-source community and may be updated over time.*
