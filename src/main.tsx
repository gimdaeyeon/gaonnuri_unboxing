import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const NewPage = lazy(() => import('@/pages/NewPage').then((m) => ({ default: m.NewPage })))
const FindPage = lazy(() => import('@/pages/FindPage').then((m) => ({ default: m.FindPage })))
const EditPage = lazy(() => import('@/pages/EditPage').then((m) => ({ default: m.EditPage })))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense
        fallback={
          <p className="py-20 text-center text-text-muted">불러오는 중…</p>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/find" element={<FindPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
