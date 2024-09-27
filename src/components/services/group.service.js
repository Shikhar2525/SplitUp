import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

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
}

export default new GroupService();
