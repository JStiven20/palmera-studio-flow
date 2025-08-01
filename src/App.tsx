import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import IncomeNew from "./pages/IncomeNew";
import ExpenseNew from "./pages/ExpenseNew";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Services from "./pages/Services";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/income/new" element={<ProtectedRoute><IncomeNew /></ProtectedRoute>} />
            <Route path="/expense/new" element={<ProtectedRoute><ExpenseNew /></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute adminOnly><Income /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute adminOnly><Expenses /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute adminOnly><Staff /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute adminOnly><Services /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
