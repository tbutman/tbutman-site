import support from '../content/support.json'

// taptilde.com/support (briefs/support.md): the app and every model stay free; this is how people help.
// One button per way to give, each only when its URL is set in src/content/support.json.
const methods: [keyof typeof support, string][] = [
  ['kofi', 'Ko-fi'],
  ['sponsors', 'GitHub Sponsors'],
  ['stripe', 'Pay what you want (Stripe)'],
]

export default function SupportPage() {
  const shown = methods.filter(([key]) => typeof support[key] === 'string' && /^https:\/\//.test(support[key]))
  return (
    <article className="product booth">
      <section className="product-hero booth-hero booth-hero-text-only" aria-labelledby="support-heading">
        <div className="product-hero-text">
          <p className="status">
            <span className="status-dot" aria-hidden="true" />
            free · open source
          </p>
          <p className="product-name">
            <b>~</b> Tilde
          </p>
          <h1 id="support-heading">Support Tilde.</h1>
          <p className="lede">
            The app and every model are free, and they stay that way. If Tilde saved you time, you can help keep it going.
          </p>
          {shown.length > 0 && (
            <div className="button-row">
              {shown.map(([key, label], index) => (
                <a key={key} className={index === 0 ? 'button primary' : 'button'} href={support[key]}>
                  {label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="section" aria-labelledby="support-what-heading">
        <div className="section-head">
          <h2 id="support-what-heading">what it pays for</h2>
        </div>
        <ul className="booth-list">
          <li>The time to build Tilde, test it on real phones, and answer questions.</li>
          <li>Filament and NFC stickers for every test print of the models.</li>
          <li>Keeping the app free and open source, with no ads, no account and no tracking.</li>
        </ul>
        <p className="product-body booth-p">Thank you.</p>
      </section>
    </article>
  )
}
