import { useEffect } from 'react';
import { getLocalStorageGameApi } from '../api/LocalStorageGameApi';
import { useGameStore } from '../state/gameStore';

export default function GameProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { setApi } = useGameStore();

	useEffect(() => {
		const api = getLocalStorageGameApi();
		setApi(api);
	}, [setApi]);

	return <>{children}</>;
}
