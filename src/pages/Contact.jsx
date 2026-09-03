import { useState } from 'react'
import { GithubIcon, LinkedinIcon, MailIcon, InstagramIcon } from '../components/Icons.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to a real backend or email service (e.g. Formspree, EmailJS)
    console.log('Contact form submitted:', form)
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="container-page py-16 sm:py-20 max-w-2xl">
      <p className="prompt font-mono text-sm text-amber mb-2">contact</p>
      <h1 className="text-3xl font-mono font-semibold mb-3">Let's talk</h1>
      <p className="text-ink-700 dark:text-paper-200/80 mb-10">
        Reach out directly, or send a message below.
      </p>

      <div className="flex items-center gap-5 mb-10">
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

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <button
          type="submit"
          className="px-5 py-2.5 rounded-md bg-amber text-ink-950 font-mono text-sm font-medium hover:bg-amber-light transition-colors"
        >
          Send message
        </button>

        {sent && (
          <p className="font-mono text-sm text-teal">
            Message logged to console — connect a backend to actually send it.
          </p>
        )}
      </form>
    </section>
  )
}
