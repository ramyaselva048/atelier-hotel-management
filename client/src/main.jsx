import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { store } from './redux/store'
import App from './App'
import 'leaflet/dist/leaflet.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter><App /></BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
)