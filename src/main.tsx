import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import './index.css'

const UnboxingPage = lazy(() =>
  import('@/pages/UnboxingPage').then((m) => ({ default: m.UnboxingPage })),
)
const GridPage = lazy(() => import('@/pages/GridPage').then((m) => ({ default: m.GridPage })))
const SlidePage = lazy(() => import('@/pages/SlidePage').then((m) => ({ default: m.SlidePage })))
const ReelsPage = lazy(() => import('@/pages/ReelsPage').then((m) => ({ default: m.ReelsPage })))
const NewPage = lazy(() => import('@/pages/NewPage').then((m) => ({ default: m.NewPage })))
const FindPage = lazy(() => import('@/pages/FindPage').then((m) => ({ default: m.FindPage })))
const EditPage = lazy(() => import('@/pages/EditPage').then((m) => ({ default: m.EditPage })))
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeToggle />
      <Suspense
        fallback={
          <p className="py-20 text-center text-text-muted">불러오는 중…</p>
        }
      >
        <Routes>
          <Route path="/" element={<UnboxingPage />} />
          <Route path="/grid" element={<GridPage />} />
          <Route path="/slide" element={<SlidePage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/find" element={<FindPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
