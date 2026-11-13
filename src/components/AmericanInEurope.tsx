import type { ComponentProps } from 'react'
import { helloText } from '../content/hello'
import type { Locale } from '../i18n'

/**
 * "an american in europe" (Thomas): the pitch to North American companies, on /hello's default
 * version and on the home page between about and lab, from the same text (src/content/hello.ts).
 */
export default function AmericanInEurope({ locale, headingId, ...section }: { locale: Locale; headingId: string } & ComponentProps<'section'>) {
  const { american } = helloText[locale]

  return (
    <section className="section" aria-labelledby={headingId} {...section}>
      <div className="section-head">
        <h2 id={headingId}>{american.heading}</h2>
      </div>
      <p className="hello-bio">{american.intro}</p>
      <ul className="hello-points">
        {american.points.map(([lead, body]) => (
          <li key={lead}>
            <b>{lead}</b> {body}
          </li>
        ))}
      </ul>
    </section>
  )
}
