
import { Button } from "@/components/ui/button";
import { useAuction } from "@/contexts/AuctionContext";
import { Gavel, Home, Settings, Trophy, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const { isAdmin, toggleAdmin } = useAuction();
  const location = useLocation();

  return (
    <div className="sticky top-0 z-10 w-full bg-scoreboardBlack shadow-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Gavel className="h-8 w-8 text-accentGold" />
          <span className="text-xl font-bold text-white">Gridiron Bid Blitz</span>
        </div>

        <div className="hidden space-x-4 md:flex">
          <NavLink to="/" icon={<Home size={18} />} label="Home" active={location.pathname === "/"} />
          <NavLink to="/auctions" icon={<Gavel size={18} />} label="Auctions" active={location.pathname.includes("/auctions")} />
          <NavLink to="/tournaments" icon={<Trophy size={18} />} label="Tournaments" active={location.pathname.includes("/tournaments")} />
          {isAdmin && (
            <NavLink to="/admin" icon={<Settings size={18} />} label="Admin" active={location.pathname.includes("/admin")} />
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleAdmin}
            className="border-accentGold text-accentGold hover:bg-accentGold hover:text-scoreboardBlack"
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
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink = ({ to, icon, label, active }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-fieldGreen text-white"
          : "text-gray-300 hover:bg-fieldGreen-dark/30 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default NavBar;
