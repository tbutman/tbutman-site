import { type ComponentProps } from 'react'
import { Link as RouterLink } from 'react-router'
import { sitePath } from '../site'

/**
 * The router's Link, with its path written for this site (src/site.ts): on taptilde.com, /tilde/card
 * becomes /card, and a tbutman.com page becomes a full URL, which the router loads as a plain link.
 */
export function Link({ to, ...props }: ComponentProps<typeof RouterLink>) {
  return <RouterLink to={typeof to === 'string' ? sitePath(to) : to} {...props} />
}
