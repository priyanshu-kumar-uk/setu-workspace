import { createBrowserRouter, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Landing from '../components/Landing';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Register2 from '../features/auth/pages/Register2';

import ProfileGuard from '../features/auth/pages/ProfileGuard';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

import Dashboard from '../features/dashboard/Dashboard';
import HomePage      from '../features/dashboard/Home/HomePage';
import MeetingsPage  from '../features/dashboard/Meetings/MeetingsPage';
import NotesPage     from '../features/Notes/page/NotesPage';
import AssistantPage from '../features/assistant/page/AssistantPage';
import RoomChatPage  from '../features/assistant/page/RoomChatPage';
import RoomDashboard from '../features/room/RoomDashboard';

import DocsEditorPage from '../features/Notes/page/DocsEditorPage';

const RoomRedirect = () => <Navigate to={`/room/${uuidv4()}`} replace />;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />
      },
    ]
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/register-profile',
    element: (
      <ProfileGuard>
        <Register2 />
      </ProfileGuard>
    )
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/docs/:id',
        element: <DocsEditorPage />
      },
      {
        path: '/room',
        element: <RoomRedirect />
      },
      {
        path: '/room/:roomId',
        element: <RoomDashboard />
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
        children: [
          // Default: redirect /dashboard → /dashboard/home
          { index: true, element: <Navigate to="home" replace /> },
          { path: 'home',      element: <HomePage /> },
          { path: 'meetings',  element: <MeetingsPage /> },
          { path: 'notes',     element: <NotesPage /> },
          { path: 'assistant', element: <AssistantPage /> },
          { path: 'assistant/:chatId', element: <AssistantPage /> },
          { path: 'room',      element: <RoomRedirect /> },
        ],
      },
    ],
  },
]);

export default router;
