// Contact.jsx — the contact section (anchored at #contact).
// Shows quick links (email/social) and a contact form. The form currently
// only logs submissions to the console — connect a backend service (e.g.
// Formspree or EmailJS) to actually deliver messages.

import { useState } from 'react'
import { GithubIcon, LinkedinIcon, MailIcon, InstagramIcon } from '../components/Icons.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

export default function Contact() {
  // Form state: tracks the current values of name, email, and message fields.
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  // Tracks whether the form has been submitted (shows confirmation message).
  const [sent, setSent] = useState(false)

  // Update the corresponding field in form state when the user types.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle form submission: prevent default browser submit, log to console,
  // show confirmation, and reset the form fields.
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to a real backend or email service (e.g. Formspree, EmailJS)
    console.log('Contact form submitted:', form)
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    // Section with id="contact" for anchor scrolling from the navbar
    <section id="contact" className="container-page py-16 sm:py-20 max-w-2xl">
      {/* Section heading with terminal-style "~/contact" prompt */}
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2 dark:text-amber">contact</p>
        <h1 className="text-3xl font-mono font-semibold mb-3 dark:text-glow-amber">Let's talk</h1>
        <p className="text-ink-700 dark:text-paper-200/80 mb-10">
          Reach out directly, or send a message below.
        </p>
      </ScrollReveal>

      {/* Social media / email quick-links row */}
      <ScrollReveal delay={100}>
        <div className="flex flex-wrap items-center gap-5 mb-10">
          <a href="mailto:kacanggsoyaa18@gmail.com" className="flex items-center gap-2 font-mono text-sm text-ink-700 dark:text-paper-200/80 hover:text-amber transition-colors">
            <MailIcon /> email
          </a>
          <a href="https://github.com/KacanggSoyaa" className="flex items-center gap-2 font-mono text-sm text-ink-700 dark:text-paper-200/80 hover:text-amber transition-colors">
            <GithubIcon width="18" height="18" /> github
          </a>
          <a href="#" className="flex items-center gap-2 font-mono text-sm text-ink-700 dark:text-paper-200/80 hover:text-amber transition-colors">
            <LinkedinIcon width="18" height="18" /> linkedin
          </a>
          <a href="https://www.instagram.com/dnazzry_" className="flex items-center gap-2 font-mono text-sm text-ink-700 dark:text-paper-200/80 hover:text-amber transition-colors">
            <InstagramIcon width="18" height="18" /> instagram
          </a>
        </div>
      </ScrollReveal>

      {/* Contact form with name, email, and message fields */}
      <ScrollReveal delay={200}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name input field */}
          <div>
            <label htmlFor="name" className="font-mono text-xs text-ink-600 dark:text-paper-200/60">
              name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-ink-200/20 dark:border-paper-50/15 bg-transparent px-3.5 py-2.5 text-sm focus:border-amber/60 outline-none transition-colors"
            />
          </div>

          {/* Email input field */}
          <div>
            <label htmlFor="email" className="font-mono text-xs text-ink-600 dark:text-paper-200/60">
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-ink-200/20 dark:border-paper-50/15 bg-transparent px-3.5 py-2.5 text-sm focus:border-amber/60 outline-none transition-colors"
            />
          </div>

          {/* Message textarea */}
          <div>
            <label htmlFor="message" className="font-mono text-xs text-ink-600 dark:text-paper-200/60">
              message
            </label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              value={form.message}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-ink-200/20 dark:border-paper-50/15 bg-transparent px-3.5 py-2.5 text-sm focus:border-amber/60 outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-amber text-ink-950 font-mono text-sm font-medium hover:bg-amber-light hover:shadow-lg hover:shadow-amber/25 transition-all"
          >
            Send message
          </button>

          {/* Confirmation message shown after form submission */}
          {sent && (
            <p className="font-mono text-sm text-teal">
              Message logged to console — connect a backend to actually send it.
            </p>
          )}
        </form>
      </ScrollReveal>
    </section>
  )
}
