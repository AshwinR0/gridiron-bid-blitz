import { AuctionManager } from "@/components/AuctionManager";

export default function AuctionsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Auctions</h1>
            <AuctionManager />
        </div>
    );
} 