import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ListingsProvider } from './context/ListingsContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ListingsProvider>
              <App />
            </ListingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
