import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="not-found">
      <p className="status">
        <span className="status-dot" aria-hidden="true" />
        404
      </p>
      <h1>Nothing at this path.</h1>
      <p>
        The page may have moved. <Link to="/">Back to the home page →</Link>
      </p>
    </section>
  )
}
