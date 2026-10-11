import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import RobotChatbotIcon from './components/ai/RobotChatbotIcon';
import AdminProfile from './pages/admin/Profile';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student Pages
import Home from './pages/student/Home';
import Materials from './pages/student/Materials';
import MaterialDetail from './pages/student/MaterialDetail';
import Profile from './pages/student/Profile';
import StudentDoubts from './pages/student/StudentDoubts';

// Teacher Pages
import UploadMaterial from './pages/teacher/UploadMaterial';
import MyMaterials from './pages/teacher/MyMaterials';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherQueries from './pages/teacher/TeacherQueries';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMaterials from './pages/admin/AdminMaterials';
import AdminCurriculum from './pages/admin/AdminCurriculum';


// Common Pages
import Chatbot from './pages/common/Chatbot';
import Unauthorized from './pages/common/Unauthorized';
import NotFound from './pages/common/NotFound';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className={isAuthPage ? "flex-grow w-full p-0 m-0" : "flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
              <Routes>
                {/* ===== PUBLIC ROUTES ===== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ===== PROTECTED ROUTES ===== */}
                {/* Student Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/doubts" element={
                  <ProtectedRoute>
                    <StudentDoubts />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/profile" element={
                  <ProtectedRoute>
                    <AdminProfile />
                  </ProtectedRoute>
                } />
                
                <Route path="/materials" element={
                  <ProtectedRoute>
                    <Materials />
                  </ProtectedRoute>
                } />
                
                <Route path="/materials/:id" element={
                  <ProtectedRoute>
                    <MaterialDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/chatbot" element={
                  <ProtectedRoute>
                    <Chatbot />
                  </ProtectedRoute>
                } />

                {/* ===== TEACHER ROUTES ===== */}
                <Route path="/upload" element={
                  <RoleBasedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                    <UploadMaterial />
                  </RoleBasedRoute>
                } />
                
                <Route path="/my-materials" element={
                  <RoleBasedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                    <MyMaterials />
                  </RoleBasedRoute>
                } />
                
                <Route path="/teacher/dashboard" element={
                  <RoleBasedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                    <TeacherDashboard />
                  </RoleBasedRoute>
                } />

                <Route path="/teacher/queries" element={
                  <RoleBasedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                    <TeacherQueries />
                  </RoleBasedRoute>
                } />

                {/* ===== ADMIN ROUTES ===== */}
                <Route path="/admin/dashboard" element={
                  <RoleBasedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <RoleBasedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminUsers />
                  </RoleBasedRoute>
                } />
                
                <Route path="/admin/materials" element={
                  <RoleBasedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminMaterials />
                  </RoleBasedRoute>
                } />
                
                <Route path="/admin/curriculum" element={
                  <RoleBasedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminCurriculum />
                  </RoleBasedRoute>
                } />
                
              

                {/* ===== 404 PAGE ===== */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Footer />
            <RobotChatbotIcon />
            
            {/* ===== TOAST NOTIFICATIONS ===== */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#22c55e',
                    color: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#ef4444',
                    color: '#fff',
                  },
                },
              }}
            />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;