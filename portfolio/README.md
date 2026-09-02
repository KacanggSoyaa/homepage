# Danis Nazri — Portfolio

A minimal, dark-mode-first portfolio built with React, Vite, React Router, and Tailwind CSS.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

The production build is output to the `dist/` folder — you can deploy that folder
to Vercel, Netlify, GitHub Pages, or any static host.

## Where to edit your content

| What | File |
|---|---|
| Projects | `src/data/projects.js` |
| Certificates | `src/data/certificates.js` |
| Skills | `src/data/skills.js` |
| Bio / education | `src/pages/About.jsx` |
| Hero text | `src/pages/Home.jsx` |
| Contact links (email, GitHub, LinkedIn) | `src/components/Footer.jsx`, `src/pages/Contact.jsx` |

Every placeholder is marked with a `// TODO:` comment.

## Notes

- Dark/light theme is toggled from the navbar and saved in `localStorage`.
- The contact form currently just logs to the console (see `TODO` in
  `src/pages/Contact.jsx`) — connect it to a service like Formspree or
  EmailJS if you want it to actually send messages, since there's no backend.
- Fonts (IBM Plex Mono / IBM Plex Sans) are loaded from Google Fonts via a
  `<link>` in `index.html`, so you'll need an internet connection the first
  time you load the site for fonts to appear correctly.
