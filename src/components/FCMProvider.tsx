"use client";

import useFCM from "@/hooks/useFCM";

export default function FCMProvider({ children }: { children: React.ReactNode }) {
  // Yeh hook call hoty hi FCM permission request karega aur token generate karega
  useFCM();

  return <>{children}</>;
}
