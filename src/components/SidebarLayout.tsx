"use client";

import Sidebar from "./sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";

function Layout({ children }: { children: React.ReactNode }) {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <>
      {!collapsed && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </>
  );
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
}
