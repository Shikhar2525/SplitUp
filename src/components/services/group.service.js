import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayRemove,
  arrayUnion,
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
      throw error;
    }
  };

  // Method to remove a member from the group by their email
  removeMemberFromGroup = async (groupIdField, email) => {
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
      const groupData = querySnapshot.docs[0].data();

      // Find the member object with the matching email
      const memberToRemove = groupData.members.find(
        (member) => member.email === email
      );

      if (!memberToRemove) {
        console.error("No member found with email:", email);
        throw new Error(`No member found with email: ${email}`);
      }

      // Remove the member from the members array
      await updateDoc(groupDocRef, {
        members: arrayRemove(memberToRemove),
      });

      console.log(`Member with email ${email} removed successfully.`);
    } catch (error) {
      console.error("Error removing member from group: ", error);
      throw error;
    }
  };

  getUserFromGroup = async (groupIdField, userEmail) => {
    try {
      const q = query(
        collection(db, "Groups"),
        where("id", "==", groupIdField)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No document found with ID:", groupIdField);
        return null; // or throw an error if preferred
      }

      const groupData = querySnapshot.docs[0].data();
      const user = groupData.members.find(
        (member) => member.email === userEmail
      );

      return user || null; // Return user object or null if not found
    } catch (error) {
      console.error("Error retrieving user from group: ", error);
      throw error;
    }
  };
}

export default new GroupService();
