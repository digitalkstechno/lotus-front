// src/hooks/useFCM.ts

"use client";

import { useEffect } from "react";
import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { getMessagingInstance } from "@/lib/firebase";
import { saveFcmTokenApi } from "@/services/userService";
import { toast } from "sonner";
import { useSelector } from "react-redux";

export const requestAndSaveFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) return;

    const currentToken = await getToken(messaging, {
      vapidKey: "BEY-U17Ca2jqHDabw_HnGFTjrHYzJGAasDbS5GunlUR1gUtqiyzuytoYFN0hQkgRiM2bgdMqNJ8srlPEPPwLdGk",
    });

    if (currentToken) {
      console.log("FCM Token:", currentToken);

      // Check if we already saved this token to the backend
      const savedToken = localStorage.getItem("fcm_token");
      
      if (savedToken !== currentToken) {
        // Call the backend API to save the FCM token and remove the old one
        try {
          await saveFcmTokenApi(currentToken, savedToken);
          localStorage.setItem("fcm_token", currentToken);
          console.log("FCM Token saved to backend successfully.");
        } catch (err) {
          console.error("Failed to save FCM token to backend", err);
        }
      } else {
        console.log("FCM Token is already saved to backend, skipping API call.");
      }
    }
  } catch (error) {
    console.error("FCM Error:", error);
  }
};

export default function useFCM() {
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      requestAndSaveFCMToken();
    } else {
      // If user is logged out locally (e.g. token cleared), delete the FCM token
      // This invalidates it with Firebase so no more background push notifications arrive here
      getMessagingInstance().then((messaging) => {
        if (messaging) {
          deleteToken(messaging).then(() => {
            console.log("FCM Token deleted locally because user is not authenticated.");
            localStorage.removeItem("fcm_token");
          }).catch(err => {
            console.log("Failed to delete FCM token locally", err);
          });
        }
      }).catch(console.error);
    }

    // Listen for foreground messages
    let unsubscribe: any;
    getMessagingInstance().then((messaging) => {
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Foreground Message received:", payload);
          if (payload.notification) {
            // Fallback to sonner toast for in-app UI
            toast(payload.notification.title || "New Notification", {
              description: payload.notification.body,
              duration: 5000,
              icon: "🔔"
            });

            // Also trigger the native OS notification via Service Worker / Native API
            try {
              // First try standard Notification
              const n = new Notification(payload.notification.title || "New Notification", {
                body: payload.notification.body,
                icon: "/favicon.ico"
              });
              n.onclick = () => window.focus();
            } catch (e) {
              // Fallback to Service Worker if standard API is blocked or deprecated
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistration().then((registration) => {
                  if (registration) {
                    registration.showNotification(payload.notification!.title || "New Notification", {
                      body: payload.notification!.body,
                      icon: "/favicon.ico",
                      data: payload.data,
                    });
                  }
                });
              }
            }
          }
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe(); // Clean up listener
    };
  }, [isAuthenticated]);
}