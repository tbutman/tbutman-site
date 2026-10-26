import { familyPaths, useProducts } from '../content/booth/pages'
import { productSheet } from '../content/booth/products'
import type { Placement, Product, ProductField, ProductFieldKey } from '../content/booth/types'
import { Placed } from './BoothRender'
import RichText from './RichText'

// One core product from docs' product sheet (src/content/booth/products.ts), the same way on every
// family page (finish-line plan §3): what it is and the problem it solves, its renders, then how it
// works, its uses, its options, its sizes, what pairs well with it, and how to make your own. Its
// heading is the product's name in the sheet, with its availability (Printable now, Coming soon).
// Options, sizes, what you need and the files fold into "for makers". Docs' Notes (the Model Maker's
// setting names, gates, status, sources) never reach the site (scripts/booth-products.mjs).

const SHOWN: [ProductFieldKey, string][] = [
  ['howItWorks', 'how it works'],
  ['uses', 'use cases'],
  ['pairsWith', 'pairs well with'],
]
// For makers (visitor round 1, items 5–7): folded, so the page reads as outcomes first.
const MAKERS: [ProductFieldKey, string][] = [
  ['options', 'options'],
  ['specs', 'size and materials'],
  ['files', 'get the files'],
]

// A list item's bold lead ("**Base tag:** …", "**Save my contact:** …") as a link: to that product's
// section, or to that use on the Use cases page. Anything it doesn't recognize stays as it is.
const products = productSheet.families.flatMap((family) => family.products.map((product) => ({ product, path: familyPaths[family.id] })))
function linked(key: ProductFieldKey, item: string): string {
  const lead = item.match(/^\*\*([^*\]]+?)(:?)\*\*/)
  if (!lead) return item
  const [whole, name, colon] = lead
  let href: string | undefined
  if (key === 'pairsWith') {
    const match = products.find(({ product }) => product.name.toLowerCase().startsWith(name.toLowerCase()) || name.toLowerCase().startsWith(product.name.toLowerCase()))
    if (match?.path) href = `${match.path}#${match.product.id}`
  }
  if (key === 'uses') {
    const use = Object.entries(useProducts).find(([, pattern]) => pattern.test(name))
    if (use) href = `/tilde/uses#${use[0]}`
  }
  return href ? item.replace(whole, `**[${name}](${href})${colon}**`) : item
}

// Docs writes a field's text after its label and a colon, in lowercase; on its own it starts a sentence.
const sentence = (text: string) => text.replace(/^([^A-Za-z]*)([a-z])/, (_, lead: string, letter: string) => lead + letter.toUpperCase())

function Field({ name, field }: { name: ProductFieldKey; field: ProductField }) {
  return (
    <>
      {field.text && (
        <p>
          <RichText text={sentence(field.text)} />
        </p>
      )}
      {field.items.length > 0 && (
        <ul className="booth-list">
          {field.items.map((item) => (
            <li key={item}>
              <RichText text={linked(name, item)} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function ProductSection({ product, renders, example, page }: { product: Product; renders?: Placement; example?: string; page?: string }) {
  const { fields } = product
  return (
    <section id={product.id} className="booth-product" aria-labelledby={`${product.id}-heading`}>
      <h3 id={`${product.id}-heading`} className="booth-h3">
        <RichText text={product.name} />
      </h3>
      {fields.availability?.text && (
        <p className={`booth-availability${/coming soon/i.test(fields.availability.text) && !/printable now/i.test(fields.availability.text) ? ' soon' : ''}`}>
          <RichText text={fields.availability.text} />
        </p>
      )}
      {fields.oneLiner && (
        <p className="booth-product-lead">
          <RichText text={sentence(fields.oneLiner.text)} />
        </p>
      )}
      {fields.problem && (
        <p className="product-body booth-p">
          <RichText text={sentence(fields.problem.text)} />
        </p>
      )}
      {/* The note page isn't a route of this app: a plain link, so the browser loads it. */}
      {example && (
        <p className="booth-example">
          <a className="button" href={example}>
            see an example →
          </a>
        </p>
      )}
      {renders && <Placed placement={renders} page={page ?? ''} marker={product.name} />}
      <dl className="booth-product-facts">
        {SHOWN.filter(([key]) => fields[key]).map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>
              <Field name={key} field={fields[key] as ProductField} />
            </dd>
          </div>
        ))}
      </dl>
      {(fields.whatYouNeed || MAKERS.some(([key]) => fields[key])) && (
        <details className="booth-makers">
          <summary>for makers</summary>
          {fields.whatYouNeed && (
            <div className="booth-need panel">
              <b>what you need</b>
              <Field name="whatYouNeed" field={fields.whatYouNeed} />
            </div>
          )}
          <dl className="booth-product-facts">
            {MAKERS.filter(([key]) => fields[key]).map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  <Field name={key} field={fields[key] as ProductField} />
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </section>
  )
}
