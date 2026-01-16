# CLAUDE.md

## Repository Information

**Project Name:** llm-router
**Language/Stack:** TypeScript/Node.js
**Purpose:** Universal TypeScript interface for all LLM providers with unified support for text, thinking, tools, and images
**Repository Type:** [x] New Repository  [ ] Existing Repository

---

## Repository Setup Type

### 🆕 New Repository Guidelines

When starting a **new repository**, follow these principles:

- **Set up comprehensive linting and code-checking rules** from the start
- **Keep boilerplate absolutely minimal** - expect many changes ahead
- **Never over-engineer** - build only what's needed now
- **Prefer simplicity** - the codebase will evolve significantly

**Initial Setup Checklist:**
- [ ] Configure linter (ESLint for JS/TS, Ruff/Black for Python, etc.)
- [ ] Set up type checking (TypeScript strict mode, mypy for Python)
- [ ] Configure code formatter (Prettier, Black, etc.)
- [ ] Add pre-commit hooks for quality gates
- [ ] Create minimal project structure
- [ ] Set up testing framework with TDD workflow

### 📚 Existing Repository Guidelines

When working on an **existing repository**, follow this workflow:

1. **Create a feature branch** with naming convention: `[feat]-{feature-name-here}`
2. **Use git worktrees** for parallel development:
   ```bash
   # Create worktree in ~/dev/{repo-name}-{feature-name}
   git worktree add ~/dev/{repo-name}-{feature-name} [feat]-{feature-name}
   cd ~/dev/{repo-name}-{feature-name}
   ```
3. **Explore the codebase** before making changes
4. **Follow existing patterns** and conventions
5. **Push branch and create PR** when feature is complete

---

## Database Guidelines

### General Database Practices

- **ALWAYS make a backup before running migrations or modifying the database**
- **Prefer local databases** (sqlite) unless explicitly told otherwise
- **Do NOT assume cloud/remote databases** without explicit instruction

### SQLite + TypeScript

- Use **Drizzle ORM** unless the project already uses a different ORM
- Always backup `.db` files before schema changes:
  ```bash
  cp database.db database.db.backup-$(date +%Y%m%d-%H%M%S)
  ```

---

## Python Development

### Environment & Tools

- **Always use virtual environments (venv)**
- **Use `uv` for all Python commands** (installation, package management, etc.)
- **EXCEPTION:** Do NOT use nix shells for Python projects

### Code Standards

- **Use type hints everywhere**
- **Run mypy** for type checking
- Follow PEP 8 style guide
- Use modern Python features (3.10+)

**Example:**
```python
def process_data(items: list[str], threshold: int = 10) -> dict[str, int]:
    """Process items and return counts."""
    result: dict[str, int] = {}
    for item in items:
        result[item] = len(item)
    return result
```

---

## JavaScript & TypeScript Development

### TypeScript Standards

- **NEVER use `any` type** - always provide proper types
- **Always prefer TypeScript over JavaScript**
- **Use CommonJS compilation target**
- **Enable strict mode** in tsconfig.json

### ESLint Rules & Preferences

- **Prefer `??` (nullish coalescing) over `||`**
- **Use trailing commas** in multiline objects/arrays
- **For ENUMs: No need for "default" case in switch statements** (exhaustive checking)
- **Configure `@app` alias** pointing to `src/` for absolute imports

**Example tsconfig.json paths:**
```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/*"]
    }
  }
}
```

**Import style - prefer:**
```typescript
import { UserService } from '@app/services/user';
// NOT: import { UserService } from '../../services/user';
```

### Testing

- **Use TDD (Test-Driven Development)**
- **Aim for 80%+ code coverage**
- Write tests BEFORE implementation code

---

## OOP vs Functional Programming

### General Principles

- **Not everything needs a class** - prefer functions when possible
- **Favor composition over inheritance**
- **Limit abstract classes** - prefer Go-style interfaces/TypeScript interfaces/trait-like patterns
- **Keep it simple** - don't create complex class hierarchies

**Good:**
```typescript
interface Logger {
  log(message: string): void;
}

function createConsoleLogger(): Logger {
  return {
    log: (message) => console.log(message)
  };
}
```

**Avoid:**
```typescript
abstract class BaseLogger {
  abstract log(message: string): void;
}

class ConsoleLogger extends BaseLogger {
  log(message: string): void {
    console.log(message);
  }
}
```

---

## Comments & Documentation

### Philosophy

- **Use comments sparingly**
- **Make self-documenting code** - good variable names, clear types, obvious logic
- **Only comment when:**
  - Explaining particularly complex algorithms
  - Documenting invariants
  - Warning about non-obvious edge cases
  - Explaining "why" not "what"

**Good:**
```typescript
// Invariant: users array must be sorted by ID before binary search
function findUserById(users: User[], id: number): User | undefined {
  // ... binary search implementation
}
```

**Avoid:**
```typescript
// This function finds a user by ID
function findUserById(users: User[], id: number): User | undefined {
  // Loop through users
  for (const user of users) {
    // Check if ID matches
    if (user.id === id) {
      return user; // Return the user
    }
  }
}
```

---

## Development Philosophy & Workflow

### Test-Driven Development (TDD)

**Always follow this workflow:**

1. **Explore** - Understand the problem space and existing codebase
2. **Plan** - Think through the solution architecture
3. **Write Tests** - Create tests for expected behavior
4. **Verify Tests Fail** - Ensure no implementation code exists yet
5. **Implement** - Write minimal code to pass tests
6. **Refactor** - Clean up while keeping tests green
7. **Push & PR** - Create pull request when feature is complete

### Feature Development Workflow

```
1. Explore the Problem Space
   └─> Read relevant code, understand patterns

2. Plan the Solution
   └─> Think through architecture, identify edge cases

3. Write Tests
   └─> Test expected inputs/outputs, edge cases
   └─> Run tests - they should FAIL

4. Implement Code
   └─> Write minimal code to pass tests
   └─> Iterate until all tests pass

5. Verify & Review
   └─> Run linters, type checkers
   └─> Ensure 80%+ coverage

6. Push & Create PR
   └─> Push branch to remote
   └─> Create pull request
   └─> Address PR comments iteratively
```

### Code Quality Goals

- **Strive for simplicity** - simple code is better than clever code
- **80%+ code coverage minimum**
- **Zero linting errors**
- **Zero type errors**
- **Self-documenting code**

---

## Development Environment

### Shell & Package Management

- **Use zsh** as default shell
- **Use nix shells** for development environments
- **Create nix-development shells** and run `nix-develop`
- **EXCEPTION: Python projects** - use `uv` and `venv` instead of nix

**Example nix-shell setup:**
```bash
# For Node.js/TypeScript projects
nix-shell -p nodejs_20 nodePackages.pnpm

# For Go projects
nix-shell -p go_1_21

# For Python - DON'T use nix, use uv instead
uv venv
source .venv/bin/activate
```

---

## Common Commands

### Git Workflow

```bash
# Create feature branch with worktree
git worktree add ~/dev/{repo-name}-{feature} [feat]-{feature-name}

# When done with feature
git worktree remove ~/dev/{repo-name}-{feature}

# Push and create PR
git push -u origin [feat]-{feature-name}
# Then create PR via GitHub UI or gh CLI
```

### Testing

```bash
# Run tests
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:ui         # UI mode
npm run test:coverage   # Generate coverage report
```

### Linting & Type Checking

```bash
# Linting
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix linting issues

# Type checking
npm run build           # TypeScript compilation
npm run watch           # Watch mode for compilation
```

### Database Backup (SQLite)

```bash
# Before migrations
cp database.db database.db.backup-$(date +%Y%m%d-%H%M%S)

# Restore if needed
cp database.db.backup-YYYYMMDD-HHMMSS database.db
```

---

## Project-Specific Notes

### Architecture Overview

llm-router provides a unified interface for multiple LLM providers through:
- **Abstract LLM Base Class**: All providers extend a common base class
- **Content-Array Based Messages**: Messages contain Content[] for rich content types
- **Unified Config**: BaseModelConfig + provider-specific `extra: Record<string, any>`
- **Type Safety**: Strict TypeScript with discriminated unions

### Key Files

**Type System:**
- `src/types/content.ts` - Content types (Text, Image, Thinking, ToolUse, ToolResult)
- `src/types/message-v2.ts` - Message type with Content[] array
- `src/types/chunk.ts` - StreamChunk types for streaming
- `src/types/config.ts` - BaseModelConfig and provider configs

**Core Implementation:**
- `src/llm/base.ts` - Abstract LLM class
- `src/llm/factory.ts` - Provider factory
- `src/chat.ts` - Chat orchestration

**Providers:**
- `src/llm/openai.ts` - OpenAI implementation
- `src/llm/google.ts` - Google Gemini implementation
- `src/llm/anthropic.ts` - Anthropic Claude implementation (future)
- `src/llm/mistral.ts` - Mistral implementation (future)
- `src/llm/deepseek.ts` - Deepseek implementation (future)
- `src/llm/moonshotai.ts` - MoonshotAI implementation (future)

### Important Patterns

**Adding a New Provider:**

1. Create `src/llm/provider-name.ts` extending `LLM` base class
2. Implement required methods:
   - `chat()` - Non-streaming completion
   - `stream()` - Streaming completion
   - `displayName()` - Human-readable name
   - `maxTokens()` - Context window size
   - `tokens()` - Token counting
   - `costPerTokenUsage()` - Cost calculation
   - `transformMessages()` - Internal → Provider format
   - `transformResponse()` - Provider → Internal format
3. Add provider config to `src/types/config.ts`
4. Add to factory in `src/llm/factory.ts`
5. Update CLI in `src/cli.ts`
6. Write tests in `tests/llm/provider-name.test.ts`

**Message Transformation Pattern:**

Each provider must transform between internal and provider-specific formats:

```typescript
protected transformMessages(conversation: Conversation): any {
  // Convert internal Message[] to provider format
  // Handle role mapping, content transformation
  // Extract system messages if needed
}

protected transformResponse(response: any): Message {
  // Convert provider response to internal Message
  // Build Content[] from provider response
}
```

**Content Type Support:**

All providers should handle these content types:
- Text: Always supported
- Thinking: Map to provider-specific reasoning
- Tool Use/Result: Map to provider-specific function calling
- Images: Map to provider-specific image format

### Known Gotchas

- **Type guards are your friend**: Always use type guards for Content and StreamChunk
- **Provider data field**: Use `provider: ProviderData` for round-trip fidelity
- **Streaming accumulation**: Chat class accumulates chunks into Content[] array
- **System messages**: Different providers handle system messages differently (inline vs separate)
- **Token counting**: Not all providers have official token counting APIs
- **Cost calculation**: Remember to account for cached and thinking tokens

### Development Workflow

**Feature Branch Workflow:**

1. Create feature branch: `[feat]-provider-name` or `[feat]-feature-name`
2. Use git worktree if working on multiple features:
   ```bash
   git worktree add ~/dev/llm-router-anthropic [feat]-anthropic
   ```
3. Write tests first (TDD)
4. Implement feature
5. Ensure all tests pass and coverage is 80%+
6. Push and create PR

**Testing Requirements:**

- Unit tests with mocked API calls (required)
- Integration tests with real API keys (optional, for CI)
- 80%+ code coverage minimum
- All type guards must be tested
- All helper functions must be tested

### Common Commands

```bash
# Development
npm run dev                          # Run CLI in dev mode
npm run dev -- --provider openai     # Test specific provider

# Testing
npm test                             # Run tests
npm run test:watch                   # Watch mode
npm run test:coverage                # Coverage report

# Build & Release
npm run build                        # TypeScript compilation
npm run clean                        # Remove dist/
npm run lint                         # Run linting
npm run lint:fix                     # Auto-fix linting

# Manual testing with providers
OPENAI_API_KEY=... npm run dev
GOOGLE_API_KEY=... npm run dev -- --provider google
ANTHROPIC_API_KEY=... npm run dev -- --provider anthropic
```

### Environment Variables

Required API keys for each provider:
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_API_KEY` - Google AI API key
- `ANTHROPIC_API_KEY` - Anthropic API key (future)
- `MISTRAL_API_KEY` - Mistral API key (future)
- `DEEPSEEK_API_KEY` - Deepseek API key (future)
- `MOONSHOTAI_API_KEY` - MoonshotAI API key (future) 

---

## Summary

- **New repos:** Minimal boilerplate, comprehensive linting, expect changes
- **Existing repos:** Feature branches with worktrees in ~/dev
- **Database:** Always backup before migrations, prefer local sqlite
- **Python:** Use uv + venv, type hints, mypy
- **TypeScript:** Never use `any`, prefer TS, TDD, absolute imports with @app
- **Code style:** Functions over classes, composition over inheritance
- **Comments:** Sparingly - prefer self-documenting code
- **Workflow:** TDD always - test first, then implement
- **Environment:** zsh + nix shells (except Python: use uv)