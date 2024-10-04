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
  deleteDoc,
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
      const querySnapshot = await getDocs(groupRef);
      const groups = [];

      querySnapshot.forEach((doc) => {
        const groupData = doc.data();
        // Check if any member's email matches the adminEmail
        const isAdmin = groupData.members.some(
          (member) => member.email === adminEmail
        );
        if (isAdmin) {
          groups.push({ id: doc.id, ...groupData });
        }
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

  addExpenseToGroup = async (groupIdField, expense) => {
    try {
      // Change the field name here to match the property name in your document that holds the group ID
      const q = query(
        collection(db, "Groups"),
        where("id", "==", groupIdField) // Assuming 'id' is the field storing the group ID
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No document found with ID:", groupIdField);
        throw new Error(`No document found with ID: ${groupIdField}`);
      }

      const groupDocRef = querySnapshot.docs[0].ref;

      // Add the expense to the expenses array
      await updateDoc(groupDocRef, {
        expenses: arrayUnion(expense),
      });
    } catch (error) {
      console.error("Error adding expense to group: ", error);
      throw error;
    }
  };

  removeExpenseFromGroup = async (groupIdField, expenseId) => {
    try {
      // Query to find the group by its ID
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

      // Find the expense object with the matching ID
      const expenseToRemove = groupData.expenses.find(
        (expense) => expense.id === expenseId
      );

      if (!expenseToRemove) {
        console.error("No expense found with ID:", expenseId);
        throw new Error(`No expense found with ID: ${expenseId}`);
      }

      // Remove the expense from the expenses array
      await updateDoc(groupDocRef, {
        expenses: arrayRemove(expenseToRemove),
      });
    } catch (error) {
      console.error("Error removing expense from group: ", error);
      throw error;
    }
  };

  deleteGroup = async (groupIdField) => {
    try {
      // Query to find the group by its ID
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

      // Delete the group document
      await deleteDoc(groupDocRef);
    } catch (error) {
      console.error("Error deleting group: ", error);
      throw error;
    }
  };

  updateUserSettledStatus = async (groupIdField, userEmail, userSettled) => {
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
      const memberIndex = groupData.members.findIndex(
        (member) => member.email === userEmail
      );

      if (memberIndex === -1) {
        console.error("No member found with email:", userEmail);
        throw new Error(`No member found with email: ${userEmail}`);
      }

      // Update the userSettled property for the found member
      const updatedMembers = [...groupData.members];
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        userSettled, // Set the userSettled property
      };

      // Update the members array in Firestore
      await updateDoc(groupDocRef, {
        members: updatedMembers,
      });
    } catch (error) {
      console.error("Error updating user settled status: ", error);
      throw error;
    }
  };
}

export default new GroupService();
