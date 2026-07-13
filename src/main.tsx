import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import { HomePage } from '@/pages/HomePage'
import { NewPage } from '@/pages/NewPage'
import { FindPage } from '@/pages/FindPage'
import { EditPage } from '@/pages/EditPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewPage />} />
        <Route path="/find" element={<FindPage />} />
        <Route path="/edit/:id" element={<EditPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
