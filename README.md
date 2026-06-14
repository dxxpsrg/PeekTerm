# peekterm

A macOS menu-bar (tray) side-panel terminal. Click the menu-bar icon — or press a global hotkey — and a terminal slides in on the right half of your screen. Click away and it hides while your shell keeps running in the background. No Dock icon.

**English** | [한국어](README.ko.md)

## Features

- **Menu-bar driven** — runs from the tray and never appears in the Dock.
- **Side panel** — opens on the right of the active display (50% width, full height).
- **Click-away to hide** — losing focus hides the window; your work is untouched.
- **Background session** — a single `zsh` PTY stays alive, so you resume right where you left off.
- **Global hotkey** — summon the terminal from any app (default: **Command + backtick**, ⌘`).
- **Settings** — capture a hotkey, adjust font size, and switch between dark / light themes.

## Tech Stack

| Role | Library |
|------|---------|
| Framework | Electron |
| Build | electron-vite + TypeScript |
| UI | React |
| Terminal | @xterm/xterm + @xterm/addon-fit |
| PTY | node-pty |
| Font | JetBrains Mono (bundled) |
| Tests | Vitest |

## Uninstall

peekterm installs no login items, system extensions, or background daemons — removing the app leaves almost nothing behind.

1. Quit peekterm (tray icon → **peekterm 종료**).
2. Move the app to the Trash.
3. Delete the settings folder, which holds only `settings.json`:

   ```sh
   rm -rf ~/Library/Application\ Support/peekterm
   ```

## License

MIT
