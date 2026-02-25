import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Tournament {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: number;
}

const STORAGE_KEY = 'esports_tournaments';

export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveTournament = async (tournament: Omit<Tournament, 'id' | 'createdAt'> & { id?: string }) => {
  const tournaments = await getTournaments();
  
  if (tournament.id) {

    const index = tournaments.findIndex((t) => t.id === tournament.id);
    if (index !== -1) {
      tournaments[index] = { ...tournaments[index], ...tournament, createdAt: tournaments[index].createdAt };
    }
  } else {

    const newTournament: Tournament = {
      ...tournament,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    tournaments.push(newTournament);
  }
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
};

export const deleteTournament = async (id: string) => {
  const tournaments = await getTournaments();
  const filtered = tournaments.filter((t) => t.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getTournamentById = async (id: string): Promise<Tournament | undefined> => {
  const tournaments = await getTournaments();
  return tournaments.find((t) => t.id === id);
};
