import { db } from "../../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

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
      const q = query(groupRef, where("admin", "==", adminEmail));
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
}

export default new GroupService();
