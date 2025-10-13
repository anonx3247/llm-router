# llm-router

TS implementation of a multi-provider agentic loop

## Installation

```bash
npm install
```

## Usage

### Interactive Chat Mode (default)

```bash
# Start interactive chat with default model
npm run dev

# Or use built version
npm start
```

### List Available Models

```bash
npm run dev -- --list-models
```

### Select a Specific Model

```bash
npm run dev -- --model gpt-4
npm run dev -- --model claude-3-sonnet
```

## CLI Options

- `--list-models`: List all available models
- `--model <model>`: Select model to use (default: gpt-4)

## How It Works

1. Run the CLI
2. Type your message at the `>` prompt
3. Press Enter to send
4. The response will be streamed back
5. Continue the conversation turn-by-turn
6. Press Ctrl+C to exit

## Project Structure

```
llm-router/
├── src/
│   └── cli.ts         # Interactive chat CLI
├── dist/              # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Development Scripts

- `npm run dev`: Run CLI in development mode with tsx
- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Run built CLI
- `npm run watch`: Watch mode for development
- `npm run clean`: Clean build artifacts

## Implementation

The CLI provides a clean turn-by-turn interface. You need to implement:

1. The actual LLM API calls in the `rl.on('line')` handler (line 42-58 in `src/cli.ts`)
2. Your model list in the `--list-models` option (line 19-26)
3. Streaming response handling

Look for `// TODO:` comments in the code for implementation points.

## License

MIT
