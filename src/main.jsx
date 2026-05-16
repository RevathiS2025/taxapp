import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { TaxProvider } from './context/TaxContext'
import { ThemeProvider } from './context/ThemeContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <TaxProvider>
          <App />
        </TaxProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
)
