import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc, // Import addDoc to add a new document
  onSnapshot // <-- Add this import
} from "firebase/firestore";

// Reference to the 'Activity' collection in Firestore
const activityRef = collection(db, "Activity");

class ActivityService {
  // Real-time: Subscribe to activities by email (performedBy, userAffected, splitBetween, or members)
  subscribeToActivitiesByEmail = (email, callback) => {
    // Listen to all activity logs and filter client-side for all relevant ones
    const unsubscribe = onSnapshot(collection(db, "Activity"), (snapshot) => {
      const activities = [];
      snapshot.forEach((doc) => {
        const log = doc.data();
        const details = log.details || {};
        const members = details.members || [];
        if (
          details.performedBy?.email === email ||
          details.userAffected?.email === email ||
          (Array.isArray(details.splitBetween) && details.splitBetween.includes(email)) ||
          (Array.isArray(members) && members.some((member) => member.email === email))
        ) {
          activities.push(log);
        }
      });
      // Filter unique activities by logId
      const uniqueActivities = Array.from(
        new Map(activities.map((activity) => [activity.logId, activity])).values()
      );
      callback(uniqueActivities);
    });
    return unsubscribe;
  };

  // Fetch activities by user email
  fetchActivitiesByEmail = async (email) => {
    try {
      // Query to fetch logs where performedBy.email matches the email
      const performedByQuery = query(
        activityRef,
        where("details.performedBy.email", "==", email)
      );

      // Query to fetch logs where userAffected.email matches the email
      const userAffectedQuery = query(
        activityRef,
        where("details.userAffected.email", "==", email)
      );

      // Query to fetch logs where splitBetween contains the email
      const splitBetweenQuery = query(
        activityRef,
        where("details.splitBetween", "array-contains", email)
      );

      // Fetch documents for all queries
      const performedBySnapshot = await getDocs(performedByQuery);
      const userAffectedSnapshot = await getDocs(userAffectedQuery);
      const splitBetweenSnapshot = await getDocs(splitBetweenQuery);
      const allSnapshots = [
        performedBySnapshot,
        userAffectedSnapshot,
        splitBetweenSnapshot,
      ];

      const activities = [];

      // Process results from all queries
      allSnapshots.forEach((snapshot) => {
        snapshot.forEach((doc) => {
          const log = doc.data();
          activities.push(log); // Push the log document
        });
      });

      // Fetch all documents and filter for members array containing email
      const allLogsSnapshot = await getDocs(activityRef);
      allLogsSnapshot.forEach((doc) => {
        const log = doc.data();
        const members = log.details.members || [];

        // Client-side filtering: check if any member in the array has the given email
        if (members.some((member) => member.email === email)) {
          activities.push(log); // Push the log if email is found in members array
        }
      });

      // Filter unique activities by logId to avoid duplicates
      const uniqueActivities = Array.from(
        new Map(
          activities.map((activity) => [activity.logId, activity])
        ).values()
      );

      return uniqueActivities;
    } catch (error) {
      console.error("Error fetching activities: ", error);
      throw new Error("Failed to fetch activities");
    }
  };

  addActivityLog = async (activityData) => {
    try {
      // Reference to the 'Activity' collection
      const activityDocRef = collection(db, "Activity");

      // Add a new document with the activity data
      await addDoc(activityDocRef, activityData); // This adds the log as a new document

      return { success: true, message: "Activity added successfully" };
    } catch (error) {
      console.error("Error adding activity: ", error);
      return { success: false, message: "Failed to add activity" };
    }
  };

  deleteLogsByGroupId = async (groupId) => {
    try {
      // Query to fetch logs where details.grouped matches the groupId
      const groupedQuery = query(
        activityRef,
        where("details.groupId", "==", groupId)
      );

      // Fetch documents for the query
      const groupedSnapshot = await getDocs(groupedQuery);

      // Prepare an array of promises for deletion
      const deletePromises = [];

      // Loop through each document and prepare to delete
      groupedSnapshot.forEach((docSnapshot) => {
        const docRef = doc(db, "Activity", docSnapshot.id); // Correctly create document reference
        deletePromises.push(deleteDoc(docRef)); // Add deletion promise
      });

      // Wait for all deletion promises to complete
      await Promise.all(deletePromises);

      return { success: true, message: "Logs deleted successfully" };
    } catch (error) {
      console.error("Error deleting logs: ", error);
      return { success: false, message: "Failed to delete logs" };
    }
  };
}

export default new ActivityService();
