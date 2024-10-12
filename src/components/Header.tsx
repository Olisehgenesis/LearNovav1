import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  AcademicCapIcon,
  PlusCircleIcon,
  EnvelopeIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownFundLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Avatar,
  Name,
  Address,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import TokenButton from "./tokenButton";

function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address, isConnecting } = useAccount();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const renderWalletButton = () => {
    if (isConnecting) {
      return <div className="text-sm font-medium">Connecting...</div>;
    }

    return (
      <div className="flex items-center space-x-2">
        <TokenButton address={address as `0x${string}`} />
        <Wallet>
          <ConnectWallet>
            {address ? (
              <div className="flex items-center space-x-2">
                <Avatar address={address} className="h-8 w-8" />
                <Name className="text-sm font-medium" />
              </div>
            ) : (
              <span className="text-sm font-medium">Connect Wallet</span>
            )}
          </ConnectWallet>
          {address && (
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar address={address} className="h-12 w-12 mx-auto mb-2" />
                <Name className="text-center font-bold" />
                <Address className="text-center text-sm" />
                <EthBalance className="text-center text-sm font-medium mt-2" />
              </Identity>
              <WalletDropdownFundLink className="w-full text-center py-2 hover:bg-gray-100" />
              <WalletDropdownDisconnect className="w-full text-center py-2 hover:bg-gray-100 text-red-500" />
            </WalletDropdown>
          )}
        </Wallet>
      </div>
    );
  };

  return (
    <header className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Lear<span className="text-orange-200">Nova</span>
            </h1>
          </Link>

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

          <nav className="hidden md:flex space-x-4">
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
            <NavLink to="/contact" active={location.pathname === "/contact"}>
              <EnvelopeIcon className="w-5 h-5 mr-1" />
              Contact Us
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {renderWalletButton()}

            <NavLink to="/claim" active={location.pathname === "/claim"}>
              <GiftIcon className="w-5 h-5 mr-1" />
              Claim Free
            </NavLink>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
              Get LNT tokens
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4">
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
                to="/contact"
                active={location.pathname === "/contact"}
                onClick={toggleMenu}
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Contact Us
              </MobileNavLink>
              <MobileNavLink
                to="/claim"
                active={location.pathname === "/claim"}
                onClick={toggleMenu}
              >
                <GiftIcon className="w-5 h-5 mr-2" />
                Claim Free
              </MobileNavLink>
            </nav>
            <div className="mt-4 space-y-2">
              {renderWalletButton()}
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                Get LNT tokens
              </button>
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
          : "text-white hover:bg-green-600 hover:text-white"
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
          ? "bg-orange-100 text-orange-500"
          : "text-gray-700 hover:bg-green-100 hover:text-green-700"
      }`}
    >
      {children}
    </Link>
  );
}

export default Header;
