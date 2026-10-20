import type { ReactNode } from 'react'
import BoothHubSection from '../components/BoothHub'
import { appPage, cardsPage, fobsPage, usesPage } from '../content/booth/pages'
import BoothPage, { BoothBody } from '../pages/BoothPage'

// Everything the booth pages need, in one chunk that only they load (src/booth/index.tsx): docs'
// copy, the export's image index, and the components that draw them.

export const FobsPage = () => <BoothPage page={fobsPage} />
export const UsesPage = () => <BoothPage page={usesPage} />
export const AppPage = () => <BoothPage page={appPage} />
export const CardShowcase = ({ insert, end }: { insert: ReactNode; end: ReactNode }) => <BoothBody page={cardsPage} insert={insert} end={end} />
export const BoothHub = () => <BoothHubSection />
