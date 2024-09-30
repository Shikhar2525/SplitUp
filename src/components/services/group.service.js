import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

const groupRef = collection(db, "Groups");

class GroupService {
  createGroup = async (newGroup) => {
    try {
      const docRef = await addDoc(groupRef, newGroup);
      return docRef;
    } catch (error) {
      console.error("Error adding group: ", error);
      throw error;
    }
  };

  fetchGroupsByAdminEmail = async (adminEmail) => {
    try {
      const q = query(groupRef, where("admin.email", "==", adminEmail));
      const querySnapshot = await getDocs(q);
      const groups = [];

      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });

      return groups;
    } catch (error) {
      console.error("Error fetching groups: ", error);
      throw error;
    }
  };

  addMemberToGroup = async (groupIdField, data) => {
    try {
      const q = query(
        collection(db, "Groups"),
        where("id", "==", groupIdField)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No document found with ID:", groupIdField);
        throw new Error(`No document found with ID: ${groupIdField}`);
      }
      const groupDocRef = querySnapshot.docs[0].ref;
      await updateDoc(groupDocRef, {
        members: arrayUnion(data),
      });
    } catch (error) {
      console.error("Error adding member to group: ", error);
      throw error; // Rethrow error to handle it in the calling function
    }
  };
}

export default new GroupService();
