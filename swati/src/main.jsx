// Entry point of the React app (index.html loads this file).
// It loads global CSS and renders <App /> inside <BrowserRouter> so pages can use URLs (React Router).

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
