
import pool from '../config/db.js'
import supabase from '../config/supabase.js'
import fs from 'fs'
import path from 'path'

const bucket = process.env.SUPABASE_BUCKET || 'hotel-images'

// Remove old local or Supabase image
const removeImage = async (imagePath) => {
  if (!imagePath) return

  try {
    // Supabase public image URL
    if (imagePath.includes('/storage/v1/object/public/')) {
      const marker = `/storage/v1/object/public/${bucket}/`
      const index = imagePath.indexOf(marker)

      if (index !== -1) {
        const fileName = decodeURIComponent(
          imagePath.substring(index + marker.length)
        )

        const { error } = await supabase.storage
          .from(bucket)
          .remove([fileName])

        if (error) console.error('Supabase image delete error:', error)
      }

      return
    }

    // Legacy local uploads
    if (imagePath.startsWith('/uploads/')) {
      const filePath = path.resolve('uploads', path.basename(imagePath))
      fs.unlink(filePath, () => {})
    }
  } catch (err) {
    console.error('Image removal error:', err)
  }
}

// Upload image to Supabase Storage
const uploadImage = async (file) => {
  if (!file) return null

  const ext = path.extname(file.originalname).toLowerCase()
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) throw error

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return data.publicUrl
}

const valid = (body) => {
  const { title, description, latitude, longitude, price } = body

  if (!String(title || '').trim() || !String(description || '').trim()) return 'Title and description are required.'
  if (latitude === '' || !Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) return 'Latitude must be between -90 and 90.'
  if (longitude === '' || !Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) return 'Longitude must be between -180 and 180.'
  if (price === '' || !Number.isFinite(Number(price)) || Number(price) <= 0) return 'Price must be greater than zero.'

  return null
}

export async function listHotels(req, res, next) {
  try {
    const { search = '', minPrice = '', maxPrice = '', limit = '6', offset = '0' } = req.query

    const conditions = [], values = []

    if (search.trim()) {
      values.push(`%${search.trim()}%`)
      conditions.push(`title ILIKE $${values.length}`)
    }

    if (minPrice !== '') {
      if (!Number.isFinite(Number(minPrice)) || Number(minPrice) < 0)
        return res.status(400).json({ message: 'Invalid minimum price.' })

      values.push(Number(minPrice))
      conditions.push(`price >= $${values.length}`)
    }

    if (maxPrice !== '') {
      if (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0)
        return res.status(400).json({ message: 'Invalid maximum price.' })

      values.push(Number(maxPrice))
      conditions.push(`price <= $${values.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 6, 1), 50)
    const pageOffset = Math.max(parseInt(offset, 10) || 0, 0)

    const count = await pool.query(
      `SELECT COUNT(*)::int AS total FROM hotels ${where}`,
      values
    )

    const rows = await pool.query(
      `SELECT id,title,description,latitude,longitude,price,image_path,created_at,updated_at FROM hotels ${where} ORDER BY created_at DESC, id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, pageLimit, pageOffset]
    )

    res.json({
      hotels: rows.rows,
      total: count.rows[0].total,
      limit: pageLimit,
      offset: pageOffset
    })
  } catch (err) {
    next(err)
  }
}

export async function getHotel(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM hotels WHERE id = $1',
      [req.params.id]
    )

    if (!result.rowCount)
      return res.status(404).json({ message: 'Hotel not found.' })

    res.json({ hotel: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

export async function createHotel(req, res, next) {
  let imagePath = null

  try {
    const issue = valid(req.body)

    if (issue)
      return res.status(400).json({ message: issue })

    if (req.file) {
      imagePath = await uploadImage(req.file)
    }

    const { title, description, latitude, longitude, price } = req.body

    const result = await pool.query(
      'INSERT INTO hotels (title,description,latitude,longitude,price,image_path) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [
        title.trim(),
        description.trim(),
        Number(latitude),
        Number(longitude),
        Number(price),
        imagePath
      ]
    )

    res.status(201).json({
      message: 'Hotel created successfully.',
      hotel: result.rows[0]
    })
  } catch (err) {
    if (imagePath) await removeImage(imagePath)
    next(err)
  }
}

export async function updateHotel(req, res, next) {
  let newImagePath = null

  try {
    const issue = valid(req.body)

    if (issue)
      return res.status(400).json({ message: issue })

    const current = await pool.query(
      'SELECT * FROM hotels WHERE id=$1',
      [req.params.id]
    )

    if (!current.rowCount)
      return res.status(404).json({ message: 'Hotel not found.' })

    const old = current.rows[0]

    if (req.file) {
      newImagePath = await uploadImage(req.file)
    }

    const imagePath = newImagePath || old.image_path

    const { title, description, latitude, longitude, price } = req.body

    const result = await pool.query(
      'UPDATE hotels SET title=$1,description=$2,latitude=$3,longitude=$4,price=$5,image_path=$6,updated_at=NOW() WHERE id=$7 RETURNING *',
      [
        title.trim(),
        description.trim(),
        Number(latitude),
        Number(longitude),
        Number(price),
        imagePath,
        req.params.id
      ]
    )

    if (newImagePath && old.image_path) {
      await removeImage(old.image_path)
    }

    res.json({
      message: 'Hotel updated successfully.',
      hotel: result.rows[0]
    })
  } catch (err) {
    if (newImagePath) await removeImage(newImagePath)
    next(err)
  }
}

export async function deleteHotel(req, res, next) {
  try {
    const result = await pool.query(
      'DELETE FROM hotels WHERE id=$1 RETURNING image_path',
      [req.params.id]
    )

    if (!result.rowCount)
      return res.status(404).json({ message: 'Hotel not found.' })

    await removeImage(result.rows[0].image_path)

    res.json({ message: 'Hotel deleted successfully.' })
  } catch (err) {
    next(err)
  }
}
