// About.jsx — the "A bit about me" page on the "/about" route.
// Displays a bio, skill groups (loaded from data/skills.js), and an education
// section. Skills render as bordered pill badges grouped by category label.

import { skillGroups } from '../data/skills.js'
import ScrollReveal from '../components/ScrollReveal.jsx'
import photo from '../components/img/profilePicture.jpg'

export default function About() {
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
          <div className="glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 overflow-hidden aspect-[3/4]">
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
    </section>
  )
}
