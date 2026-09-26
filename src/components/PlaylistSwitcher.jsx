// PlaylistSwitcher.jsx — the row of playlists above the player.
//
// One folder under public/audio is one playlist, and its id is the last part of
// its URL, so switching playlists is a navigation: /music/mood, /music/focus.
// Links rather than buttons, so the back button, a middle click and a copied
// link all behave the way the rest of the site does.
//
// The highlighted playlist is the one loaded in the player, not the one in the
// URL, because /music with no id opens whichever playlist you had last.

import { Link } from 'react-router-dom'
import { usePlayer } from '../player/PlayerContext.jsx'
import { QueueIcon } from './Icons.jsx'

export default function PlaylistSwitcher({ className = '' }) {
  const { playlists, activeId } = usePlayer()

  // One playlist is not a choice, so there is nothing to switch between. The
  // row appears by itself when a second folder shows up in public/audio.
  if (playlists.length < 2) return null

  return (
    <nav aria-label="Playlists" className={`flex flex-wrap items-center gap-2 ${className}`}>
      {playlists.map((playlist) => {
        const isActive = playlist.id === activeId
        return (
          <Link
            key={playlist.id}
            to={`/music/${playlist.id}`}
            aria-current={isActive ? 'page' : undefined}
            className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs transition-colors ${
              isActive
                ? 'border-amber/50 bg-amber/10 text-amber'
                : 'border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/70 hover:border-amber/40 hover:text-amber'
            }`}
          >
            {/* The active playlist gets the queue glyph, which is the same mark
                the dock uses for "the tracklist" — one idea, one icon. */}
            {isActive ? <QueueIcon width="13" height="13" className="shrink-0" /> : null}
            <span className="truncate max-w-[14rem]">{playlist.title}</span>
            <span className="tabular-nums opacity-60">{playlist.tracks.length}</span>
          </Link>
        )
      })}
    </nav>
  )
}
