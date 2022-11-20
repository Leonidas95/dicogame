import { Outlet } from 'react-router-dom';

import { SideMenu } from '../components/SideMenu';

export const Root = () => {
  return (
    <div className="min-h-screen flex flex-row flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800">
      <div className="fixed flex flex-col top-0 left-0 w-64 bg-white h-full border-r">
        <SideMenu />
      </div>
      <div className="flex flex-auto ml-64 px-4 py-4">
        <Outlet />
      </div>
    </div>
  );
};
