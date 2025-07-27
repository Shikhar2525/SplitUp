import { db } from "../../firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  deleteField,
  collection,
} from "firebase/firestore";

class PresenceService {
  constructor() {
    // Track heartbeat intervals per group
    this.heartbeatIntervals = new Map();
    // Track visibility change listener
    this.visibilityListener = null;
  }

  // Update user's presence in a group
  updatePresence = async (groupId, userId, userData) => {
    try {
      const presenceRef = doc(collection(db, "presence"), groupId);

      // Set initial presence with current timestamp
      await setDoc(
        presenceRef,
        {
          [userId]: {
            ...userData,
            lastSeen: serverTimestamp(),
            lastHeartbeat: Date.now(),
            status: "online",
          },
        },
        { merge: true }
      );

      // Clear any existing heartbeat interval for this group
      if (this.heartbeatIntervals.has(groupId)) {
        clearInterval(this.heartbeatIntervals.get(groupId));
      }

      // Set up new heartbeat interval
      const heartbeatInterval = setInterval(async () => {
        if (document.visibilityState === "visible") {
          await setDoc(
            presenceRef,
            {
              [userId]: {
                ...userData,
                lastSeen: serverTimestamp(),
                lastHeartbeat: Date.now(),
                status: "online",
              },
            },
            { merge: true }
          );
        }
      }, 5000); // Send heartbeat every 5 seconds

      this.heartbeatIntervals.set(groupId, heartbeatInterval);

      // Set up visibility change listener if not already set
      if (!this.visibilityListener) {
        this.visibilityListener = document.addEventListener(
          "visibilitychange",
          async () => {
            if (document.visibilityState === "hidden") {
              await this.removePresence(groupId, userId);
            } else {
              await this.updatePresence(groupId, userId, userData);
            }
          }
        );
      }
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  };

  // Remove user's presence when they leave
  removePresence = async (groupId, userId) => {
    try {
      const presenceRef = doc(collection(db, "presence"), groupId);
      await setDoc(
        presenceRef,
        {
          [userId]: deleteField(),
        },
        { merge: true }
      );

      // Clear heartbeat interval for this group
      if (this.heartbeatIntervals.has(groupId)) {
        clearInterval(this.heartbeatIntervals.get(groupId));
        this.heartbeatIntervals.delete(groupId);
      }
    } catch (error) {
      console.error("Error removing presence:", error);
    }
  };

  // Subscribe to presence updates for a group
  subscribeToPresence = (groupId, currentUserEmail, callback) => {
    if (!groupId) return () => {};
    const presenceRef = doc(collection(db, "presence"), groupId);

    return onSnapshot(presenceRef, (docSnap) => {
      if (docSnap.exists()) {
        const presenceData = docSnap.data();
        const now = Date.now();

        const activeUsers = Object.entries(presenceData)
          .filter(([email, data]) => {
            if (email === currentUserEmail) return false;

            const lastHeartbeat = data.lastHeartbeat;
            if (!lastHeartbeat) return false;

            // Consider user active only if heartbeat received in last 10 seconds
            return now - lastHeartbeat < 10000;
          })
          .map(([id, data]) => ({
            id,
            ...data,
            lastSeen: data.lastSeen?.toDate(),
          }));

        callback(activeUsers);

        // Clean up stale presence data
        const staleUsers = Object.entries(presenceData)
          .filter(([_, data]) => (now - (data.lastHeartbeat || 0)) > 10000)
          .reduce((acc, [email]) => {
            acc[email] = deleteField();
            return acc;
          }, {});

        if (Object.keys(staleUsers).length > 0) {
          setDoc(presenceRef, staleUsers, { merge: true }).catch((error) =>
            console.error("Error cleaning up presence:", error)
          );
        }
      } else {
        callback([]);
      }
    });
  };

  cleanup = (groupId, userId) => {
    // Clear all intervals and listeners
    if (this.heartbeatIntervals.has(groupId)) {
      clearInterval(this.heartbeatIntervals.get(groupId));
      this.heartbeatIntervals.delete(groupId);
    }

    if (this.visibilityListener) {
      document.removeEventListener("visibilitychange", this.visibilityListener);
      this.visibilityListener = null;
    }

    // Remove presence
    return this.removePresence(groupId, userId);
  };
}

export default new PresenceService();
