import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { ArchitectureProvider } from './context/ArchitectureContext'
import { DemoProvider } from './context/DemoContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DemoProvider>
          <ArchitectureProvider>
            <App />
          </ArchitectureProvider>
        </DemoProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

