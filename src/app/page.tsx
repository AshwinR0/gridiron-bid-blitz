import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <h1 className="text-4xl font-bold text-white">Welcome to Gridiron Bid Blitz</h1>
            <p className="text-xl text-gray-300">Your ultimate fantasy football auction platform</p>
            <div className="flex space-x-4">
                <Link href="/auctions">
                    <Button className="bg-accentGold text-scoreboardBlack hover:bg-accentGold/90">
                        View Auctions
                    </Button>
                </Link>
                <Link href="/auctions/create">
                    <Button variant="outline" className="border-accentGold text-accentGold hover:bg-accentGold hover:text-scoreboardBlack">
                        Create Auction
                    </Button>
                </Link>
            </div>
        </div>
    );
} 