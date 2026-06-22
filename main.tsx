import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewInvoice from "./pages/NewInvoice";
import AllInvoices from "./pages/AllInvoices";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Quotations from "./pages/Quotations";
import QuotationForm from "./pages/QuotationForm";
import InvoiceDetail from "./pages/InvoiceDetail";
import WorkOrders from "./pages/WorkOrders";
import Deliveries from "./pages/Deliveries";
import Expenses from "./pages/Expenses";
import Purchases from "./pages/Purchases";
import Projects from "./pages/Projects";
import GlassOptimizer from "./pages/GlassOptimizer";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/new" element={<QuotationForm />} />
              <Route path="/quotations/:id/edit" element={<QuotationForm />} />
              <Route path="/invoice/new" element={<NewInvoice />} />
              <Route path="/invoices" element={<AllInvoices />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/invoices/:id/edit" element={<NewInvoice />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/glass-optimizer" element={<GlassOptimizer />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/gst-reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
