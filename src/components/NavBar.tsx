import { Button } from "@/components/ui/button";
import { useAuction } from "@/contexts/AuctionContext";
import { Gavel, Home, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const { isAdmin, toggleAdmin } = useAuction();
  const { pathname } = useLocation();

  return (
    <div className="sticky top-0 z-10 w-full bg-[#111828] shadow-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Gavel className="h-8 w-8 text-accentGold" />
          <span className="text-xl font-bold text-white">Gridiron Bid Blitz</span>
        </Link>

        <div className="hidden space-x-4 md:flex">
          <NavLink href="/" icon={<Home size={18} />} label="Home" active={pathname === "/"} />
          <NavLink href="/auctions" icon={<Gavel size={18} />} label="Auctions" active={pathname?.includes("/auctions")} />
          {isAdmin && (
            <NavLink href="/admin" icon={<Settings size={18} />} label="Admin" active={pathname?.includes("/admin")} />
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAdmin}
            className="border-accentGold text-accentGold hover:bg-accentGold hover:text-[#111828]"
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
      className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-110 ${active
        ? "bg-[#111828] text-white"
        : "text-gray-300 hover:bg-[#111828]/30 hover:text-white"
        }`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default NavBar;
