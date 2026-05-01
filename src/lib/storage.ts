// ДОБАВИЛИ getDoc В ИМПОРТЫ
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface Tournament {
  id?: string;
  title: string;
  description: string;
  date: string;
  image?: string | null;
}

const COLLECTION_NAME = "tournaments";

export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
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
    if (tournament.id) {
      const docRef = doc(db, COLLECTION_NAME, tournament.id);
      await updateDoc(docRef, {
        title: tournament.title,
        description: tournament.description,
        date: tournament.date,
        image: tournament.image || null,
      });
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        title: tournament.title,
        description: tournament.description,
        date: tournament.date,
        image: tournament.image || null,
      });
    }
  } catch (error) {
    console.error("Ошибка сохранения в Firebase:", error);
  }
};

// --- ИСПРАВЛЕННАЯ ФУНКЦИЯ (КАЧАЕТ ТОЛЬКО 1 ТУРНИР, РАБОТАЕТ МОМЕНТАЛЬНО) ---
export const getTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Tournament;
    }
    return null;
  } catch (error) {
    console.error("Ошибка загрузки одного турнира:", error);
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