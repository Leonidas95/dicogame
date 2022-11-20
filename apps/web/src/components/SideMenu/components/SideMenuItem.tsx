import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

type SideMenuItemProps = {
  label: string;
  link: string;
  icon: JSX.Element;
  disabled?: boolean;
};

export const SideMenuItem = ({ label, link, icon, disabled }: SideMenuItemProps) => {
  return (
    <li>
      <NavLink
        to={link}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
          }
        }}
        className={({ isActive }) =>
          classNames(
            'relative flex flex-row items-center h-11 focus:outline-none border-l-4 border-transparent pr-6',
            { 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-green-500': !isActive },
            {
              'text-green-600 border-green-600 hover:text-green-700 hover:bg-gray-100 hover:border-green-600': isActive,
            },
          )
        }
      >
        <span className="inline-flex justify-center items-center ml-4">{icon}</span>
        <span className="ml-2 text-sm tracking-wide truncate">{label}</span>
      </NavLink>
    </li>
  );
};
