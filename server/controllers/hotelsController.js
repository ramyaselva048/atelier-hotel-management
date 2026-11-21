import pool from '../config/db.js'
import fs from 'fs'
import path from 'path'

const removeImage = (imagePath) => {
  if (!imagePath) return
  const filePath = path.resolve('uploads', path.basename(imagePath))
  fs.unlink(filePath, () => {})
}
const valid = (body) => {
  const { title, description, latitude, longitude, price } = body
  if (!String(title || '').trim() || !String(description || '').trim()) return 'Title and description are required.'
  if (latitude === '' || !Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) return 'Latitude must be between -90 and 90.'
  if (longitude === '' || !Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) return 'Longitude must be between -180 and 180.'
  if (price === '' || !Number.isFinite(Number(price)) || Number(price) <= 0) return 'Price must be greater than zero.'
  return null
}
export async function listHotels(req,res,next) {
  try {
    const { search='', minPrice='', maxPrice='', limit='6', offset='0' } = req.query
    const conditions=[], values=[]
    if (search.trim()) { values.push(`%${search.trim()}%`); conditions.push(`title ILIKE $${values.length}`) }
    if (minPrice !== '') { if (!Number.isFinite(Number(minPrice)) || Number(minPrice)<0) return res.status(400).json({message:'Invalid minimum price.'}); values.push(Number(minPrice)); conditions.push(`price >= $${values.length}`) }
    if (maxPrice !== '') { if (!Number.isFinite(Number(maxPrice)) || Number(maxPrice)<0) return res.status(400).json({message:'Invalid maximum price.'}); values.push(Number(maxPrice)); conditions.push(`price <= $${values.length}`) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const pageLimit = Math.min(Math.max(parseInt(limit,10)||6,1),50)
    const pageOffset = Math.max(parseInt(offset,10)||0,0)
    const count = await pool.query(`SELECT COUNT(*)::int AS total FROM hotels ${where}`, values)
    const rows = await pool.query(`SELECT id,title,description,latitude,longitude,price,image_path,created_at,updated_at FROM hotels ${where} ORDER BY created_at DESC, id DESC LIMIT $${values.length+1} OFFSET $${values.length+2}`, [...values,pageLimit,pageOffset])
    res.json({ hotels: rows.rows, total: count.rows[0].total, limit: pageLimit, offset: pageOffset })
  } catch(err){ next(err) }
}
export async function getHotel(req,res,next) {
  try {
    const result = await pool.query('SELECT * FROM hotels WHERE id = $1',[req.params.id])
    if (!result.rowCount) return res.status(404).json({message:'Hotel not found.'})
    res.json({hotel:result.rows[0]})
  } catch(err){ next(err) }
}
export async function createHotel(req,res,next) {
  try {
    const issue=valid(req.body); if(issue){if(req.file)removeImage(`/uploads/${req.file.filename}`);return res.status(400).json({message:issue})}
    const {title,description,latitude,longitude,price}=req.body
    const imagePath=req.file?`/uploads/${req.file.filename}`:null
    const result=await pool.query(
      'INSERT INTO hotels (title,description,latitude,longitude,price,image_path) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title.trim(),description.trim(),Number(latitude),Number(longitude),Number(price),imagePath])
    res.status(201).json({message:'Hotel created successfully.',hotel:result.rows[0]})
  } catch(err){ if(req.file)removeImage(`/uploads/${req.file.filename}`);next(err) }
}
export async function updateHotel(req,res,next) {
  try {
    const issue=valid(req.body); if(issue){if(req.file)removeImage(`/uploads/${req.file.filename}`);return res.status(400).json({message:issue})}
    const current=await pool.query('SELECT * FROM hotels WHERE id=$1',[req.params.id])
    if(!current.rowCount){if(req.file)removeImage(`/uploads/${req.file.filename}`);return res.status(404).json({message:'Hotel not found.'})}
    const old=current.rows[0], imagePath=req.file?`/uploads/${req.file.filename}`:old.image_path
    const {title,description,latitude,longitude,price}=req.body
    const result=await pool.query(
      'UPDATE hotels SET title=$1,description=$2,latitude=$3,longitude=$4,price=$5,image_path=$6,updated_at=NOW() WHERE id=$7 RETURNING *',
      [title.trim(),description.trim(),Number(latitude),Number(longitude),Number(price),imagePath,req.params.id])
    if(req.file && old.image_path)removeImage(old.image_path)
    res.json({message:'Hotel updated successfully.',hotel:result.rows[0]})
  } catch(err){ if(req.file)removeImage(`/uploads/${req.file.filename}`);next(err) }
}
export async function deleteHotel(req,res,next) {
  try {
    const result=await pool.query('DELETE FROM hotels WHERE id=$1 RETURNING image_path',[req.params.id])
    if(!result.rowCount)return res.status(404).json({message:'Hotel not found.'})
    removeImage(result.rows[0].image_path)
    res.json({message:'Hotel deleted successfully.'})
  } catch(err){next(err)}
}