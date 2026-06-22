import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDcP1HniVCiQCELxg1lLf9FdFAKCjrgjqI",
  authDomain: "lotus-task.firebaseapp.com",
  projectId: "lotus-task",
  storageBucket: "lotus-task.firebasestorage.app",
  messagingSenderId: "469971831907",
  appId: "1:469971831907:web:e3e46f4275effd69683c56",
  measurementId: "G-CDEVT1SFKH"
};

const app = initializeApp(firebaseConfig);

export const getMessagingInstance = async () => {
  if (typeof window !== "undefined") {
    try {
      const supported = await isSupported();
      if (supported) {
        return getMessaging(app);
      }
    } catch (e) {
      console.warn("Firebase messaging not supported:", e);
    }
  }
  return null;
};