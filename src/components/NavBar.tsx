import { Button } from "@/components/ui/button";
import { useAuction } from "@/contexts/AuctionContext";
import { Home, Settings, User, Gavel } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import auctionBuddyLogo from "@/assets/Auction_buddy.png";
import { AuroraText } from "@/components/ui/aurora-text";

const NavBar = () => {
  const { isAdmin, toggleAdmin } = useAuction();
  const { pathname } = useLocation();

  return (
    <div className="fixed left-0 top-0 z-10 h-full w-64 bg-[#111828] shadow-md">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 p-4">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <img src={auctionBuddyLogo} alt="Auction Buddy" className="h-12 w-auto" />
            <AuroraText className="text-1xl md:text-1xl font-bold">Auction Buddy</AuroraText>
            {/* <span className="text-xl font-bold text-white">Auction Buddy</span> */}
          </Link>
        </div>

        <nav className="flex flex-col space-y-1 p-0 pt-8">
          <NavLink href="/" icon={<Home size={18} />} label="Home" active={pathname === "/"} />
          <NavLink href="/auctions" icon={<Gavel size={18} />} label="Auctions" active={pathname?.includes("/auctions")} />
          {isAdmin && (
            <NavLink href="/admin" icon={<Settings size={18} />} label="Admin" active={pathname?.includes("/admin")} />
          )}
        </nav>

        <div className="mt-auto p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAdmin}
            className="w-full border-accentGold text-accentGold hover:bg-accentGold hover:text-[#111828]"
          >
            <User size={16} className="mr-2" />
            {isAdmin ? 'Switch to User' : 'Switch to Admin'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink = ({ href, icon, label, active }: NavLinkProps) => {
  return (
    <Link
      to={href}
      className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
        ? "bg-[#10A777] text-white"
        : "text-gray-300 hover:bg-[#111828]/30 hover:text-white"
        }`}
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${active ? "bg-white" : "group-hover:bg-[#111828]/20"
        }`}>
        <div className={active ? "text-[#10A777]" : ""}>{icon}</div>
      </div>
      {label}
    </Link>
  );
};

export default NavBar;
