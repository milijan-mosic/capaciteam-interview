import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Login } from "@/pages/auth/Login";
import { MyFiles } from "@/pages/dashboard/Files";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const root: HTMLElement | null = document.getElementById("root");

createRoot(root!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route
          index
          element={
            <ProtectedRoute>
              <MyFiles />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
