// ДОБАВИЛИ onSnapshot В ИМПОРТЫ
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase";

export interface Tournament {
  id?: string;
  title: string;
  description: string;
  date: string;
  image?: string | null;
  userId?: string;
}

const COLLECTION_NAME = "tournaments";

// --- ФУНКЦИЯ ДЛЯ REAL-TIME ОБНОВЛЕНИЙ (ПУНКТ 2 ЛАБЫ 4) ---
export const subscribeToTournaments = (callback: (tournaments: Tournament[]) => void) => {
  const user = auth.currentUser;
  if (!user) {
    callback([]); // Если не авторизован - отдаем пустой массив
    return () => {}; // Возвращаем пустую функцию отписки
  }

  // Слушаем только турниры текущего пользователя
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", user.uid));

  // onSnapshot будет сам вызывать callback КАЖДЫЙ РАЗ, когда данные меняются в облаке!
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tournaments: Tournament[] = [];
    querySnapshot.forEach((docSnap) => {
      tournaments.push({ id: docSnap.id, ...docSnap.data() } as Tournament);
    });
    callback(tournaments); // Передаем новые данные в интерфейс
  }, (error) => {
    console.error("Ошибка Real-time подписки:", error);
  });

  // Возвращаем функцию отписки, чтобы не было утечек памяти, когда закроем экран
  return unsubscribe;
};

// ... ОСТАЛЬНЫЕ ФУНКЦИИ ОСТАВЛЯЕМ КАК ЕСТЬ ...
export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const tournaments: Tournament[] = [];
    querySnapshot.forEach((docSnap) => {
      tournaments.push({ id: docSnap.id, ...docSnap.data() } as Tournament);
    });
    return tournaments;
  } catch (error) {
    console.error("Ошибка загрузки из Firebase:", error);
    return [];
  }
};

export const saveTournament = async (tournament: Tournament): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const tournamentData = {
      title: tournament.title,
      description: tournament.description,
      date: tournament.date,
      image: tournament.image || null,
      userId: user.uid
    };

    if (tournament.id) {
      const docRef = doc(db, COLLECTION_NAME, tournament.id);
      await updateDoc(docRef, tournamentData);
    } else {
      await addDoc(collection(db, COLLECTION_NAME), tournamentData);
    }
  } catch (error) {
    console.error("Ошибка сохранения в Firebase:", error);
  }
};

export const getTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Tournament;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const deleteTournament = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Ошибка удаления из Firebase:", error);
  }
};