export enum RouteName {
  HOME = 'HOME',
  LOBBIES = 'LOBBIES',
  LOBBY = 'LOBBY',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  CONTRIBUTING = 'CONTRIBUTING',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
}

export const Routes: Record<RouteName, string> = {
  [RouteName.HOME]: '/',
  [RouteName.LOBBIES]: '/lobbies',
  [RouteName.LOBBY]: '/lobbies/:lobbyId',
  [RouteName.HOW_TO_PLAY]: '/how-to-play',
  [RouteName.CONTRIBUTING]: '/contributing',
  [RouteName.PROFILE]: '/profile',
  [RouteName.SETTINGS]: '/settings',
};
