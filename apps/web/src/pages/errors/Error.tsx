import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { Error403 } from './components/Error403';
import { Error404 } from './components/Error404';
import { Error500 } from './components/Error500';

export const Error = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) return <Error403 />;
    if (error.status === 404) return <Error404 />;
  }

  return <Error500 />;
};
