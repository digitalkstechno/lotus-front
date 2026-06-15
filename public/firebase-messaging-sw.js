// Firebase SDKs
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDcP1HniVCiQCELxg1lLf9FdFAKCjrgjqI",
  authDomain: "lotus-task.firebaseapp.com",
  projectId: "lotus-task",
  storageBucket: "lotus-task.appspot.com",
  messagingSenderId: "469971831907",
  appId: "1:469971831907:web:e3e46f4275effd69683c56",
  measurementId: "G-CDEVT1SFKH"
});

// Yaha hum service worker ke default showNotification function ko override kar rahe hain
// Taki Firebase jab bhi default notification dikhaye, usme automatically hamara favicon lag jaye
const originalShowNotification = self.registration.showNotification;
self.registration.showNotification = function(title, options) {
  if (!options) options = {};
  options.icon = '/favicon.ico'; // Forcefully add favicon
  return originalShowNotification.call(this, title, options);
};

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background Data Message:", payload);
});