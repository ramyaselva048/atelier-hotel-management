import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ImagePlus, Save } from 'lucide-react'
import api, { imageUrl } from '../services/api'
import { createHotel, updateHotel } from '../redux/hotelsSlice'
import { Link } from 'react-router-dom'

const blank = { title:'', description:'', latitude:'', longitude:'', price:'' }
export default function HotelFormPage() {
  const { id } = useParams(), editing = Boolean(id), dispatch = useDispatch(), navigate = useNavigate()
  const [form,setForm] = useState(blank), [file,setFile] = useState(null), [preview,setPreview] = useState(''), [error,setError] = useState(''), [saving,setSaving] = useState(false)
  useEffect(()=>{ if(editing) api.get(`/hotels/${id}`).then(({data})=>{setForm(data.hotel);setPreview(data.hotel.image_path ? imageUrl(data.hotel.image_path) : '')}).catch(()=>setError('Unable to load this hotel.')) },[id,editing])
  const change = e => setForm({...form,[e.target.name]:e.target.value})
  const choose = e => { const selected=e.target.files?.[0]; if(!selected)return; if(!selected.type.startsWith('image/')){setError('Please select an image file.');return} if(selected.size>5*1024*1024){setError('Image must be smaller than 5 MB.');return} setFile(selected);setPreview(URL.createObjectURL(selected));setError('') }
  const submit = async e => {
    e.preventDefault(); setError('')
    if(!form.title.trim() || !form.description.trim() || form.latitude==='' || form.longitude==='' || form.price===''){setError('Please complete every required field.');return}
    if(Number(form.latitude)<-90||Number(form.latitude)>90||Number(form.longitude)<-180||Number(form.longitude)>180){setError('Enter valid latitude (-90 to 90) and longitude (-180 to 180).');return}
    if(Number(form.price)<=0){setError('Price must be greater than zero.');return}
    const data=new FormData(); Object.entries(form).forEach(([k,v])=>data.append(k,v)); if(file)data.append('image',file)
    setSaving(true)
    try { if(editing) await dispatch(updateHotel({id,formData:data})).unwrap(); else await dispatch(createHotel(data)).unwrap(); navigate('/') }
    catch(err){setError(err || 'Could not save hotel. Check backend/database connection.')}
    finally{setSaving(false)}
  }
  return <><Helmet><title>{editing?'Edit hotel':'Add a hotel'} | Atelier Stays</title><meta name="description" content="Create or update a hotel listing."/></Helmet>
    <section className="form-page"><Link to="/" className="back-link"><ArrowLeft size={16}/> Back to collection</Link><div className="form-intro"><span className="eyebrow">HOTEL WORKSPACE / {editing?'02':'01'}</span><h1>{editing?'Refine the details.':'Add a new hotel.'}</h1><p>Enter the hotel details, pricing and location information.</p></div>
      <form className="hotel-form" onSubmit={submit}><div className="form-main">
        <div className="form-section-title"><span>01</span><div><h2>Hotel information</h2><p>Enter the essential hotel information.</p></div></div>
        <label className="field"><span>HOTEL NAME <b>*</b></span><input name="title" value={form.title} onChange={change} maxLength="140" placeholder="e.g. The Fern House" required/></label>
        <label className="field"><span>DESCRIPTION <b>*</b></span><textarea name="description" value={form.description} onChange={change} rows="5" maxLength="2000" placeholder="Describe the hotel, facilities and guest experience..." required/></label>
        <div className="form-section-title location-title"><span>02</span><div><h2>Location coordinates</h2><p>Pinpoint the hotel on the map.</p></div></div>
        <div className="two-fields"><label className="field"><span>LATITUDE <b>*</b></span><input type="number" step="any" name="latitude" value={form.latitude} onChange={change} placeholder="11.0168" required/></label><label className="field"><span>LONGITUDE <b>*</b></span><input type="number" step="any" name="longitude" value={form.longitude} onChange={change} placeholder="76.9558" required/></label></div>
        <label className="field price-field"><span>PRICE PER NIGHT (INR) <b>*</b></span><div className="currency-input"><span>₹</span><input type="number" min="1" step="0.01" name="price" value={form.price} onChange={change} placeholder="2500" required/></div></label>
      </div><aside className="form-aside"><div className="form-section-title"><span>03</span><div><h2>Cover image</h2><p>A first impression in one frame.</p></div></div>
        <label className="upload-box">{preview?<img src={preview} alt="Hotel image preview"/>:<div className="upload-empty"><ImagePlus size={30}/><strong>Choose an image</strong><span>JPG, PNG or WEBP · Up to 5 MB</span></div>}<input type="file" accept="image/*" onChange={choose}/></label>
        <p className="upload-hint">Upload a clear hotel image. It will be stored on the application server.</p>
        {error && <div className="form-error">{String(error)}</div>}
        <button className="primary-button save-button" disabled={saving}>{saving?'Saving...':<><Save size={17}/> {editing?'Save changes':'Create hotel'}</>}</button>
      </aside></form>
    </section>
  </>
}