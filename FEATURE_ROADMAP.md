# Nyxen Player — 200-feature expansion roadmap

This is a product backlog, not a claim that every item is implemented. The first implementation wave is tracked separately in the current pull request. Items should be delivered in tested, user-visible batches; avoid shipping placeholder toggles or duplicating existing behavior.

**Implementation note:** The current duplicate finder groups normalized title + artist matches for review; exact file-hash detection (item 1) remains open.

## 1. Library intelligence
1. Duplicate-track detection by file hash.
2. Near-duplicate detection by title, artist and duration.
3. Missing-file detection with relink action.
4. Batch relink moved folders.
5. Library health report.
6. Empty-folder cleanup suggestions.
7. Metadata completeness report.
8. Detect conflicting metadata tags.
9. Bulk metadata editor.
10. [x] Multi-select track operations.
11. [x] Batch favorite and unfavorite.
12. [x] Batch add to playlist.
13. [x] Batch remove from library.
14. Batch genre assignment.
15. Batch album-artist correction.
16. Sort by file size.
17. Sort by bitrate.
18. Sort by sample rate.
19. Filter by file format.
20. Filter by folder location.

## 2. Search and discovery
21. [x] Search by filename.
22. Search by composer.
23. Search by album artist.
24. Search by year.
25. Search by comment tag.
26. Search by file format.
27. Search by duration range.
28. Search by bitrate range.
29. [x] Search by folder path.
30. Search within current playlist.
31. Search within current album.
32. Search within current artist.
33. Search within queue.
34. [x] Search with quoted exact phrases.
35. [x] Search with negative terms.
36. [x] Search with field prefixes.
37. Search suggestions while typing.
38. Search result highlighting.
39. Search history management.
40. Saved search filters.

## 3. Playlists and queue
41. Smart playlists with custom rules.
42. [x] Playlist folders.
43. Nested playlist groups.
44. Playlist cover customization.
45. Playlist descriptions.
46. Playlist color accents.
47. Playlist duplicate action.
48. Playlist merge action.
49. Playlist export to M3U.
50. Playlist import from M3U.
51. Playlist import from PLS.
52. Playlist track count and duration summary.
53. Queue save as playlist.
54. Queue load from playlist.
55. Queue clear confirmation.
56. [x] Queue drag-and-drop reorder.
57. Queue search.
58. Queue deduplication.
59. Queue history.
60. Queue undo for removals.

## 4. Playback controls
61. Crossfade between tracks.
62. Gapless playback improvements.
63. ReplayGain track normalization.
64. ReplayGain album normalization.
65. Per-track volume trim.
66. Per-track playback speed.
67. A-B repeat loop.
68. Configurable seek interval.
69. Configurable next-track behavior.
70. Configurable previous-track behavior.
71. Start playback at a saved timestamp.
72. Stop after a chosen number of tracks.
73. Stop at a chosen clock time.
74. Pause when headphones disconnect.
75. Resume when headphones reconnect.
76. Fade between pause and play.
77. Mono audio toggle.
78. Left-right balance control.
79. Output-device selection.
80. Audio engine diagnostics.

## 5. Audio Studio and sound
81. Parametric equalizer.
82. More EQ bands.
83. EQ preset import.
84. EQ preset export.
85. Per-device EQ profiles.
86. Per-genre EQ profiles.
87. Per-track EQ profiles.
88. Limiter.
89. Compressor.
90. Stereo widener.
91. Stereo-to-mono utility.
92. Low-pass filter.
93. High-pass filter.
94. Loudness meter.
95. Peak meter.
96. Clipping indicator.
97. Spectrum analyzer history.
98. Reverb room-size control.
99. Reverb damping control.
100. Audio chain preset manager.

## 6. Lyrics and metadata
101. Embedded lyric extraction.
102. Embedded lyric writing.
103. LRC offset adjustment.
104. LRC timing editor.
105. Karaoke word highlighting.
106. Lyrics font-size control.
107. Lyrics background themes.
108. Lyrics search in local files.
109. Lyrics export.
110. Lyrics backup validation.
111. Album artwork editor.
112. Artwork crop and position.
113. Artwork format conversion.
114. Artwork cache management.
115. Multiple artwork choices per album.
116. Composer metadata support.
117. Album artist metadata support.
118. Year and original-year fields.
119. Track number and disc number editing.
120. Metadata tag preview before save.

## 7. Listening insights
121. Listening time by day.
122. Listening time by week.
123. Listening time by month.
124. Listening time by year.
125. Listening timeline heatmap.
126. Most-played albums.
127. Most-played decades.
128. Favorite-artist leaderboard.
129. Genre distribution chart.
130. Listening streak tracker.
131. Personal listening milestones.
132. First-played date per track.
133. Last-played calendar.
134. Skip-count statistics.
135. Completion-rate statistics.
136. Recently discovered artists.
137. Library growth chart.
138. Listening session summaries.
139. Export listening history as CSV.
140. Reset selected statistics.

## 8. Appearance and accessibility
141. Compact density mode.
142. Extra-large text mode.
143. High-contrast mode.
144. Per-page accent colors.
145. Custom sidebar ordering.
146. Hide unused navigation pages.
147. Custom home sections.
148. Reorder home sections.
149. Custom album-card sizes.
150. Reduced-motion setting.
151. Independent animation intensity.
152. Custom player-bar layout.
153. Always-on-top mini player.
154. Borderless mini player.
155. Custom background image.
156. Background blur control.
157. Theme import and export.
158. Theme preview before applying.
159. Keyboard focus visibility options.
160. Screen-reader labels audit.

## 9. Desktop workflow
161. Global media hotkeys.
162. Configurable keyboard shortcuts.
163. Tray icon controls.
164. Minimize to tray.
165. Start minimized.
166. Launch at Windows startup.
167. Windows taskbar progress.
168. Windows media session integration.
169. Jump-list recent tracks.
170. File Explorer context-menu integration.
171. Drag audio files into the window.
172. Drag folders into the window.
173. Drop files onto playlists.
174. Open folders from track context menu.
175. Reveal current track in Explorer.
176. Multiple app window layouts.
177. Restore last window size and position.
178. Portable-mode data directory.
179. Offline update package support.
180. Crash recovery prompt.

## 10. Reliability, privacy and maintenance
181. Automatic rotating backups.
182. Backup scheduling.
183. Selective backup restore.
184. Backup integrity checks.
185. Backup encryption with a user-owned passphrase.
186. Library database migration checks.
187. State-file corruption recovery.
188. Safe-write and backup rotation.
189. Import operation cancellation.
190. Import progress with file-level status.
191. Scan error report.
192. Retry failed imports.
193. Permission diagnostics.
194. Storage usage report.
195. Cache cleanup controls.
196. Log viewer with privacy-safe redaction.
197. Diagnostics export.
198. App self-check screen.
199. Restore default settings without deleting music.
200. Full data export and deletion preview.

## Delivery principles
- Keep Nyxen local-first and account-free.
- Never modify, move, or delete original media files without an explicit user action.
- Make destructive operations reversible where practical.
- Preserve the current Windows visual language and honor reduced-motion preferences.
- Keep Android work in its separate repository.
