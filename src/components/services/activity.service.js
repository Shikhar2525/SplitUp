import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  setDoc,
  where,
  addDoc, // Import addDoc to add a new document
} from "firebase/firestore";

// Reference to the 'Activity' collection in Firestore
const activityRef = collection(db, "Activity");

class ActivityService {
  // Fetch activities by user email
  fetchActivitiesByEmail = async (email) => {
    try {
      // Query to fetch logs where performedBy matches the email
      const performedByQuery = query(
        activityRef,
        where("details.performedBy", "==", email)
      );
      // Query to fetch logs where userAffected matches the email
      const userAffectedQuery = query(
        activityRef,
        where("details.userAffected", "==", email)
      );

      // Fetch documents for both queries
      const performedBySnapshot = await getDocs(performedByQuery);
      const userAffectedSnapshot = await getDocs(userAffectedQuery);

      const activities = [];

      // Process results from performedByQuery
      performedBySnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push(...data.logs); // Assuming logs is an array in each document
      });

      // Process results from userAffectedQuery
      userAffectedSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push(...data.logs); // Assuming logs is an array in each document
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
