# NyxenPlayer for Windows

A local-first music player (Electron). Plays MP3, M4A, AAC, WAV, OGG, Opus and FLAC from your computer.

## Run it on your own PC
1. Install Node.js 20 or newer from nodejs.org.
2. In this folder run: `npm install` then `npm start`.

## Build the installer
`npm run dist` creates `dist/NyxenPlayer Setup 1.0.0.exe` (installer) and a portable `.exe`.
On GitHub the workflow `.github/workflows/build-windows.yml` does this for you and uploads the files as the
"NyxenPlayer-windows" artifact.

## Where your data is stored
`%APPDATA%\nyxenplayer\nyxen-state.json` (library, playlists, settings) and `covers\` (album art).
Your music files are never copied or changed.

## Not included yet
Lyrics, editing song info, Google sign-in (the Gmail address is only checked for format), drag-to-reorder playlists.
