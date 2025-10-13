# llm-router

TS implementation of a multi-provider agentic loop

## Installation

```bash
npm install
```

## Usage

### Interactive Chat Mode (default)

```bash
# Start interactive chat with default provider
npm run dev

# Or use built version
npm start
```

### List Available providers

```bash
npm run dev -- --list-providers
```

### Select a Specific provider

```bash
npm run dev -- --provider openai
npm run dev -- --provider google
```

## CLI Options

- `--list-providers`: List all available providers
- `--provider <provider>`: Select provider to use (default: openai)

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
2. Your provider list in the `--list-providers` option (line 19-26)
3. Streaming response handling

Look for `// TODO:` comments in the code for implementation points.

## License

MIT
