import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { type Locale, prefersPortuguese, savedLocale, saveLocale } from '../i18n'

/**
 * EN · PT links for a translated page. A language picked with this switch is remembered and wins;
 * otherwise a phone set to Portuguese moves from the English version to the Portuguese one.
 */
export default function LangSwitch({ locale, paths }: { locale: Locale; paths: Record<Locale, string> }) {
  const navigate = useNavigate()

  useEffect(() => {
    const wanted = savedLocale() ?? (prefersPortuguese() ? 'pt' : null)
    if (wanted && wanted !== locale) navigate(paths[wanted], { replace: true })
  }, [locale, navigate, paths])

  return (
    <nav className="lang-switch" aria-label={locale === 'pt' ? 'Idioma' : 'Language'}>
      {(['en', 'pt'] as const).map((option) => (
        <Link
          key={option}
          to={paths[option]}
          lang={option === 'pt' ? 'pt-PT' : 'en'}
          aria-current={option === locale ? 'page' : undefined}
          onClick={() => saveLocale(option)}
        >
          {option === 'en' ? 'EN' : 'PT'}
        </Link>
      ))}
    </nav>
  )
}
