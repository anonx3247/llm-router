#!/usr/bin/env node

import { Command } from "commander";
import * as readline from "readline";
import boxen from "boxen";
import chalk from "chalk";
import { GoogleProvider } from "./google";
import { OpenAIProvider } from "./openai";
import { Chat } from "./chat";
import { isText, isThought } from "./message";
import { Provider } from "./model";

const program = new Command();

program
  .name("llm-router")
  .description("Interactive multi-provider LLM chat")
  .version("0.1.0")
  .option("--list-providers", "List available providers")
  .option("--provider <provider>", "Select provider to use")
  .parse();

const options = program.opts();

const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  console.error("GOOGLE_API_KEY is not set");
  process.exit(1);
}
const openAiApiKey = process.env.OPENAI_API_KEY;
if (!openAiApiKey) {
  console.error("OPENAI_API_KEY is not set");
  process.exit(1);
}

const providers = [
  new OpenAIProvider(openAiApiKey!),
  new GoogleProvider(googleApiKey!),
];

// Handle --list-providers
if (options.listProviders) {
  listProviders(providers);
  process.exit(0);
}

function getProvider(provider: string) {
  if (provider === "openai") {
    return new OpenAIProvider(openAiApiKey!);
  }
  return new GoogleProvider(googleApiKey!);
}

let mode: "chat" | "stream" = "stream";

const selectedProvider =
  (options.model ?? "openai") === "openai"
    ? getProvider("openai")
    : getProvider("google");

const header = boxen(
  `${chalk.bold("🤖 LLM Router")}\n${chalk.dim("Interactive multi-provider LLM chat")}\n\n` +
    `${chalk.gray("Provider:")} ${chalk.cyan(selectedProvider.displayName())}\n` +
    `${chalk.gray("Mode:")} ${chalk.cyan(mode)}\n` +
    `${chalk.gray("Tips:")} ${chalk.yellow("/provider <openai|google>")} ${chalk.gray("to switch,")} ${chalk.yellow("/help")} ${chalk.gray("for commands")}`,
  {
    padding: 1,
    margin: 1,
    borderColor: "cyan",
    borderStyle: "round",
  },
);
console.log(header);
console.log(
  chalk.gray("Type your message and press Enter. Press Ctrl+C to exit."),
);

const chat = new Chat(selectedProvider);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.greenBright("› "),
});

rl.prompt();

rl.on("line", async (input: string) => {
  const message = input.trim();

  if (!message) {
    rl.prompt();
    return;
  }

  if (message.startsWith("/")) {
    const command = message.split(" ")[0];
    const args = message.split(" ").slice(1);
    switch (command) {
      case "/provider":
        chat.changeProvider(getProvider(args[0]));
        console.log(
          `\n${chalk.gray("Switched provider to")} ${chalk.cyan(chat.provider.displayName())}`,
        );
        return;
      case "/list-providers":
        listProviders(providers);
        return;
      case "/system":
        chat.changeSystemPrompt(args.join(" "));
        console.log(
          `\n${chalk.gray("System prompt set to:")} ${chalk.yellow(chat.systemPrompt)}`,
        );
        return;
      case "/mode":
        mode = args[0] as "chat" | "stream";
        console.log(`\n${chalk.gray("Mode set to")} ${chalk.cyan(mode)}`);
        return;
      case "/exit":
        process.exit(0);
      case "/help":
        console.log(
          boxen(
            [
              `${chalk.bold("Commands")}`,
              `${chalk.yellow("/provider <openai|google>")}  ${chalk.gray("Switch active provider")}`,
              `${chalk.yellow("/system <text>")}         ${chalk.gray("Set system prompt")}`,
              `${chalk.yellow("/exit")}                  ${chalk.gray("Exit")}`,
              `${chalk.yellow("/help")}                  ${chalk.gray("Show help")}`,
              `${chalk.yellow("/mode <chat|stream>")}    ${chalk.gray("Set mode")}`,
            ].join("\n"),
            { padding: 1, borderStyle: "round", borderColor: "gray" },
          ),
        );
        return;
      default:
        console.log(
          `\n${chalk.red("Unknown command:")} ${chalk.yellow(command)}. ${chalk.gray("Type")} ${chalk.yellow("/help")} ${chalk.gray("for help.")}`,
        );
        return;
    }
  }

  await communicate(message, chat, mode);

  rl.prompt();
});

rl.on("close", () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

async function communicate(
  message: string,
  chat: Chat,
  mode: "chat" | "stream",
) {
  if (mode === "chat") {
    const response = await chat.message(message);
    if (response.ok) {
      console.log(
        chalk.gray("Response:") + chalk.white(response.value.content),
      );
    } else {
      console.log(chalk.red("Error:") + chalk.white(response.error.message));
    }
    return response;
  } else {
    console.log(
      `\n${chalk.gray("Provider:")} ${chalk.cyan(chat.provider.displayName())}`,
    );
    for await (const chunk of chat.stream(message)) {
      if (isThought(chunk)) {
        process.stdout.write(chalk.gray(chunk.content));
      } else if (isText(chunk)) {
        process.stdout.write(chalk.white(chunk.content));
      }
    }
    process.stdout.write("\n");
  }
}

function listProviders(providers: Provider[]) {
  console.log(
    `\n${chalk.gray("Available providers:")} ${chalk.cyan(
      providers.map((provider) => provider.displayName()).join(", "),
    )}`,
  );
}
