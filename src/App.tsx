
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import { AuctionProvider } from "./contexts/AuctionContext";
import AdminDashboard from "./components/AdminDashboard";
import CreateAuctionForm from "./components/CreateAuctionForm";
import AuctionHistory from "./components/AuctionHistory";
import { AuctionsPage, AuctionPage } from "./pages/AuctionsPage";
import { useAuction } from "@/contexts/AuctionContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuctionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <NavBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create-auction" element={<CreateAuctionForm />} />
                <Route path="/auctions" element={<AuctionsPage />} />
                <Route path="/auctions/:auctionId" element={<AuctionPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuctionProvider>
  </QueryClientProvider>
);

export default App;
