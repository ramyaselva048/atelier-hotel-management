import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Pencil, MapPin } from 'lucide-react'
import { fetchHotel, clearSelected } from '../redux/hotelsSlice'
import { imageUrl } from '../services/api'
import HotelMap from '../components/HotelMap'
export default function HotelDetailPage() {
  const {id}=useParams(), dispatch=useDispatch(), hotel=useSelector(s=>s.hotels.selected)
  useEffect(()=>{dispatch(fetchHotel(id));return ()=>dispatch(clearSelected())},[dispatch,id])
  if(!hotel) return <div className="loading">Loading hotel details...</div>
  return <><Helmet><title>{hotel.title} | Atelier Hotel Management</title><meta name="description" content={hotel.description.slice(0,155)}/></Helmet>
    <section className="detail-page"><Link to="/" className="back-link"><ArrowLeft size={16}/> Back to collection</Link>
      <div className="detail-heading"><div><span className="eyebrow">HOTEL DETAILS / {String(hotel.id).padStart(3,'0')}</span><h1>{hotel.title}</h1></div><Link className="outline-button" to={`/hotels/${hotel.id}/edit`}><Pencil size={16}/> Edit hotel</Link></div>
      {hotel.image_path && <img className="detail-image" src={imageUrl(hotel.image_path)} alt={`${hotel.title} hotel`}/>}
      <div className="detail-columns"><div><span className="eyebrow">THE STORY</span><h2>A stay with its own character.</h2><p className="detail-description">{hotel.description}</p></div><div className="price-panel"><span>PRICE PER NIGHT</span><strong>₹{Number(hotel.price).toLocaleString('en-IN')}</strong><small>INR / NIGHT</small></div></div>
      <div className="map-heading"><div><span className="eyebrow">FIND YOUR WAY</span><h2>Location</h2></div><span><MapPin size={15}/> {hotel.latitude}, {hotel.longitude}</span></div>
      <HotelMap hotel={hotel}/>
    </section>
  </>
}