# Claude Code Dev Assistant

This repo-local plugin is designed to make Claude Code easier to use as an everyday development copilot.

It focuses on four jobs:

- Generate code snippets from requirements
- Debug errors and suggest improvements
- Explain unfamiliar code in simple terms
- Implement features in clear, incremental steps

The plugin is intentionally language-agnostic so it can support web apps, AI projects, and general software development.

## Included skill

- `claude-code-dev-assistant`

## Example prompts

- `Use claude-code-dev-assistant to debug this stack trace and propose a minimal fix.`
- `Use claude-code-dev-assistant to explain this module in plain English.`
- `Use claude-code-dev-assistant to implement this feature step by step.`

## Notes

- The plugin is scaffolded locally in this repo under `plugins/claude-code-dev-assistant`.
- The same skill is intended to be exposed to Claude Code through the repo's `.claude/skills` folder.
- I left marketplace registration out so we do not lock this into a repo-local vs home-local catalog decision without your say-so.
