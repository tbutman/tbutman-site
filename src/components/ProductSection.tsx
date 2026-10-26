import type { Placement, Product, ProductField, ProductFieldKey } from '../content/booth/types'
import { Placed } from './BoothRender'
import RichText from './RichText'

// One core product from docs' product sheet (src/content/booth/products.ts), the same way on every
// family page (finish-line plan §3): what it is and the problem it solves, its renders, then how it
// works, its uses, its options, its sizes, what pairs well with it, and how to make your own. Status
// and sources are for us and the checker, never shown.

const SHOWN: [ProductFieldKey, string][] = [
  ['howItWorks', 'how it works'],
  ['uses', 'use cases'],
  ['options', 'options'],
  ['sizes', 'sizes and materials'],
  ['pairsWith', 'pairs well with'],
  ['makeYourOwn', 'make your own'],
]

function Field({ field }: { field: ProductField }) {
  return (
    <>
      {field.text && (
        <p>
          <RichText text={field.text} />
        </p>
      )}
      {field.items.length > 0 && (
        <ul className="booth-list">
          {field.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function ProductSection({ product, renders, page }: { product: Product; renders?: Placement; page?: string }) {
  const { fields } = product
  return (
    <section id={product.id} className="booth-product" aria-labelledby={`${product.id}-heading`}>
      <h3 id={`${product.id}-heading`} className="booth-h3">
        <RichText text={fields.name?.text || product.name} />
      </h3>
      {fields.oneLiner && (
        <p className="booth-product-lead">
          <RichText text={fields.oneLiner.text} />
        </p>
      )}
      {fields.problem && (
        <p className="product-body booth-p">
          <RichText text={fields.problem.text} />
        </p>
      )}
      {renders && <Placed placement={renders} page={page ?? ''} marker={product.name} />}
      <dl className="booth-product-facts">
        {SHOWN.filter(([key]) => fields[key]).map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>
              <Field field={fields[key] as ProductField} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
