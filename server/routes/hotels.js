import { Router } from 'express'
import { createHotel, deleteHotel, getHotel, listHotels, updateHotel } from '../controllers/hotelsController.js'
import { upload } from '../middleware/upload.js'
const router=Router()
router.get('/',listHotels)
router.get('/:id',getHotel)
router.post('/',upload.single('image'),createHotel)
router.put('/:id',upload.single('image'),updateHotel)
router.delete('/:id',deleteHotel)
export default router