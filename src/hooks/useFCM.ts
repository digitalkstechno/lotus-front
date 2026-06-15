// src/hooks/useFCM.ts

"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export default function useFCM() {
  useEffect(() => {
    const generateToken = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        if (!messaging) return;

        const currentToken = await getToken(messaging, {
          vapidKey: "BEY-U17Ca2jqHDabw_HnGFTjrHYzJGAasDbS5GunlUR1gUtqiyzuytoYFN0hQkgRiM2bgdMqNJ8srlPEPPwLdGk",
        });

        if (currentToken) {
          console.log("FCM Token:", currentToken);

          // backend me save karo
          // Abhi ke liye API call comment kiya hai, baad me call kar lena
          /*
          await fetch("/api/save-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: currentToken,
            }),
          });
          */
        }
      } catch (error) {
        console.error("FCM Error:", error);
      }
    };

    generateToken();

    // Listen for foreground messages
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground Message received:", payload);
        // Yaha par aap apna toast notification dikha sakte ho (e.g. react-hot-toast, sonner)
        // alert(`New notification: ${payload.notification?.title}`);
      });
      return () => {
        unsubscribe(); // Clean up listener
      };
    }
  }, []);
}