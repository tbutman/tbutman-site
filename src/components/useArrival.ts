import { useSyncExternalStore } from 'react'

// Where the hub's visitor came from (?from=): src/components/Arrival.tsx greets them, and the hub
// folds its maker sections for a mystery card's visitor.
export type From = 'mystery-card' | 'tag' | 'card'

const arrivedFrom = (): From | null => {
  const value = new URLSearchParams(window.location.search).get('from')
  return value === 'mystery-card' || value === 'tag' || value === 'card' ? value : null
}
// The query doesn't change while the page is open: nothing to subscribe to.
const subscribe = () => () => {}

/** Where the visitor came from (?from=), in the browser only: null on the server and for anyone else. */
export function useArrival(): From | null {
  return useSyncExternalStore(subscribe, arrivedFrom, () => null)
}

