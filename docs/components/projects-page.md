# Projects

Parts:

- **Headline** — "Projects" (index.html:70)
- **4 project card slots** (grid auto-fits, more can be added):
  1. **Smart Room Monitoring System** (IoT) — demo video thumbnail, description, GitHub link (index.html:72-79)
  2. **Thai Digit Recognition** — 3 real screenshots, description, GitHub link + Live Demo link (index.html:80-88)
  3. **Echoes in the Dark** — horror exploration game (GameMaker Studio, OOP exercise), demo video thumbnail, description, no link yet (no public repo — compiled build only) (index.html:92-97)
  4. (not yet added) — chatbot project + "2 other projects" still pending from the user

Each real card: **thumbnail button** (placeholder text until real media is dropped in; once added, either an `<img>` + `data-images` on the button — comma-separated paths, `data-count` controls the slot count — or a `<video>` + `data-video`), **title**, **description**, **GitHub link** (optional — omitted when there's no public repo, as with Echoes in the Dark).

Clicking a thumbnail opens a native `<dialog>` lightbox (`#lightbox`) — see script.js "Project screenshot lightbox". Real images live under `images/projects/<project>/1.png`, `2.png`, etc.; real video lives under `videos/projects/<project>/demo.mp4` (gitignored — kept local only, not committed). The lightbox JS renders a `<video>` when the clicked thumb has `data-video`, an `<img>` when it has `data-images`, otherwise falls back to placeholder text. Prev/next buttons cycle through image slots only; video has no cycling.
