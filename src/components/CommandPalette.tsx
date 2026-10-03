import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { copyText } from '../lib/clipboard'

type Command = {
  id: string
  group: string
  label: string
  hint?: string
  keywords?: string
  /** Return 'keep-open' to leave the palette open after running. */
  run: () => unknown
}

const noSubscription = () => () => {}
const clientShortcut = () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K')
// Platform is only known in the browser, so prerendered HTML uses the Mac label.
const serverShortcut = () => '⌘K'

export default function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const shortcut = useSyncExternalStore(noSubscription, clientShortcut, serverShortcut)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const listId = useId()

  const commands = useMemo<Command[]>(() => {
    const goToSection = (id: string) => () => {
      if (pathname === '/') document.getElementById(id)?.scrollIntoView()
      navigate(`/#${id}`)
    }
    const openExternal = (url: string) => () => {
      window.open(url, '_blank', 'noopener')
    }

    return [
      { id: 'home', group: 'go to', label: 'Home', run: () => navigate('/') },
      { id: 'work', group: 'go to', label: 'Selected work', keywords: 'projects portfolio', run: goToSection('work') },
      { id: 'lab', group: 'go to', label: 'Lab', keywords: 'hardware esp32 robots', run: goToSection('lab') },
      { id: 'about', group: 'go to', label: 'About', run: goToSection('about') },
      { id: 'contact', group: 'go to', label: 'Contact', keywords: 'email reach', run: goToSection('contact') },
      { id: 'hire', group: 'go to', label: 'Work with me', keywords: 'hire contract freelance full-time', run: goToSection('hire') },
      { id: 'experience', group: 'go to', label: 'Experience', keywords: 'jobs history', run: goToSection('experience') },
      { id: 'cv', group: 'go to', label: 'CV', keywords: 'resume', run: () => navigate('/cv') },
      {
        id: 'how-i-work',
        group: 'go to',
        label: 'How I build with AI agents',
        keywords: 'process workflow claude codex',
        run: () => navigate('/how-i-work'),
      },
      ...projects.map((project) => ({
        id: `project-${project.slug}`,
        group: 'case studies',
        label: project.title,
        hint: project.kind.toLowerCase(),
        keywords: project.stack.join(' '),
        run: () => navigate(`/work/${project.slug}`),
      })),
      ...projects
        .filter((project) => project.live)
        .map((project) => ({
          id: `live-${project.slug}`,
          group: 'case studies',
          label: `Open ${project.live!.replace(/^https:\/\//, '')}`,
          hint: 'live ↗',
          keywords: project.title,
          run: openExternal(project.live!),
        })),
      {
        id: 'copy-email',
        group: 'contact',
        label: 'Copy email address',
        hint: copied ? 'copied ✓' : profile.email,
        run: () => {
          void copyText(profile.email).then((ok) => {
            if (ok) setCopied(true)
            else window.location.href = `mailto:${profile.email}`
          })
          return 'keep-open'
        },
      },
      {
        id: 'email',
        group: 'contact',
        label: 'Send an email',
        run: () => {
          window.location.href = `mailto:${profile.email}`
        },
      },
      {
        id: 'cv-pdf',
        group: 'contact',
        label: 'Download CV (PDF)',
        keywords: 'resume',
        run: () => {
          window.location.href = profile.cvPdf
        },
      },
      ...profile.links.map((link) => ({
        id: link.label.toLowerCase(),
        group: 'contact',
        label: link.label,
        hint: '↗',
        run: openExternal(link.href),
      })),
    ]
  }, [copied, navigate, pathname])

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return commands
    return commands.filter((command) => {
      const text = `${command.label} ${command.group} ${command.hint ?? ''} ${command.keywords ?? ''}`.toLowerCase()
      return terms.every((term) => text.includes(term))
    })
  }, [commands, query])

  const show = () => {
    setQuery('')
    setActive(0)
    setCopied(false)
    setOpen(true)
  }

  const close = () => dialogRef.current?.close()

  // The dialog element owns visibility; React state just mirrors it.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        if (dialogRef.current?.open) dialogRef.current.close()
        else show()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(close, 900)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  const runCommand = (command: Command | undefined) => {
    if (!command) return
    if (command.run() !== 'keep-open') close()
  }

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (results.length ? (index + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (results.length ? (index - 1 + results.length) % results.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(results[active])
    }
  }

  let lastGroup = ''

  return (
    <>
      <button
        type="button"
        className="palette-trigger"
        onClick={show}
        aria-label="Open menu"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <span className="trigger-label">menu</span>
        <kbd>{shortcut}</kbd>
      </button>

      <dialog
        ref={dialogRef}
        className="palette"
        aria-label="Command menu"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) close()
        }}
      >
        {open && (
          <>
            <input
              ref={inputRef}
              className="palette-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              placeholder="Type a command or search…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onInputKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
            <ul id={listId} className="palette-list" role="listbox" aria-label="Commands">
              {results.map((command, index) => {
                const heading = command.group !== lastGroup ? command.group : null
                lastGroup = command.group
                return (
                  <li key={command.id} role="presentation">
                    {heading && (
                      <span className="palette-group" aria-hidden="true">
                        {heading}
                      </span>
                    )}
                    <div
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === active}
                      className="palette-option"
                      onMouseMove={() => setActive(index)}
                      onClick={() => runCommand(command)}
                    >
                      <span>{command.label}</span>
                      {command.hint && <span className="palette-hint">{command.hint}</span>}
                    </div>
                  </li>
                )
              })}
              {!results.length && <li className="palette-empty">No matches for “{query}”</li>}
            </ul>
            <p className="palette-footer" aria-hidden="true">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </p>
          </>
        )}
      </dialog>
    </>
  )
}
