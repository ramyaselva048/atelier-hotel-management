import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchHotels = createAsyncThunk('hotels/fetch', async (params) => {
  const { data } = await api.get('/hotels', { params })
  return data
})
export const fetchHotel = createAsyncThunk('hotels/fetchOne', async (id) => {
  const { data } = await api.get(`/hotels/${id}`)
  return data.hotel
})
export const createHotel = createAsyncThunk('hotels/create', async (formData) => {
  const { data } = await api.post('/hotels', formData)
  return data.hotel
})
export const updateHotel = createAsyncThunk('hotels/update', async ({ id, formData }) => {
  const { data } = await api.put(`/hotels/${id}`, formData)
  return data.hotel
})
export const deleteHotel = createAsyncThunk('hotels/delete', async (id) => {
  await api.delete(`/hotels/${id}`)
  return id
})

const slice = createSlice({
  name: 'hotels',
  initialState: { items: [], total: 0, selected: null, loading: false, error: null },
  reducers: { clearSelected: (state) => { state.selected = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, s => { s.loading = true; s.error = null })
      .addCase(fetchHotels.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.hotels; s.total = a.payload.total })
      .addCase(fetchHotels.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addCase(fetchHotel.fulfilled, (s, a) => { s.selected = a.payload })
      .addCase(createHotel.fulfilled, (s, a) => { s.items.unshift(a.payload); s.total += 1 })
      .addCase(updateHotel.fulfilled, (s, a) => { s.selected = a.payload; s.items = s.items.map(h => h.id === a.payload.id ? a.payload : h) })
      .addCase(deleteHotel.fulfilled, (s, a) => { s.items = s.items.filter(h => h.id !== a.payload); s.total = Math.max(0, s.total - 1) })
  }
})
export const { clearSelected } = slice.actions
export default slice.reducer