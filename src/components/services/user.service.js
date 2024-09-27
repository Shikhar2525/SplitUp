import { db } from "../../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const userRef = collection(db, "User");

class UserService {
  // Check if a user exists based on the email (or any unique field)
  userExists = async (email) => {
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if user exists
  };

  // Add a user only if they don't already exist
  addUniqueUser = async (newUser) => {
    const { email } = newUser;
    const exists = await this.userExists(email);
    if (exists) {
      return { success: false, message: "User already exists" };
    }
    await addDoc(userRef, newUser);
    return { success: true, message: "User added successfully" };
  };
}

export default new UserService();
