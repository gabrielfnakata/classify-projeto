import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "./context/AuthContext.tsx"
import AppRoutes from "./routes/routes.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider delayDuration={0}>
        <AppRoutes/>
      </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)