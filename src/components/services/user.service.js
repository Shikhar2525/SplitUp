import { db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  doc,
  getDoc,
  onSnapshot, // <-- Add this import
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

const userRef = collection(db, "User");

class UserService {
  // Real-time: Subscribe to all users
  subscribeToAllUsers = (callback) => {
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();  
        if (userData.name) {
          users.push({ id: doc.id, ...userData });
        }
      });
      callback(users.sort((a, b) => a.name.localeCompare(b.name)));
    });
    return unsubscribe;
  };

  // Real-time: Subscribe to user by email
  // Keeps UI in sync with backend changes in real time
  subscribeToUserByEmail = (email, callback) => {
    const q = query(userRef, where("email", "==", email));
    console.log("Subscribing to user with email:", email);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("onSnapshot fired for user:", email, snapshot.docs.map(d => d.data()));
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        console.log("Subscription matched doc id:", doc.id, "with email:", doc.data().email, "Full doc:", doc.data());
        callback({ id: doc.id, ...doc.data() });
      } else {
        console.log("No user doc found for email:", email);
        callback(null);
      }
    });
    return unsubscribe;
  };


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
      const userDoc = userSnapshot.docs[0];
      const userDocRef = doc(db, "User", userDoc.id);
      // Atomic update with arrayUnion
      await updateDoc(userDocRef, {
        friends: arrayUnion(friendEmail)
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
      const userDoc = userSnapshot.docs[0];
      const userDocRef = doc(db, "User", userDoc.id);
      // Atomic update with arrayRemove
      await updateDoc(userDocRef, {
        friends: arrayRemove(friendEmail)
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
