import { Button } from "@/components/ui/button";
import { useAuction } from "@/contexts/AuctionContext";
import { Home, Settings, User, Gavel } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import auctionBuddyLogo from "@/assets/Auction_buddy.png";
import { AuroraText } from "@/components/ui/aurora-text";
import { useIsMobile } from "@/hooks/use-mobile"; // Import the correct hook

const NavBar = () => {
  const { isAdmin, toggleAdmin } = useAuction();
  const { pathname } = useLocation();
  const isMobile = useIsMobile(); // Use the correct hook

  console.log("isMobile:", isMobile); // Debug log to verify mobile detection

  return (
    <div
      className={`fixed z-10 bg-[#111828] shadow-md ${isMobile ? "bottom-0 w-full h-16" : "left-0 top-0 h-full w-64"}`}
    >
      <div className={`flex ${isMobile ? "flex-row justify-around items-center" : "flex-col"} h-full`}>
        {!isMobile && (
          <div className="flex items-center gap-2 p-4">
            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <img src={auctionBuddyLogo} alt="Auction Buddy" className="h-12 w-auto" />
              <AuroraText className="text-[24px] md:text-[20px] font-bold">Auction Buddy</AuroraText>
            </Link>
          </div>
        )}

        <nav
          className={`flex ${isMobile ? "flex-row space-x-4" : "flex-col space-y-1"} ${isMobile ? "p-2" : "p-0 pt-8"}`}
        >
          <NavLink href="/" icon={<Home size={18} />} label="Home" active={pathname === "/"} isMobile={isMobile} />
          <NavLink
            href="/auctions"
            icon={<Gavel size={18} />}
            label="Auctions"
            active={pathname?.includes("/auctions")}
            isMobile={isMobile}
          />
          {isAdmin && (
            <NavLink
              href="/admin"
              icon={<Settings size={18} />}
              label="Admin"
              active={pathname?.includes("/admin")}
              isMobile={isMobile}
            />
          )}
        </nav>

        {!isMobile && (
          <div className="mt-auto p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAdmin}
              className="w-full border-accentGold text-accentGold hover:bg-accentGold hover:text-[#111828]"
            >
              <User size={16} className="mr-2" />
              {isAdmin ? "Switch to User" : "Switch to Admin"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isMobile?: boolean;
}

const NavLink = ({ href, icon, label, active, isMobile }: NavLinkProps) => {
  return (
    <Link
      to={href}
      className={`group flex items-center ${isMobile ? "gap-2" : "gap-3"} px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
        ? "text-white"
        : "text-gray-400 hover:text-white"}`}
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${active ? "bg-white" : "group-hover:bg-[#111828]/20"}`}>
        <div className={active ? (isMobile ? "text-[#10A777]" : "text-[#10A777]") : ""}>{icon}</div>
      </div>
      {label}
    </Link>
  );
};

export default NavBar;
