import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="not-found">
      <h1>Page not found</h1>
      <p>
        That page doesn't exist. <Link to="/">Go to the home page</Link>.
      </p>
    </section>
  )
}
