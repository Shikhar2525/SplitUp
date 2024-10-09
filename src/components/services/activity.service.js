import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc, // Import addDoc to add a new document
} from "firebase/firestore";

// Reference to the 'Activity' collection in Firestore
const activityRef = collection(db, "Activity");

class ActivityService {
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
}

export default new ActivityService();
