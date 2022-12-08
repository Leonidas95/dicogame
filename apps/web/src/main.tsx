import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import { LocaleProvider } from './locales/LocaleProvider';
import { Home } from './pages/Home';
import { HowToPlay } from './pages/HowToPlay';
import { Root } from './pages/Root';
import { Error } from './pages/errors';
import { Lobbies } from './pages/lobbies';
import { RouteName, Routes } from './routes';
import { queryClient } from './utils/queryClient';

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
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
