// blog.js — Blog / daily threads data.
// Array of casual, social-media-style post objects rendered in the Blog feed
// and their full-page versions.
//
// Post fields:
//   id      : unique key (used for the /blog/<id> detail route)
//   date    : displayed timestamp (YYYY-MM-DD)
//   text    : the short preview you see in the feed
//   content : optional LONGER full version shown on the thread's detail page.
//             Omit (or keep the same as text) if the post is short.
//   tag     : optional short category badge
//   likes   : display like-count
//   image   : optional attached picture. Import an image from this file and
//             reference it here, or use a URL string. Drop your own photos in
//             src/components/img/blog/ and swap the imports below.
//
// Keep the most recent posts first.

import devLife from '../components/img/blog/dev-life.svg'
import weekend from '../components/img/blog/weekend.svg'
import uniGrind from '../components/img/blog/uni-grind.svg'

export const blogPosts = [
  {
    id: 1,
    date: '2026-09-06',
    text: "Spent the evening refactoring my portfolio's hero section. Went from 200 lines of spaghetti to a clean, composable stack. Honestly, deleting code feels better than writing it sometimes. 🧹",
    content:
      "Spent the evening refactoring my portfolio's hero section. Went from 200 lines of spaghetti to a clean, composable stack. Honestly, deleting code feels better than writing it sometimes. 🧹\n\nBreakdown of the night:\n1. Moved the profile JSON panel into its own component — it was doing way too much.\n2. Extracted all the marquee/skill stuff so the hero is purely presentational.\n3. Ended up deleting ~40 lines. Deleting code is the best feeling in the world.\n\nThe result reads way clearer and it's actually maintainable now. Small refactor, big peace of mind.",
    tag: 'dev',
    likes: 24,
    image: devLife,
  },
  {
    id: 2,
    date: '2026-09-02',
    text: 'Hot take: the best part of any project is that stretch where you stop worrying about "doing it right" and just start shipping. Momentum beats perfection. 🔥',
    content:
      'Hot take: the best part of any project is that stretch where you stop worrying about "doing it right" and just start shipping. Momentum beats perfection. 🔥\n\nI spent way too long this semester trying to architect the perfect solution before writing a single line. Turns out the perfect solution never shows up on paper — it shows up after you ship something ugly and learn from it.\n\nRules I try to follow now:\n- Ship something visible every day, even if it is small.\n- Refactor after you understand the actual problem, not before.\n- Momentum beats perfection, every single time.',
    tag: 'thought',
    likes: 41,
  },
  {
    id: 3,
    date: '2026-08-27',
    text: 'Today I learned why PERT/CPM scheduling actually matters — trying to coordinate a group assignment without a timeline is basically herding cats. 🐱',
    content:
      'Today I learned why PERT/CPM scheduling actually matters — trying to coordinate a group assignment without a timeline is basically herding cats. 🐱\n\nOur group project was a mess until someone mapped out every task, who owns it, and the deadlines between them. Suddenly the "urgent" fire drills disappeared because we were planning ahead.\n\nAlso learned: the critical path is not a fun walk, it is the one task everything else waits on. Protect it.\n\nphoto dump from the whiteboard session below 📸',
    tag: 'uni',
    likes: 13,
    image: uniGrind,
  },
  {
    id: 4,
    date: '2026-08-19',
    text: "Made a tiny website for my mom's stall over the weekend. Nothing fancy, just a menu and a map link, but her smile when I showed her was worth a thousand certificates. 💛",
    content:
      "Made a tiny website for my mom's stall over the weekend. Nothing fancy, just a menu and a map link, but her smile when I showed her was worth a thousand certificates. 💛\n\nShe has been running her stall for years and never had any online presence. Two hours of work: a one-page site with her menu, prices, location, and a WhatsApp button.\n\nWorth it? Absolutely. Seeing non-tech people light up when they realize the computer thing you do can help their real life is the best motivation there is.",
    tag: 'life',
    likes: 58,
    image: weekend,
  },
  {
    id: 5,
    date: '2026-08-10',
    text: "Debugging at 2am and the bug turned out to be a single typo. The typo: me, forgetting that I renamed the variable three files ago. Never again. (See you next week, it won't be never again.)",
    tag: 'dev',
    likes: 89,
  },
  {
    id: 6,
    date: '2026-08-01',
    text: 'Manifesting goal for the semester: finish at least one side project before every major deadline. Small wins today, portfolio tomorrow. 🚀',
    tag: 'life',
    likes: 32,
  },
]