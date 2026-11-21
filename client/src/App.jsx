import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/Shell'
import HotelsPage from './pages/HotelsPage'
import HotelFormPage from './pages/HotelFormPage'
import HotelDetailPage from './pages/HotelDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return <Shell><Routes>
    <Route path="/" element={<HotelsPage />} />
    <Route path="/hotels/new" element={<HotelFormPage />} />
    <Route path="/hotels/:id/edit" element={<HotelFormPage />} />
    <Route path="/hotels/:id" element={<HotelDetailPage />} />
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes></Shell>
}