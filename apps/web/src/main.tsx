import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import { LocaleProvider } from './locales/LocaleProvider';
import { Error } from './pages/Error';
import { Home } from './pages/Home';
import { HowToPlay } from './pages/HowToPlay';
import { Lobbies } from './pages/Lobbies';
import { Root } from './pages/Root';
import { RouteName, Routes } from './routes';

const router = createBrowserRouter([
  {
    path: Routes[RouteName.HOME],
    element: <Root />,
    children: [
      { path: Routes[RouteName.HOME], element: <Home /> },
      { path: Routes[RouteName.LOBBIES], element: <Lobbies /> },
      { path: Routes[RouteName.HOW_TO_PLAY], element: <HowToPlay /> },
    ],
    errorElement: <Error />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LocaleProvider>
      <RouterProvider router={router} />
    </LocaleProvider>
  </React.StrictMode>,
);
