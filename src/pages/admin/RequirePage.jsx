import { Navigate } from 'react-router-dom';
import { useAdmin } from './AdminLayout';

// Guard para rutas de lector: redirige a /admin/users si no tiene permiso
export default function RequirePage({ page, children }) {
  const { role, pages } = useAdmin();
  if (role === 'admin' || pages.includes(page)) return children;
  return <Navigate to="/admin/users" replace />;
}
