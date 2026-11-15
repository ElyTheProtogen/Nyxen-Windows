# NyxenPlayer for Windows

A local-first music player for Windows, built with Electron. Plays MP3, M4A, AAC, WAV, OGG, Opus and FLAC files from your computer.

## Run it on your PC
1. Install Node.js 20 or newer.
2. In this folder run `npm install`.
3. Run `npm start`.

## Build the Windows installer
Run `npm run dist`. Electron Builder creates an NSIS installer and a portable `.exe` in `dist/`.
The GitHub Actions workflow in `.github/workflows/build-windows.yml` builds both targets and uploads them as the `NyxenPlayer-windows` artifact.

## Features
- Local music library, folder scanning, metadata extraction, album artwork, favorites and smart playlists
- Search by song, artist, album and genre, with recent-search history
- 26 automatic playlists for discovery, listening recency, favorites and track length
- JSON backup export and restore for library metadata, playlists, lyrics, history and settings
- Play queue, repeat/shuffle modes, queue restoration and optional resume-on-launch
- 10-band equalizer, tone controls, reverb, custom EQ presets and playback speed
- Listening statistics for plays, listening time, top songs, artists and genres
- 26 built-in gradient themes, custom accent themes, imported .ttf/.otf fonts and 8 offline wallpapers
- Optional offline soundscape import, with a clear availability check for missing media assets
- Timed `.lrc` and plain `.txt` lyrics, plus editable song metadata
- Sleep timer with optional fade-out, auto-play similar tracks and keep-display-awake control
- Keyboard shortcuts and media keys

## Offline pack
The app bundles eight Nyxen wallpapers. The optional soundscape WAV files and their cover images are not currently present in this repository, so **Add offline soundscapes** reports that the pack is unavailable until those assets are added.

## Data and privacy
Library metadata, playlists, settings, lyrics and listening history are stored locally at `%APPDATA%\\nyxenplayer\\nyxen-state.json`; extracted covers and imported offline audio are stored in the NyxenPlayer user-data folder. Your original music files are never copied or modified.

## Platform-specific notes
- Android-only haptics and Android notification/media-session integration do not apply to Windows. Headphone-disconnect pause behavior is not included in this desktop build.
- No account or sign-in is required. The player runs locally on this computer.
