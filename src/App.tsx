import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileProvider } from "@/store/profileStore";
import { LanguageProvider } from "@/store/languageStore";
import { AssistantProvider } from "@/store/assistantStore";
import ProtectedLayout from "@/components/ProtectedLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MapaNavios from "./pages/MapaNavios";
import Bercos from "./pages/Bercos";
import Fila from "./pages/Fila";
import Liberacoes from "./pages/Liberacoes";
import Documentos from "./pages/Documentos";
import Alertas from "./pages/Alertas";
import Riscos from "./pages/Riscos";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AssistantProvider>
          <ProfileProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mapa"       element={<ProtectedLayout><MapaNavios /></ProtectedLayout>} />
                <Route path="/dashboard"  element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
                <Route path="/bercos"     element={<ProtectedLayout><Bercos /></ProtectedLayout>} />
                <Route path="/fila"       element={<ProtectedLayout><Fila /></ProtectedLayout>} />
                <Route path="/liberacoes" element={<ProtectedLayout><Liberacoes /></ProtectedLayout>} />
                <Route path="/documentos" element={<ProtectedLayout><Documentos /></ProtectedLayout>} />
                <Route path="/alertas"    element={<ProtectedLayout><Alertas /></ProtectedLayout>} />
                <Route path="/riscos"     element={<ProtectedLayout><Riscos /></ProtectedLayout>} />
                <Route path="/admin"      element={<ProtectedLayout><Admin /></ProtectedLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProfileProvider>
        </AssistantProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
