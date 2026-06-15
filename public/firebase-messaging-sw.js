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

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background Message:", payload);

  self.registration.showNotification(
    payload.notification?.title || "Notification",
    {
      body: payload.notification?.body,
      icon: "/favicon.ico",
    }
  );
});