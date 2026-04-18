import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "./context/AuthContext.tsx"
import Routes from "./routes/routes.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Routes/>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
