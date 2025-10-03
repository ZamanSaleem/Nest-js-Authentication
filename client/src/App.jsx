import AuthLayout from "./components/auth/layout"
import AuthLogin from "./pages/auth/login"
import AuthRegister from "./pages/auth/register"
import VerifyOtp from "./pages/auth/verify-otp"
import ForgotPassword from "./pages/auth/forgot-password"
import ResetPassword from "./pages/auth/reset-password"
import { Routes, Route, Navigate } from "react-router-dom"

function App() {
  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth" element={<AuthLayout/>}>
          <Route path="login" element={<AuthLogin/>} />
          <Route path="register" element={<AuthRegister/>} />
          <Route path="verify-otp" element={<VerifyOtp/>} />
          <Route path="forgot-password" element={<ForgotPassword/>} />
          <Route path="reset-password" element={<ResetPassword/>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
