import { db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import userService from "./user.service";
import groupService from './group.service';

const notesRef = collection(db, "Notes");

class NotesService {
  addNote = async (noteData) => {
    try {
      const user = await userService.getUserByEmail(noteData.createdBy.email);
      const enrichedNoteData = {
        ...noteData,
        createdBy: {
          ...noteData.createdBy,
          picture: user?.profilePicture
        }
      };
      
      const docRef = await addDoc(notesRef, {
        ...enrichedNoteData,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding note:", error);
      return { success: false, error: error.message };
    }
  };

  getNotesByGroupId = async (groupId) => {
    try {
      console.log('Fetching notes for groupId:', groupId);
      const q = query(
        notesRef, 
        where("groupId", "==", groupId)
      );
      
      const querySnapshot = await getDocs(q);
      const notes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Fetched notes:', notes);
      return notes;
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
  };

  updateNote = async (noteId, updatedData) => {
    try {
      const noteRef = doc(db, "Notes", noteId);
      await updateDoc(noteRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating note:", error);
      return { success: false, message: error.message };
    }
  };

  deleteNote = async (noteId) => {
    try {
      const noteRef = doc(db, "Notes", noteId);
      await deleteDoc(noteRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting note:", error);
      return { success: false, message: error.message };
    }
  };
}

export default new NotesService();
