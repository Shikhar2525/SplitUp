import { db } from "../../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const userRef = collection(db, "User");

class UserService {
  userExists = async (email) => {
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  addUniqueUser = async (newUser) => {
    const { email } = newUser;
    const exists = await this.userExists(email);
    if (exists) {
      return { success: false, message: "User already exists" };
    }
    await addDoc(userRef, newUser);
    return { success: true, message: "User added successfully" };
  };

  getUserByEmail = async (email) => {
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }
    const user = querySnapshot.docs[0].data();
    return { id: querySnapshot.docs[0].id, ...user };
  };
}

export default new UserService();
