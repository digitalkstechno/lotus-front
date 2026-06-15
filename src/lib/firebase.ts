import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

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

export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;