# Projects

Parts:

- **Headline** — "Projects" (index.html:70)
- **5 project card slots** (grid auto-fits, more can be added):
  1. **Smart Room Monitoring System** (IoT) — demo video thumbnail, description, GitHub link (index.html:72-79)
  2. **Thai Digit Recognition** — 3 real screenshots, description, GitHub link + Live Demo link (index.html:80-88)
  3. **Echoes in the Dark** — horror exploration game (GameMaker Studio, OOP exercise), demo video thumbnail, description, GitHub link (repo has the compiled build only, no source project) (index.html:92-98)
  4. **Haru AI Hub** — self-hosted local-LLM admin console (Next.js), role-scoped multi-user API keys + admin oversight, description, GitHub link, 7 real screenshots (login, dashboard, API key model allow-list, chat, profile settings, admin user management, token usage charts) (index.html:99-106)
  5. **KFSuay POS** — FastAPI + Postgres backend slice proving `SELECT ... FOR UPDATE` row-locking prevents overselling under concurrent orders (30 concurrent requests vs 10 stock → exactly 10 accepted, 20 rejected), wrapped in a small KFC-coded register demo UI, description, Design Doc link + GitHub link, 3 real screenshots (idle register, rush sold-out state, QR receipt modal) (index.html:107-113)

Each real card: **thumbnail button** (placeholder text until real media is dropped in; once added, either an `<img>` + `data-images` on the button — comma-separated paths, `data-count` controls the slot count — or a `<video>` + `data-video`), **title**, **description**, **GitHub link**.

Clicking a thumbnail opens a native `<dialog>` lightbox (`#lightbox`) — see script.js "Project screenshot lightbox". Real images live under `images/projects/<project>/1.png`, `2.png`, etc.; real video lives under `videos/projects/<project>/demo.mp4` (gitignored — kept local only, not committed). The lightbox JS renders a `<video>` when the clicked thumb has `data-video`, an `<img>` when it has `data-images`, otherwise falls back to placeholder text. Prev/next buttons cycle through image slots; multi-image cards also get a clickable thumbnail filmstrip (`#lightboxThumbs`) below the main image to jump straight to a slide — built dynamically per open() call, hidden when there's only one image.
