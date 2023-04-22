import { createContext, useCallback, useEffect, useState } from 'react';
// eslint-disable-next-line import/no-named-as-default
import { io, Socket } from 'socket.io-client';

type MethodType = 'createLobby' | 'updateLobby' | 'joinLobby' | 'startGame';

type EventType = 'playerJoined' | 'playerLeft';

type SocketCallback = (event: EventType, data: any) => void;

type Notification = { callback: SocketCallback };

type Request = {
  method: MethodType;
  data: any;
  callback: SocketCallback;
};

const useSocket = (): {
  socket: Socket | null;
  onNotification: (data: Notification) => void;
  makeRequest: (data: Request) => void;
} => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`${process.env.VITE_API_URL}/lobbies`, { transports: ['websocket'] });
    setSocket(newSocket);

    return () => {
      socket?.close();
    };
  }, []);

  const onNotification = useCallback(
    ({ callback }: Notification) => {
      if (socket) {
        socket.on('notification', callback);
      }
    },
    [socket],
  );

  const makeRequest = useCallback(
    ({ method, data, callback }: Request) => {
      if (socket) {
        socket.emit('request', { method, data }, callback);
      }
    },
    [socket],
  );

  return { socket, onNotification, makeRequest };
};

type SocketContextProps = {
  socket: Socket | null;
  onNotification: (callback: Notification) => void | null;
  makeRequest: (callback: Request) => void | null;
};

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  onNotification: () => null,
  makeRequest: () => null,
});

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket, onNotification, makeRequest } = useSocket();

  return <SocketContext.Provider value={{ socket, onNotification, makeRequest }}>{children}</SocketContext.Provider>;
};

export { SocketContext, SocketProvider };
