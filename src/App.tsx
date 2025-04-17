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
import { AuctionsPage, AuctionPage } from "./pages/AuctionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuctionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen">
            <NavBar />
            <main className="flex-1 pl-64">
              <div className="container mx-auto p-8">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/create-auction" element={<CreateAuctionForm />} />
                  <Route path="/admin/edit-auction/:auctionId" element={<CreateAuctionForm />} />
                  <Route path="/auctions" element={<AuctionsPage />} />
                  <Route path="/auctions/:auctionId" element={<AuctionPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuctionProvider>
  </QueryClientProvider>
);

export default App;
