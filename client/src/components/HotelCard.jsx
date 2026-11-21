import { Link } from 'react-router-dom'
import { MapPin, Pencil, Trash2, ArrowUpRight } from 'lucide-react'
import { imageUrl } from '../services/api'
export default function HotelCard({ hotel, onDelete }) {
  return <article className="hotel-card">
    <Link to={`/hotels/${hotel.id}`} className="card-image-wrap">
      {hotel.image_path ? <img src={imageUrl(hotel.image_path)} alt={`${hotel.title} hotel`} className="card-image"/> : <div className="image-placeholder">ATELIER / HOTELS</div>}
      <span className="image-tag">CURATED HOTEL</span><span className="image-arrow"><ArrowUpRight size={18}/></span>
    </Link>
    <div className="card-body">
      <div className="card-heading"><Link to={`/hotels/${hotel.id}`}><h3>{hotel.title}</h3></Link><strong>₹{Number(hotel.price).toLocaleString('en-IN')}<small> / night</small></strong></div>
      <p>{hotel.description}</p>
      <div className="card-bottom"><span><MapPin size={14}/> {Number(hotel.latitude).toFixed(3)}, {Number(hotel.longitude).toFixed(3)}</span>
        <div className="card-actions"><Link title="Edit hotel" to={`/hotels/${hotel.id}/edit`}><Pencil size={16}/></Link><button title="Delete hotel" onClick={() => onDelete(hotel)}><Trash2 size={16}/></button></div>
      </div>
    </div>
  </article>
}