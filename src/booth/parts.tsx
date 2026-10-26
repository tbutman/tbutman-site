import type { ReactNode } from 'react'
import BoothHubSection from '../components/BoothHub'
import NextStopCard from '../components/NextStop'
import { appPage, cardsPage, fobsPage, usesPage } from '../content/booth/pages'
import TildeHub from '../components/TildeHub'
import BoothPage, { BoothBody } from '../pages/BoothPage'
import HomeDesk from '../pages/HomePage'

// Everything the booth pages need, in one chunk that only they load (src/booth/index.tsx): docs'
// copy, the export's image index, and the components that draw them.

export const FobsPage = () => <BoothPage page={fobsPage} />
export const UsesPage = () => <BoothPage page={usesPage} />
// The App page with the app's own sections (install, questions: src/pages/Tilde.tsx) before See more.
export const AppPage = ({ insert }: { insert: ReactNode }) => <BoothPage page={appPage} insert={insert} insertBefore="see-more" />
export const HomePage = () => <HomeDesk />
export const Hub = () => <TildeHub />
export const CardShowcase = ({ insert, end }: { insert: ReactNode; end: ReactNode }) => <BoothBody page={cardsPage} insert={insert} end={end} />
export const BoothHub = () => <BoothHubSection />
export const NextStop = ({ from }: { from: string }) => <NextStopCard from={from} />
