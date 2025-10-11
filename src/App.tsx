
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import English from "./pages/English";
import Chinese from "./pages/Chinese";
import German from "./pages/German";
import Russian from "./pages/Russian";
import MultiplicationGame from "./pages/MultiplicationGame";
import MixedGame from "./pages/MixedGame";
import UltimateGame from "./pages/UltimateGame";
import AIWriter from "./pages/AIWriter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/english" element={<English />} />
          <Route path="/chinese" element={<Chinese />} />
          <Route path="/german" element={<German />} />
          <Route path="/russian" element={<Russian />} />
          <Route path="/game" element={<MultiplicationGame />} />
          <Route path="/mixed-game" element={<MixedGame />} />
          <Route path="/ultimate-game" element={<UltimateGame />} />
          <Route path="/ai-writer" element={<AIWriter />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;