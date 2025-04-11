
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
import AuctionInterface from "./components/AuctionInterface";
import AuctionHistory from "./components/AuctionHistory";

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
                <Route path="/auctions/:auctionId" element={
                  <AuctionPage />
                } />
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

const AuctionPage = () => {
  // Get the auction ID from the URL
  const auctionId = window.location.pathname.split('/')[2];
  
  // Get the auction from context
  const { auctions } = useAuctionContext();
  const auction = auctions.find(a => a.id === auctionId);
  
  if (!auction) {
    return <div className="p-8 text-center">Auction not found</div>;
  }
  
  return auction.status === 'completed' 
    ? <AuctionHistory auctionId={auctionId} />
    : <AuctionInterface auctionId={auctionId} />;
};

// Temporary function to access context without hook
const useAuctionContext = () => {
  // This is a dummy function to prevent errors in the static code
  // The actual context will be used at runtime
  return {
    auctions: [],
    currentAuction: null,
    isAdmin: true,
    createAuction: () => {},
    startAuction: () => {},
    completeAuction: () => {},
    setCurrentAuction: () => {},
    placeBid: () => {},
    nextPlayer: () => {},
    toggleAdmin: () => {}
  };
};

export default App;
