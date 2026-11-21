import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import hotelsRouter from './routes/hotels.js'
import pool from './config/db.js'
dotenv.config()
const app=express()
const __dirname=path.dirname(fileURLToPath(import.meta.url))
app.use(cors({origin:process.env.CLIENT_URL || 'http://localhost:5173'}))
app.use(express.json())
app.use('/uploads',express.static(path.join(__dirname,'uploads')))
app.get('/api/health',async(_req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'})}catch{res.status(503).json({status:'error',database:'disconnected'})}})
app.use('/api/hotels',hotelsRouter)
app.use((req,res)=>res.status(404).json({message:'Route not found.'}))
app.use((err,_req,res,_next)=>{console.error(err);if(err.code==='LIMIT_FILE_SIZE')return res.status(400).json({message:'Image must be 5 MB or smaller.'});if(err.message?.includes('Unexpected field'))return res.status(400).json({message:'Unexpected upload field.'});res.status(500).json({message:'Server error. Check the server terminal.'})})
const port=process.env.PORT || 5000
app.listen(port,()=>console.log(`Atelier Hotel Management API running at http://localhost:${port}`))