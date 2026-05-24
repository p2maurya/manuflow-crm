import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Team from "./pages/Team";

const Guard = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-4 border-stone-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: "DM Sans" } }} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
          <Route path="/leads" element={<Guard><Leads /></Guard>} />
          <Route path="/leads/:id" element={<Guard><LeadDetail /></Guard>} />
          <Route path="/team" element={<Guard adminOnly><Team /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
