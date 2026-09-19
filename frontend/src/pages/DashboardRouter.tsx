import { useAuthStore } from '../stores/authStore';
import DashboardHOD from './DashboardHOD';
import DashboardStaff from './DashboardStaff';
import DashboardRep from './DashboardRep';

export default function DashboardRouter() {
  const { user } = useAuthStore();

  switch (user?.role) {
    case 'HOD':
      return <DashboardHOD />;
    case 'STAFF':
      return <DashboardStaff />;
    case 'CLASS_REPRESENTATIVE':
      return <DashboardRep />;
    default:
      return <div>Unknown Role</div>;
  }
}
