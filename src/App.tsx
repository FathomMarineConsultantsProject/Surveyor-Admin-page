import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import FormRecords from "./pages/FormRecords";
// import ProtectedRoute from "./ProtectedRoute"
import ProtectedRoute from "./ProtectedRoute";

// simple placeholders (UI only)
const UsersPage = () => <div className="p-6">Users (UI)</div>;
const SettingsPage = () => <div className="p-6">Settings (UI)</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/records"
          element={
            <ProtectedRoute>
              <FormRecords />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
