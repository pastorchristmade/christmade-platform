import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-neutral-100">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout