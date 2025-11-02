
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import English from "./pages/English";
import Chinese from "./pages/Chinese";
import German from "./pages/German";
import Russian from "./pages/Russian";
import MultiplicationGame from "./pages/MultiplicationGame";
import MixedGame from "./pages/MixedGame";
import UltimateGame from "./pages/UltimateGame";
import AIWriter from "./pages/AIWriter";
import MinecraftGame from "./pages/MinecraftGame";
import Phone from "./pages/Phone";
import NotFound from "./pages/NotFound";
import InstallPrompt from "./components/InstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/english" element={<ProtectedRoute><English /></ProtectedRoute>} />
            <Route path="/chinese" element={<ProtectedRoute><Chinese /></ProtectedRoute>} />
            <Route path="/german" element={<ProtectedRoute><German /></ProtectedRoute>} />
            <Route path="/russian" element={<ProtectedRoute><Russian /></ProtectedRoute>} />
            <Route path="/game" element={<ProtectedRoute><MultiplicationGame /></ProtectedRoute>} />
            <Route path="/mixed-game" element={<ProtectedRoute><MixedGame /></ProtectedRoute>} />
            <Route path="/ultimate-game" element={<ProtectedRoute><UltimateGame /></ProtectedRoute>} />
            <Route path="/ai-writer" element={<ProtectedRoute><AIWriter /></ProtectedRoute>} />
            <Route path="/minecraft" element={<ProtectedRoute><MinecraftGame /></ProtectedRoute>} />
            <Route path="/phone" element={<ProtectedRoute><Phone /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;