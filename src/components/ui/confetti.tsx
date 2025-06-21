import type { Container } from '@tsparticles/engine';
import { loadConfettiPreset } from '@tsparticles/preset-confetti';
import { initParticlesEngine, Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useEffect, useId, useState } from 'react';

interface ConfettiProps {
	isActive: boolean;
}

const colors = [
	'#ff0000',
	'#00ff00',
	'#0000ff',
	'#ffff00',
	'#ff00ff',
	'#00ffff',
	'#ff8800',
	'#8800ff',
	'#ff0088',
	'#88ff00',
];
const config = {
	preset: 'confetti',
	particles: {
		number: {
			value: 100,
		},
		color: {
			value: colors,
		},
		shape: {
			type: ['circle', 'square', 'triangle'],
		},
	},
};

export function Confetti({ isActive }: ConfettiProps) {
	const [init, setInit] = useState(false);
	const [id] = useId();

	useEffect(() => {
		initParticlesEngine(async (engine) => {
			await loadSlim(engine);
			await loadConfettiPreset(engine);
		}).then(() => {
			setInit(true);
		});
	}, []);

	const particlesLoaded = async (container?: Container): Promise<void> => {
		console.log(container);
	};

	if (!init || !isActive) {
		return null;
	}

	return (
		<Particles id={id} particlesLoaded={particlesLoaded} options={config} />
	);
}
