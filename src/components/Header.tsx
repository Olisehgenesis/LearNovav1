import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  AcademicCapIcon,
  PlusCircleIcon,
  UserIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Address, Identity } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";

function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address } = useAccount();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left section with title */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Lear<span className="text-orange-200">Nova</span>
          </h1>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3BottomLeftIcon className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-2">
            <NavLink to="/" active={location.pathname === "/"}>
              <HomeIcon className="w-5 h-5 mr-1" />
              Home
            </NavLink>
            <NavLink to="/quests" active={location.pathname === "/quests"}>
              <AcademicCapIcon className="w-5 h-5 mr-1" />
              Quests
            </NavLink>
            <NavLink to="/create" active={location.pathname === "/create"}>
              <PlusCircleIcon className="w-5 h-5 mr-1" />
              Create Quest
            </NavLink>
            <NavLink to="/profile" active={location.pathname === "/profile"}>
              <UserIcon className="w-5 h-5 mr-1" />
              Profile
            </NavLink>
          </nav>

          {/* OnchainKit Wallet Component - hidden on mobile, shown on desktop */}
          <div className="hidden md:block">
            <Wallet>
              <ConnectWallet>
                {address && <Avatar address={address} className="h-6 w-6" />}
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  {address && <Avatar address={address} />}
                  <Name />
                  <Address />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <nav className="flex flex-col space-y-2">
              <MobileNavLink
                to="/"
                active={location.pathname === "/"}
                onClick={toggleMenu}
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Home
              </MobileNavLink>
              <MobileNavLink
                to="/quests"
                active={location.pathname === "/quests"}
                onClick={toggleMenu}
              >
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                Quests
              </MobileNavLink>
              <MobileNavLink
                to="/create"
                active={location.pathname === "/create"}
                onClick={toggleMenu}
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Create Quest
              </MobileNavLink>
              <MobileNavLink
                to="/profile"
                active={location.pathname === "/profile"}
                onClick={toggleMenu}
              >
                <UserIcon className="w-5 h-5 mr-2" />
                Profile
              </MobileNavLink>
            </nav>
            <div className="mt-4">
              <Wallet>
                <ConnectWallet>
                  {address && <Avatar address={address} className="h-6 w-6" />}
                  <Name />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    {address && <Avatar address={address} />}
                    <Name />
                    <Address />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  active: boolean;
}

function NavLink({ to, children, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300
      ${
        active
          ? "bg-white text-orange-500"
          : "hover:bg-green-600 hover:text-white"
      }
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-500 focus:ring-white`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
  active,
  onClick,
}: NavLinkProps & { onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors duration-300
      ${
        active
          ? "bg-white text-orange-500"
          : "hover:bg-green-600 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export default Header;
