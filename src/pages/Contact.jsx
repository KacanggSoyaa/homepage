// Contact.jsx — the contact section (anchored at #contact).
// Shows quick links (email/social) and a contact form. Uses EmailJS to
// deliver messages directly to the inbox.

import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { GithubIcon, LinkedinIcon, MailIcon, InstagramIcon } from '../components/Icons.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
          to_email: 'kacanggsoyaa18@gmail.com',
        },
        PUBLIC_KEY,
      )
      setSent(true)
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      console.error('Email send failed:', err, err?.text)
      setError(err?.text || 'Failed to send message. Please try again later.')
    } finally {
      setSending(false)
    }
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
          <a href="https://www.linkedin.com/in/danisnazri" className="flex items-center gap-2 font-mono text-sm text-ink-700 dark:text-paper-200/80 hover:text-amber transition-colors">
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
            disabled={sending}
            className="px-5 py-2.5 rounded-md bg-amber text-ink-950 font-mono text-sm font-medium hover:bg-amber-light hover:shadow-lg hover:shadow-amber/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send message'}
          </button>

          {/* Confirmation message shown after form submission */}
          {sent && (
            <p className="font-mono text-sm text-teal">
              Message sent! I will get back to you soon.
            </p>
          )}

          {/* Error message if sending fails */}
          {error && (
            <p className="font-mono text-sm text-red-500">
              {error}
            </p>
          )}
        </form>
      </ScrollReveal>
    </section>
  )
}
