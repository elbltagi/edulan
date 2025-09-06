import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import './index.css';
import App from './App.jsx';
import { Admin, CreateExam, ExamPage, ResultPage, HostingPage, PrepareLiveExam } from './pages';
import { Provider, positions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { ActivationProvider } from './activation.jsx';
import { ExamProvider } from './ExamProvider.jsx';

// Alert options
const options = {
  timeout: 5000,
  position: positions.BOTTOM_LEFT,
};

// Create a data router
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '/admin/createnew',
    element: <CreateExam />,
  },
  {
    path: '/:id/exampage/',
    element: <ExamPage />,
  },
  {
    path: '/:id/exampage/resultpage',
    element: <ResultPage />,
  }, {
    path: '/admin/hosting',
    element: <HostingPage />,
  },
  {
    path: "admin/createnew/prepare-live-exam",
    element: <PrepareLiveExam />
  }
]);

// Render the app
createRoot(document.getElementById('root')).render(
  <Provider template={AlertTemplate} {...options}>
    <ActivationProvider>
      <ExamProvider>
        <RouterProvider router={router} />
      </ExamProvider>
    </ActivationProvider>
  </Provider>

);