// TrackSearch.jsx — the filter field above the tracklist.
//
// It holds no query of its own and filters nothing: it renders what it is given
// and reports what has been typed. Keeping it controlled is what lets the page
// drive the result count and the "nothing matched" row off the same string, so
// the three can never disagree about how many tracks are showing.
//
// What it does decide is the ergonomics, because an input is easy to get wrong:
// type="search" so a phone keyboard opens with a search key and Escape clears
// the field, a visible clear button so the gesture works on a touch screen too,
// and focus returned to the field afterwards so clearing does not strand the
// caret at the top of the document.

import { useId, useRef } from 'react'
import { CloseIcon, SearchIcon } from './Icons.jsx'

export default function TrackSearch({ value, onChange, className = '' }) {
  // A real <label> rather than an aria-label: it names the field for a screen
  // reader and, because it is hidden rather than dropped, keeps the visible
  // placeholder from being the only description of the control.
  const id = useId()
  const inputRef = useRef(null)

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search this tracklist by song title or artist
      </label>

      <SearchIcon
        width="15"
        height="15"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600 dark:text-paper-200/50 pointer-events-none"
      />

      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="search title or artist"
        autoComplete="off"
        spellCheck="false"
        className="w-full py-2 pl-9 pr-9 rounded-md border border-ink-200/20
                   dark:border-paper-50/15
                   bg-ink-900/5 dark:bg-paper-50/5
                   font-mono text-xs text-ink-900 dark:text-paper-50
                   placeholder:text-ink-600/70 dark:placeholder:text-paper-200/40
                   focus:border-amber/60 transition-colors
                   [&::-webkit-search-cancel-button]:appearance-none"
      />

      {/* Only rendered while there is something to clear, so the resting field
          is nothing but the placeholder. */}
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center
                     justify-center rounded-full text-ink-600 dark:text-paper-200/60
                     hover:text-amber transition-colors"
        >
          <CloseIcon width="14" height="14" />
        </button>
      ) : null}
    </div>
  )
}
