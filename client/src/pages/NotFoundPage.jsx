import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <span>404 / HOTEL PAGE NOT FOUND</span>
      <h3>This hotel page could not be found.</h3>
      <Link className="primary-button" to="/">Return to hotel collection</Link>
    </div>
  )
}
