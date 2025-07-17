import { AppLayout } from "@/components/app-layout";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <AppLayout>{children}</AppLayout>;
};

export default MainLayout;
