import { profile } from './content/profile'
import { processIntro } from './content/process'
import { findProject } from './content/projects'

export type Meta = {
  title: string
  description: string
  /** Keep the page out of search results and the sitemap. */
  noindex?: boolean
}

const defaultDescription = `${profile.name} is a ${profile.role.toLowerCase()} in ${profile.location}. ${profile.lede}`

export function getMeta(pathname: string): Meta {
  if (pathname === '/') {
    return { title: `${profile.name} · ${profile.role}`, description: defaultDescription }
  }
  if (pathname === '/how-i-work') {
    return { title: `${processIntro.title} · ${profile.name}`, description: processIntro.lede }
  }
  if (pathname === '/thanks') {
    return { title: `Message sent · ${profile.name}`, description: defaultDescription, noindex: true }
  }
  if (pathname === '/cv') {
    return { title: `CV · ${profile.name}`, description: defaultDescription }
  }
  const project = findProject(pathname.match(/^\/work\/([^/]+)$/)?.[1])
  if (project) {
    return { title: `${project.title} · ${profile.name}`, description: project.summary }
  }
  return { title: `Not found · ${profile.name}`, description: defaultDescription }
}
