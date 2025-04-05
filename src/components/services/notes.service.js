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

  updateNote = async (noteId, updatedData, userEmail) => {
    try {
      // Get the note first
      const noteRef = doc(db, "Notes", noteId);
      const noteDoc = await getDoc(noteRef);
      const note = noteDoc.data();

      // Get group data to check admin status
      const group = await groupService.getGroupById(note.groupId);
      
      // Check permissions
      if (!group || (group.admin?.email !== userEmail && note.createdBy?.email !== userEmail)) {
        return { 
          success: false, 
          message: "You don't have permission to modify this note" 
        };
      }

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

  deleteNote = async (noteId, userEmail) => {
    try {
      // Get the note first
      const noteRef = doc(db, "Notes", noteId);
      const noteDoc = await getDoc(noteRef);
      const note = noteDoc.data();

      // Get group data to check admin status
      const group = await groupService.getGroupById(note.groupId);
      
      // Check permissions
      if (!group || (group.admin?.email !== userEmail && note.createdBy?.email !== userEmail)) {
        return { 
          success: false, 
          message: "You don't have permission to delete this note" 
        };
      }

      await deleteDoc(noteRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting note:", error);
      return { success: false, message: error.message };
    }
  };
}

export default new NotesService();
