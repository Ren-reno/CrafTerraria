import { Link, Route, Routes } from 'react-router-dom'
import CategoryView from './pages/CategoryView.jsx'
import Home from './pages/Home.jsx'
import ItemDetail from './pages/ItemDetail.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/">CrafTerraria</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/category/:name" element={<CategoryView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>
          Item data from the{' '}
          <a href="https://terraria.wiki.gg/" target="_blank" rel="noreferrer">
            Official Terraria Wiki
          </a>{' '}
          (CC BY-NC-SA 4.0). Item icons are loaded from the wiki and belong to Re-Logic. Terraria is © Re-Logic.
          Unofficial fan project, non-commercial.
        </p>
      </footer>
    </div>
  )
}
