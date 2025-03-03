# ![Favicon](https://raw.githubusercontent.com/pkunv/vitrine/master/resources/icon.png) vitrine

![GitHub package.json version](https://img.shields.io/github/package-json/v/pkunv/vitrine)

## Overview

> **Warning**  
> Project is done only for fun and I do not plan on actively working on this.

Simple keyboard-centric code/text editor available for Windows, macOS and Linux.
Great foundation for a bigger project. Created as a proof of concept. 

## Features

- 🪟 Tab functionality
- 🚪 Multi-platform support
- ✂️ Copy, cut, paste functions
- ✒️ Automatic code highlighting
- ⚙️ Adjustable theme and settings
- 🔎 Find in file

## Requirements

- CPU with AVX instructions (2013 and later)
- 256MB of disk space
- 512MB of RAM

## Tech stack

| **Subject**        | **Solution**       |
|--------------------|--------------------|
| Javascript runtime | Bun                |
| GUI library        | SDL2 (@kmamal/sdl) |
| Code highlighting  | highlight.js       |

## Navigation shortcuts

### Main shortcuts
F1 -> F9: Change window\
CTRL+1 -> CTRL+0: Change tab of the current window\
CTRL+PLUS: Zoom in\
CTRL+MINUS: Zoom out\
CTRL+C: Close application (available from Home window)

### Editor keybindings

UP, DOWN, LEFT, RIGHT: Navigate the cursor\
ALT+UP/ALT+DOWN/ALT+LEFT/ALT+RIGHT: Move cursor by 5 rows/columns\
CTRL+Q: Move cursor to the start of the line\
CTRL+E: Move cursor to the end of the line\
CTRL+C: Copy selection\
CTRL+X: Cut selection\
CTRL+V: Paste content from clipboard\
CTRL+L: Select current line\
RETURN, UP, DOWN: Insert new line\
BACKSPACE: Remove character/selection\
CTRL+N: Create new file

### Editor dialog prompt keybindings
Cursor in dialog prompts is not supported yet.\
Simply type in your value, press BACKSPACE to remove characters and press RETURN to confirm.\
CTRL+S: Save file dialog\
CTRL+O: Open file dialog\
CTRL+F: Find in current file dialog

## Installation

If you wish to just use the editor, you can download executable from Release page,
unpack .zip archive and run vitrine.exe.

1. Install bun environment (skip if you already have bun)
2. Run `bun install` command.
3. Run `bun run dev` command to run development version.







