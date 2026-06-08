import { createBrowserRouter, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import LandingPage from '../features/landing/LandingPage';
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
import RoomWrapper from '../features/room/RoomWrapper';
import DocsEditorPage from '../features/Notes/page/DocsEditorPage';
import RootLayout from './RootLayout';
import { protectedLoader, publicLoader } from './loaders';
const generateMeetingId = () => {
  const arr = new Uint8Array(10);
  window.crypto.getRandomValues(arr);
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const s = Array.from(arr, b => chars[b % chars.length]).join('');
  return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7, 10)}`;
};
const RoomRedirect = () => <Navigate to={`/room/${generateMeetingId()}`} replace />;
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
  {
    element: <PublicRoute />,
    loader: publicLoader,
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
    loader: protectedLoader,
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
        element: <RoomWrapper />
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
        children: [
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
    ],
  },
]);
export default router;
