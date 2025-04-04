import { db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";

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

  getAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(userRef);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.name) {
          users.push({ id: doc.id, ...userData });
        }
      });
      
      return users.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  addFriend = async (userEmail, friendEmail) => {
    try {
      console.log("Adding friend:", { userEmail, friendEmail });
      
      // Get user document
      const userQuery = query(userRef, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        console.error("User not found");
        return { success: false, message: "User not found" };
      }

      // Get user document reference and data
      const userDoc = userSnapshot.docs[0];
      const userDocRef = doc(db, "User", userDoc.id);
      const userData = userDoc.data();

      console.log("Current user data:", userData);

      // Initialize or update friends array
      const currentFriends = userData.friends || [];
      const newFriends = [...currentFriends, friendEmail];

      console.log("Updating friends array:", newFriends);

      // Update document with new friends array
      await updateDoc(userDocRef, {
        friends: newFriends
      });

      console.log("Friend added successfully");
      return { success: true, message: "Friend added successfully" };
    } catch (error) {
      console.error("Error in addFriend:", error);
      return { success: false, message: error.message };
    }
  };

  removeFriend = async (userEmail, friendEmail) => {
    try {
      console.log("Removing friend:", { userEmail, friendEmail });
      
      // Get user document
      const userQuery = query(userRef, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        console.error("User not found");
        return { success: false, message: "User not found" };
      }

      // Get user document reference and data
      const userDoc = userSnapshot.docs[0];
      const userDocRef = doc(db, "User", userDoc.id);
      const userData = userDoc.data();

      console.log("Current user data:", userData);  

      // Filter out the friend email
      const currentFriends = userData.friends || [];
      const updatedFriends = currentFriends.filter(email => email !== friendEmail);

      console.log("Updating friends array:", updatedFriends);

      // Update document with new friends array
      await updateDoc(userDocRef, {
        friends: updatedFriends
      });

      console.log("Friend removed successfully");
      return { success: true, message: "Friend removed successfully" };
    } catch (error) {
      console.error("Error in removeFriend:", error);
      return { success: false, message: error.message };
    }
  };

  updateUserVisibility = async (email, isHidden) => {
    try {
      const userQuery = query(userRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(doc(userRef, userDoc.id), {
          isHidden: isHidden
        });
        return { success: true };
      }
      return { success: false, message: "User not found" };
    } catch (error) {
      console.error("Error updating user visibility:", error);
      return { success: false, message: error.message };
    }
  };
}

export default new UserService();
