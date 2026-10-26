import FamilyProducts from '../components/FamilyProducts'
import NextStop from '../components/NextStop'
import RichText from '../components/RichText'
import { homePage } from '../content/booth/pages'
import { familyLine } from '../content/booth/products'
import { Stations } from './BoothPage'

// /tilde/home, Home & desk (finish-line plan §7): docs' product sheet alone. Its opening is the
// family's line from the sheet's "Four families"; then each product, the same way as on Cards and
// Fobs. No station copy: it has no box at the booth.
export default function HomePage() {
  return (
    <article className="product booth">
      <section className="product-hero booth-hero booth-hero-text-only" aria-labelledby="home-heading">
        <div className="product-hero-text">
          <p className="status">
            <span className="status-dot" aria-hidden="true" />
            {homePage.status}
          </p>
          <p className="product-name">
            <b>~</b> Tilde
          </p>
          <h1 id="home-heading">{homePage.name}</h1>
          <p className="lede">
            <RichText text={familyLine('home') ?? ''} />
          </p>
          <div className="button-row">
            <a className="button primary" href="#products">
              the products ↓
            </a>
          </div>
        </div>
      </section>
      <FamilyProducts family="home" />
      <NextStop from="home" />
      <Stations current="home" />
    </article>
  )
}
