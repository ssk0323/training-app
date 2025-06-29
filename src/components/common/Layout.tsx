import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './Button'

interface LayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  backTo?: string
}

export const Layout = ({ children, title, subtitle, showBackButton = false, backTo = '/' }: LayoutProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button variant="secondary" onClick={handleBack}>
                  戻る
                </Button>
              )}
              
              <nav className="flex space-x-1 sm:space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">ホーム</span>
                  <span className="sm:hidden">🏠</span>
                </Link>
                <Link 
                  to="/create-menu" 
                  className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">メニュー作成</span>
                  <span className="sm:hidden">➕</span>
                </Link>
                <Link 
                  to="/analytics" 
                  className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">統計・分析</span>
                  <span className="sm:hidden">📊</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}