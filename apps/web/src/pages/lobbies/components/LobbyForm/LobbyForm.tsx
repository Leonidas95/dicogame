import { useCallback } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from 'ui';

import { CreateLobbyInput } from '../../../../interfaces/lobby';

import { useCreateLobby } from './useCreateLobby';

export const LobbyForm = () => {
  const { createLobby } = useCreateLobby();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<CreateLobbyInput>({ defaultValues: { isPrivate: false, maxPlayers: 3, rounds: 4 } });

  const handleCreateLobby = useCallback<SubmitHandler<CreateLobbyInput>>((values) => {
    createLobby(values, (lobby) => navigate(lobby.id, { state: lobby }));
  }, []);

  return (
    <form onSubmit={handleSubmit(handleCreateLobby)}>
      <div className="mb-6">
        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
          Lobby name
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Lobby name"
          {...register('name', { required: true })}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="playername" className="block mb-2 text-sm font-medium text-gray-900">
          Player name
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Player name"
          {...register('playerName', { required: true })}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="maxPlayers" className="block mb-2 text-sm font-medium text-gray-900">
          Max players
        </label>
        <input
          type="number"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Max players"
          {...register('maxPlayers', { required: true, min: 2, max: 10, valueAsNumber: true })}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="rounds" className="block mb-2 text-sm font-medium text-gray-900">
          Rounds
        </label>
        <input
          type="number"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Rounds"
          {...register('rounds', { required: true, min: 2, max: 10, valueAsNumber: true })}
        />
      </div>
      <div className="mb-6">
        <label className="inline-flex relative items-center mb-4 cursor-pointer">
          <input type="checkbox" value="" className="sr-only peer" {...register('isPrivate', { required: false })} />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">Private lobby</span>
        </label>
      </div>
      <Button color="green" type="submit" disabled={isSubmitting || !isValid}>
        Create
      </Button>
    </form>
  );
};
