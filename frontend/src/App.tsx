import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useSocketStore } from './stores/socketStore';
import api from './services/api';
import { subscribeToPushNotifications } from './services/pushService';
import Login from './pages/Login.tsx';
import DashboardLayout from './layouts/DashboardLayout.tsx';

import DashboardRouter from './pages/DashboardRouter.tsx';
import ClassTimetables from './pages/ClassTimetables.tsx';
import StaffTimetables from './pages/StaffTimetables.tsx';
import MyTimetable from './pages/MyTimetable.tsx';
import PlaceholderPage from './components/common/PlaceholderPage.tsx';
import Messages from './pages/Messages.tsx';
import Substitutions from './pages/Substitutions.tsx';
import Leaves from './pages/Leaves.tsx';
import Attendance from './pages/Attendance.tsx';
import Reports from './pages/Reports.tsx';
import MyClass from './pages/MyClass.tsx';

const queryClient = new QueryClient();

function App() {
  const { user, token, login, logout } = useAuthStore();
  const { connect } = useSocketStore();

  useEffect(() => {
    if (token) {
      api.get('/auth/me').then(res => {
        login(res.data.user, token);
        connect(token);
        subscribeToPushNotifications();
      }).catch(() => {
        logout();
      });
    }
  }, [token, login, connect, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}>
            <Route index element={<DashboardRouter />} />
            <Route path="class-timetables" element={<ClassTimetables />} />
            <Route path="timetable" element={<PlaceholderPage title="Department Timetables" />} />
            <Route path="my-timetable" element={<MyTimetable />} />
            <Route path="my-class" element={<PlaceholderPage title="My Class" />} />
            <Route path="staff-timetables" element={<StaffTimetables />} />
            <Route path="substitutions" element={<Substitutions />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
            <Route path="messages" element={<Messages />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="my-class" element={<MyClass />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
