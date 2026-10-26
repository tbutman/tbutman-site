import { productExamples, productRenders } from '../content/booth/pages'
import { productSheet } from '../content/booth/products'
import ProductSection from './ProductSection'
import RichText from './RichText'

// A family's products from docs' product sheet, each the same way (ProductSection), with its renders
// (src/content/booth/pages.ts, productRenders). On Cards and Fobs it follows the hero; it's the
// whole of Home & desk.
export default function FamilyProducts({ family }: { family: string }) {
  const found = productSheet.families.find((item) => item.id === family)
  if (!found) return null
  return (
    <section id="products" className="section booth-section" aria-labelledby="products-heading">
      <div className="section-head">
        <h2 id="products-heading">
          <RichText text={found.name.toLowerCase()} />
        </h2>
      </div>
      <ul className="booth-product-index">
        {found.products.map((product) => (
          <li key={product.id}>
            <a href={`#${product.id}`}>
              <RichText text={product.name} />
            </a>
          </li>
        ))}
      </ul>
      {found.products.map((product) => (
        <ProductSection key={product.id} product={product} renders={productRenders[product.id]} example={productExamples[product.id]} page={family} />
      ))}
    </section>
  )
}
