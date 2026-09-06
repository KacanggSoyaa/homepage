// About.jsx — the "A bit about me" page on the "/about" route.
// Displays a bio, skill groups (loaded from data/skills.js), and an education
// section. Skills render as bordered pill badges grouped by category label.

import { useState } from 'react'
import { skillGroups } from '../data/skills.js'
import { blogPosts } from '../data/blog.js'
import BlogCard from '../components/BlogCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import photo from '../components/img/profilePicture.jpg'

// Date filter options for the Threads feed dropdown.
// Each value is "days back" — posts older than this are hidden.
// A null value means "show everything".
const FILTER_RANGES = {
  all: null,
  today: 0,
  week: 7,
  month: 30,
  year: 365,
}

// Label used in the dropdown for each filter option.
const FILTER_LABELS = {
  all: 'all time',
  today: 'today',
  week: 'last week',
  month: 'last month',
  year: 'last year',
}

export default function About() {
  // Which date range the Threads feed is filtered by (default: show everything).
  const [filter, setFilter] = useState('all')

  // Keep only posts newer than the cutoff for the selected range.
  const visiblePosts = blogPosts.filter((post) => {
    const daysBack = FILTER_RANGES[filter]
    if (daysBack === null) return true
    const postTime = new Date(`${post.date}T00:00:00`).getTime()
    return postTime >= Date.now() - daysBack * 86400000
  })

  return (
    <section className="container-page py-16 sm:py-20 max-w-3xl">
      {/* Section heading with terminal-style "~/about" prompt */}
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2 dark:text-amber">about</p>
        <h1 className="text-3xl font-mono font-semibold mb-8 dark:text-glow-amber">A bit about me</h1>
      </ScrollReveal>

      {/* Profile row: photo card on the left, bio text on the right.
          Stacks vertically on small screens and becomes two columns from md up. */}
      <div className="md:flex md:items-start md:gap-8">
        {/* Photo card — fixed at a 4:3 aspect ratio.
            To swap the image, replace src={photo} with a different import or URL. */}
        <ScrollReveal className="md:w-80 md:shrink-0 mb-8 md:mb-0">
          <div className="glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 overflow-hidden aspect-3/4">
            <img src={photo} alt="Danis Nazri" className="w-full h-full object-cover" />
          </div>
        </ScrollReveal>

        {/* Bio paragraph introducing who I am */}
        <ScrollReveal delay={100} className="flex-1">
          <p className="text-ink-700 dark:text-paper-200/80 leading-relaxed">
            I'm Danis Nazri, an IT student based in Kuala Lumpur, Malaysia,
            focused on software and app development. I'm passionate about
            website development and enjoy my time learn something that might be useful
            in the future.
          </p>
          <br />
          <p className="text-ink-700 dark:text-paper-200/80 leading-relaxed">
            I'm Also a person who loves nature and I enjoy spending time outdoors, 
            whether it's hiking, camping, or simply taking a walk in the park. I find 
            that being in nature helps me recharge and gain new perspectives.
          </p>
          <br />
          <p className="text-ink-700 dark:text-paper-200/80 leading-relaxed">
            I would call myself an ambivert, I enjoy socializing and meeting new people, 
            but I also value my alone time and peace.
          </p>
        </ScrollReveal>
      </div>

      {/* Skills section: iterates over skill groups from data/skills.js */}
      <ScrollReveal delay={150}>
        <h2 className="font-mono text-xl font-semibold mt-12 mb-5">Skills</h2>
      </ScrollReveal>
      <div className="space-y-6">
        {skillGroups.map((group, gi) => (
          <ScrollReveal key={group.label} delay={gi * 100}>
            <div>
              {/* Group label (e.g. "LANGUAGES", "FRAMEWORKS & TOOLS") */}
              <p className="font-mono text-xs uppercase tracking-wide text-ink-600 dark:text-paper-200/50 mb-2 hover:text-amber transition-colors">
                {group.label}
              </p>
              {/* Skill pills rendered as bordered badges */}
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="font-mono text-xs px-3 py-1.5 rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/80 hover:text-amber transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Education section with a left border accent */}
      <ScrollReveal delay={100}>
        <h2 className="font-mono text-xl font-semibold mt-12 mb-5">Education</h2>
        {/* TODO: replace with real education/experience */}
        <div className="border-l-2 border-ink-200/20 dark:border-paper-50/15 pl-5">
          <p className="font-mono text-sm font-medium hover:text-amber transition-colors">Sijil Pelajaran Malaysia (SPM)</p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-1">
            Finished my SPM in 2023 from SMK Dato' Wan Ahmad Rasdi, Perak, Malaysia
          </p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-2">
            In my highschool, I was person who was strongly introverted and doesn't like to speak in front of people.
            I was also a person who was not good at managing my time and I was not a good team player.
          </p>
        </div>
        <br />
        <div className="border-l-2 border-ink-200/20 dark:border-paper-50/15 pl-5">
          <p className="font-mono text-sm font-medium hover:text-amber transition-colors">Diploma in Information Technology</p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-1">
            Expected graduation in early 2027 from Politeknik Ungku Omar (PUO)
          </p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-2">
            I'm quite actively involved in my college's IT club, and learn to be brave
            to speak in front of people. I also learn to be a good team player and
            how to manage my time wisely.
          </p>
        </div>
        <br />
        <div className="border-l-2 border-ink-200/20 dark:border-paper-50/15 pl-5">
          <p className="font-mono text-sm font-medium hover:text-amber transition-colors">Internship at Consurv Technic Sdn Bhd</p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-1">
            Role as a IT Engineer Intern, from 3 August 2026 to 15th December 2026
          </p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-2">
            During my internship, I was able to learn a lot about the IT industry and gain valuable experience.
            I was also able to improve my skills in programming, networking, and troubleshooting. 
          </p>
        </div>
      </ScrollReveal>

      {/* Blog / threads section: a scrollable glass card containing the posts.
          The wrapper has a fixed height with its own internal scrollbar so you
          can scroll through each entry without leaving the page. */}
      <div id="threads">
        <ScrollReveal delay={100}>
          <h2 className="font-mono text-xl font-semibold mt-12 mb-5 dark:text-glow-amber">Threads</h2>
          <p className="text-ink-700 dark:text-paper-200/80 max-w-xl mb-5 text-sm">
            Daily thoughts, updates, and small wins. Scroll through the feed below
            <code className="font-mono text-xs bg-ink-900/5 dark:bg-paper-50/10 px-1.5 py-0.5 rounded ml-1">
              src/data/blog.js
            </code>
          </p>
          <div className="glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 p-2">
            {/* Filter bar pinned to the top-right of the card */}
            <div className="flex items-center justify-end px-2 pt-2 pb-1">
              <div className="relative">
                <select
                  aria-label="Filter threads by date"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none font-mono text-xs pl-3 pr-8 py-1.5 rounded-md bg-transparent border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/80 hover:border-amber/60 hover:text-amber dark:hover:text-glow-amber transition-all cursor-pointer focus:outline-none"
                >
                  {Object.keys(FILTER_LABELS).map((key) => (
                    <option key={key} value={key} className="bg-paper-50 dark:bg-space-900">
                      {FILTER_LABELS[key]}
                    </option>
                  ))}
                </select>
                {/* Custom chevron so the dropdown matches the terminal aesthetic */}
                <span aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-600 dark:text-paper-200/60">
                  ▾
                </span>
              </div>
            </div>

            {/* Scrollable thread list — tall like an IG post */}
            <div className="relative">
              <div className="max-h-[42rem] overflow-y-auto feed-scroll">
                <div className="flex flex-col gap-2">
                  {visiblePosts.length > 0 ? (
                    visiblePosts.map((post, i) => (
                      <div
                        key={post.id}
                        className={i > 0 ? 'border-t border-ink-200/10 dark:border-paper-50/10 pt-2' : ''}
                      >
                        <BlogCard post={post} />
                      </div>
                    ))
                  ) : (
                    <p className="font-mono text-xs text-ink-600 dark:text-paper-200/50 text-center py-10">
                      no threads in this range yet
                    </p>
                  )}
                </div>
              </div>
              {/* Subtle fade at the bottom to hint there's more to scroll */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-lg bg-gradient-to-t from-paper-50/70 dark:from-space-950/70 to-transparent" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
