import Logo from "@/assets/logos/logo.png";
import { UrlMapping } from "@/commons/url-mapping.common";
import { useLogin } from "@/services/apis/auth";
import { useAuthStore } from "@/services/stores/useAuthStore";
import { shortenAddress } from "@/utils/transaction_string";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount, useDisconnect } from "wagmi";

const NavigationBar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getWalletAddress, logout, user, login, isAuthenticated } =
    useAuthStore();
  const { mutate: loginMutate } = useLogin();

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const userImage = user?.image || "https://placehold.co/50x50";
  const walletAddress = getWalletAddress();

  const handleUserIconClick = () => navigate(UrlMapping.user_info);
  const handleDisconnect = () => {
    disconnect();
    logout();
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isConnected && address && !isAuthenticated) {
      loginMutate(
        { wallet_address: address },
        {
          onSuccess: async (data) => {
            try {
              login(data);
            } catch (error) {
              toast.error("Error setting authentication.");
            }
          },
          onError: (error) => {
            toast.error(`Login failed: ${error.message}`);
          },
        }
      );
    } else if (!isConnected && !address) {
      logout();
    }
  }, [isConnected, address, loginMutate, logout, login, isAuthenticated]);

  return (
    <header
      className={`bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg fixed w-full top-0 z-50 overflow-hidden${
        isScrolled ? " scrolled" : ""
      }`}
      style={{ position: "sticky", top: 0 }}
    >
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center py-4 px-6 min-w-fit">
        {/* Logo and Mobile Menu Toggle */}
        <div className="flex flex-row justify-between items-center w-full md:w-auto">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={Logo}
              alt="Logo"
              className="w-12 h-12 rounded-full shadow-lg"
            />
            <h1 className="text-xl font-bold text-white tracking-wide">
              ShibaWork 🦊
            </h1>
          </Link>
          <div className="lg:hidden ml-auto" onClick={toggleMenu}>
            {isMenuOpen ? (
              <AiOutlineClose className="text-white w-8 h-8 cursor-pointer transition-transform duration-300 transform hover:scale-110" />
            ) : (
              <AiOutlineMenu className="text-white w-8 h-8 cursor-pointer transition-transform duration-300 transform hover:scale-110" />
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          className={`${
            isMenuOpen ? "flex flex-col" : "hidden lg:flex"
          } lg:flex-row lg:space-x-6 items-center w-full lg:w-auto min-w-fit`}
        >
          {[
            { label: "Home", path: UrlMapping.home },
            { label: "Jobs", path: UrlMapping.jobs },
            { label: "Info", path: UrlMapping.info },
            { label: "How to Use", path: UrlMapping.how_to_use },
          ].map(({ label, path }) => (
            <Link
              key={label}
              to={path || "#"}
              className="text-white font-medium hover:underline transition duration-300 mt-2 lg:mt-0"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Authenticated User or Connect Wallet */}
        <div
          className={`${
            isMenuOpen
              ? "flex flex-col mt-4 space-y-4 lg:mt-0"
              : "hidden lg:flex lg:space-x-6"
          } items-center`}
        >
          {isConnected && isAuthenticated ? (
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 w-full">
              <Link
                to={UrlMapping.create || "#"}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-full font-medium shadow-lg transition duration-300 w-full lg:w-auto text-center min-w-fit"
              >
                Create Job
              </Link>

              <div
                className="flex items-center justify-center space-x-2 w-full lg:w-auto cursor-pointer"
                onClick={handleUserIconClick}
              >
                <img
                  src={userImage}
                  alt="User Icon"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                />
                <span className="text-white font-medium">
                  {shortenAddress(walletAddress) || "N/A"}
                </span>
              </div>

              <button
                onClick={handleDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full font-medium hover:shadow-xl transition duration-300 w-full lg:w-auto text-center min-w-fit"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={openConnectModal}
              className="bg-yellow-400 text-blue-800 py-2 px-5 rounded-full font-medium shadow-lg hover:bg-yellow-500 transition duration-300 w-full lg:w-auto text-center"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;
