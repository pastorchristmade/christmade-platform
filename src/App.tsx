import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Bible from './pages/Bible'
import Sermon from './pages/Sermon'
import SermonCreate from './pages/SermonCreate'
import SermonView from './pages/SermonView'
import Journal from './pages/Journal'
import JournalCreate from './pages/JournalCreate'
import JournalView from './pages/JournalView'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Pages */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bible" element={<Bible />} />
        <Route path="/sermon" element={<Sermon />} />
        <Route path="/sermon/new" element={<SermonCreate />} />
        <Route path="/sermon/:id" element={<SermonView />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/new" element={<JournalCreate />} />
        <Route path="/journal/:id" element={<JournalView />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App