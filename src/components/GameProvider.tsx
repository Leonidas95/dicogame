import { useEffect } from 'react';
import { getLocalStorageGameApi } from '../api/LocalStorageGameApi';
import { getPeerJSGameApi } from '../api/PeerJSGameApi';
import { useGameStore } from '../state/gameStore';

export default function GameProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { setApi } = useGameStore();
	const isProduction = import.meta.env.PROD;

	useEffect(() => {
		const api = isProduction ? getPeerJSGameApi() : getLocalStorageGameApi();
		setApi(api);
	}, [setApi]);

	return <>{children}</>;
}
