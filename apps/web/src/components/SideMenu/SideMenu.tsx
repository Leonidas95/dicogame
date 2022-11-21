import { AiOutlineUser } from 'react-icons/ai';
import { BiDonateHeart } from 'react-icons/bi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { RiQuestionnaireFill, RiSettings4Fill } from 'react-icons/ri';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { RouteName, Routes } from '../../routes';

import { SideMenuItem } from './components/SideMenuItem';
import { SideMenuSection } from './components/SideMenuSection';

export const SideMenu = () => {
  const intl = useIntl();

  return (
    <aside className="overflow-y-auto overflow-x-hidden flex-grow">
      <h1 className="flex items-center h-14 px-5 border-b">
        <NavLink to={Routes[RouteName.HOME]}>
          <img src="logo.svg" alt={intl.formatMessage({ id: 'appName' })} />
        </NavLink>
      </h1>
      <ul className="flex flex-col py-4 space-y-1">
        <SideMenuItem
          label={intl.formatMessage({ id: 'sideMenuLobbies' })}
          link={Routes[RouteName.LOBBIES]}
          icon={<IoGameControllerOutline />}
        />
        <SideMenuItem
          label={intl.formatMessage({ id: 'sideMenuHowToPlay' })}
          link={Routes[RouteName.HOW_TO_PLAY]}
          icon={<RiQuestionnaireFill />}
        />
        <SideMenuItem
          label={intl.formatMessage({ id: 'sideMenuContributing' })}
          link={Routes[RouteName.CONTRIBUTING]}
          icon={<BiDonateHeart />}
          disabled
        />
        <SideMenuSection label={intl.formatMessage({ id: 'sideMenuAccount' })} />
        <SideMenuItem
          label={intl.formatMessage({ id: 'sideMenuProfile' })}
          link={Routes[RouteName.PROFILE]}
          icon={<AiOutlineUser />}
        />
        <SideMenuItem
          label={intl.formatMessage({ id: 'sideMenuSettings' })}
          link={Routes[RouteName.SETTINGS]}
          icon={<RiSettings4Fill />}
        />
      </ul>
    </aside>
  );
};
