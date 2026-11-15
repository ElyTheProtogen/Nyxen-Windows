# Android-to-Windows port notes (v1.1.0)

This desktop update ports the Android Nyxen Player capabilities that have practical Windows equivalents.

## Ported
- Eight generated offline wallpapers. The optional soundscape audio and cover assets are absent from this repository and are reported as unavailable by the import action.
- Playback speed controls (0.5×–2×), resume-on-launch, saved queue restoration, auto-play similar tracks, and an end-of-track sleep timer.
- Sleep timer fade-out preference and Windows display-sleep prevention.
- Timed LRC and plain-text lyrics import, display, removal, and current-line highlighting.
- Song metadata editing for title, artist, album, and genre.
- Twenty-six built-in gradient themes, custom accent themes, and local TTF/OTF font import.
- Custom equalizer presets, playback statistics including top genres and hours listened, and recent search history.
- Existing desktop library scanning, playlists, favorites, audio effects, and media-key controls are retained.

## Platform differences / not included
- Android haptic feedback and Android notification/media-session UI are platform-specific and are not reproduced.
- Automatic pause on headphone disconnect is not implemented for Windows.
- The Windows build has no account, sign-in, or guest-mode system; it opens directly into the local player.
- Android-specific touch gestures and mobile layouts remain adapted to desktop interactions rather than copied literally.

## Validation
- JavaScript syntax checks passed for `src/app.js`, `main.js`, and `preload.js`.
- `package.json` parses successfully.
- Offline asset audit found 8 PNG wallpapers; the referenced 3 WAV tracks and 3 cover PNGs are missing.
- A Windows installer build was not run in this environment. Run `npm install` and `npm run dist` on Windows (or use the included GitHub Actions workflow) to produce the installer and portable executable.
