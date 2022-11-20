export enum RouteName {
  HOME = 'HOME',
  LOBBIES = 'LOBBIES',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  CONTRIBUTING = 'CONTRIBUTING',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
}

export const Routes: Record<RouteName, string> = {
  [RouteName.HOME]: '/',
  [RouteName.LOBBIES]: '/lobbies',
  [RouteName.HOW_TO_PLAY]: '/how-to-play',
  [RouteName.CONTRIBUTING]: '/contributing',
  [RouteName.PROFILE]: '/profile',
  [RouteName.SETTINGS]: '/settings',
};
