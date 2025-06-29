import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Home } from './pages/Home'
import { CreateMenu } from './pages/CreateMenu'
import { MenuList } from './pages/MenuList'
import { EditMenu } from './pages/EditMenu'
import { TrainingRecord } from './pages/TrainingRecord'
import { MenuRecords } from './pages/MenuRecords'
import { Analytics } from './pages/Analytics'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 認証不要のページ */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 認証が必要なページ */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-menu"
            element={
              <ProtectedRoute>
                <CreateMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-list"
            element={
              <ProtectedRoute>
                <MenuList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-menu/:menuId"
            element={
              <ProtectedRoute>
                <EditMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/:menuId"
            element={
              <ProtectedRoute>
                <TrainingRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-records/:menuId"
            element={
              <ProtectedRoute>
                <MenuRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
