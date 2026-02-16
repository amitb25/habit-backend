import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/Layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import ExercisesPage from "./pages/ExercisesPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import HabitsPage from "./pages/HabitsPage";
import DailyTasksPage from "./pages/DailyTasksPage";
import FinancePage from "./pages/FinancePage";
import GoalsPage from "./pages/GoalsPage";
import InterviewsPage from "./pages/InterviewsPage";
import AffirmationsPage from "./pages/AffirmationsPage";
import SettingsPage from "./pages/SettingsPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <Routes>
      <Route path="/admin/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="daily-tasks" element={<DailyTasksPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="affirmations" element={<AffirmationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
