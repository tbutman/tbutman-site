import { type ComponentType, lazy, Suspense } from 'react'
import * as direct from './direct'

// The booth pages' content (docs' copy and the render index) stays out of the rest of the site: the
// browser loads it as its own chunk, only on /tilde, /tilde/card, /tilde/fobs and /tilde/uses. The
// prerender draws it in full, and a Suspense boundary keeps that HTML on screen until the chunk has
// loaded and hydrated. In the browser build ./direct is ./none (vite.config.ts), so each part loads.
function part<P extends object>(direct: ComponentType<P> | null, load: () => Promise<ComponentType<P>>): ComponentType<P> {
  const Component = direct ?? lazy(async () => ({ default: await load() }))
  return (props: P) => (
    <Suspense>
      <Component {...props} />
    </Suspense>
  )
}

export const FobsPage = part(direct.FobsPage, () => import('./parts').then((module) => module.FobsPage))
export const UsesPage = part(direct.UsesPage, () => import('./parts').then((module) => module.UsesPage))
export const CardShowcase = part(direct.CardShowcase, () => import('./parts').then((module) => module.CardShowcase))
export const BoothHub = part(direct.BoothHub, () => import('./parts').then((module) => module.BoothHub))
