
[![Discord](https://img.shields.io/badge/Discord-Join%20Us-5865F2?logo=discord&logoColor=white)](https://discord.gg/CbAsUR434B)
[![Docs](https://img.shields.io/badge/Docs-docs.antigma.ai-orange?logo=safari&logoColor=white)](https://docs.antigma.ai)
[![X](https://img.shields.io/badge/X-@antigma__labs-black?logo=x&logoColor=white)](https://twitter.com/antigma_labs)
[![Hugging Face](https://img.shields.io/badge/HuggingFace-Antigma-yellow?logo=huggingface&logoColor=white)](https://huggingface.co/Antigma)

# Ante Preview

> **⚠️ Alpha Preview For Evaluation**  
> This project is currently in alpha and provided as a research preview.
> Currently only support MacOs and Linux

Ante is a lightweight agent live in terminal built by Antigma Labs.
It was designed from ground up and built with native rust for security, performance and resistance to AI generated slop. 


## Quick Start

### Installation
Ante is distributed as a single, self-contained binary with no external dependencies — just download and run.

```sh
curl -fsSL https://ante.run/install.sh | bash
```

### Run as headless

Positional prompt: `ante -p "your prompt"`

With overrides: `ante --model gpt-4o-mini --provider openai "your prompt"`

From stdin: echo `"your prompt" | ante "explain"`

### Run as Interactive TUI
`ante`

## Documentation Site
Documentation is available at [docs.antigma.ai](https://docs.antigma.ai).

Check local docs changes

In `docs/`, run `npx mintlify dev`

## Github Page
Use Github Page to host static files in `gh-page` like installation script
