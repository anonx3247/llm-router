#!/usr/bin/env node

import { Command } from "commander";
import * as readline from "readline";
import boxen from "boxen";
import chalk from "chalk";
import { OpenAILLM } from "./llm/openai";
import { Chat } from "./llm/chat";
import { isTextChunk, isThinkingChunk } from "./types/chunk";
import { LLM } from "./llm/base";
import { getMessageText } from "./types/message-v2";

const program = new Command();

program
  .name("llm-router")
  .description("Interactive multi-provider LLM chat")
  .version("0.1.0")
  .option("--list-providers", "List available providers")
  .option("--provider <provider>", "Select provider to use")
  .parse();

const options = program.opts();

const openAiApiKey = process.env.OPENAI_API_KEY;
if (!openAiApiKey) {
  console.error("OPENAI_API_KEY is not set");
  process.exit(1);
}

function createLLM(provider: string): LLM {
  if (provider === "openai") {
    return new OpenAILLM({
      model: "gpt-4o-mini",
      apiKey: openAiApiKey,
    });
  }
  throw new Error(`Unknown provider: ${provider}`);
}

let mode: "chat" | "stream" = "stream";

const selectedProvider = options.provider ?? "openai";
const llm = createLLM(selectedProvider);

const header = boxen(
  `${chalk.bold("🤖 LLM Router")}\n${chalk.dim("Interactive multi-provider LLM chat")}\n\n` +
    `${chalk.gray("Provider:")} ${chalk.cyan(llm.displayName())}\n` +
    `${chalk.gray("Mode:")} ${chalk.cyan(mode)}\n` +
    `${chalk.gray("Tips:")} ${chalk.yellow("/provider <openai>")} ${chalk.gray("to switch,")} ${chalk.yellow("/help")} ${chalk.gray("for commands")}`,
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

const chat = new Chat(llm);

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
        chat.changeLLM(createLLM(args[0]));
        console.log(
          `\n${chalk.gray("Switched provider to")} ${chalk.cyan(chat.llm.displayName())}`,
        );
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
        break;
      case "/help":
        console.log(
          boxen(
            [
              `${chalk.bold("Commands")}`,
              `${chalk.yellow("/provider <openai>")}  ${chalk.gray("Switch active provider")}`,
              `${chalk.yellow("/system <text>")}      ${chalk.gray("Set system prompt")}`,
              `${chalk.yellow("/exit")}               ${chalk.gray("Exit")}`,
              `${chalk.yellow("/help")}               ${chalk.gray("Show help")}`,
              `${chalk.yellow("/mode <chat|stream>")} ${chalk.gray("Set mode")}`,
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
      const text = getMessageText(response.value);
      console.log(chalk.gray("Response:") + chalk.white(text));
    } else {
      console.log(chalk.red("Error:") + chalk.white(response.error.message));
    }
    return response;
  } else {
    console.log(
      `\n${chalk.gray("Provider:")} ${chalk.cyan(chat.llm.displayName())}`,
    );
    for await (const chunk of chat.stream(message)) {
      if (isThinkingChunk(chunk)) {
        process.stdout.write(chalk.gray(chunk.content));
      } else if (isTextChunk(chunk)) {
        process.stdout.write(chalk.white(chunk.content));
      }
    }
    process.stdout.write("\n");
  }
}
