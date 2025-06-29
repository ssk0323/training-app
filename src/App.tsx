import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { CreateMenu } from './pages/CreateMenu'
import { TrainingRecord } from './pages/TrainingRecord'
import { SimpleAnalytics } from './pages/SimpleAnalytics'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-menu" element={<CreateMenu />} />
        <Route path="/training/:menuId" element={<TrainingRecord />} />
        <Route path="/analytics" element={<SimpleAnalytics />} />
      </Routes>
    </Router>
  )
}

export default App