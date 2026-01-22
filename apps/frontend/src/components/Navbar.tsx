import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-2">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                    <Logo className="h-8 w-auto" />
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
                <Link to="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Product
                </Link>
                <Link to="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Solutions
                </Link>
                <Link to="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Resources
                </Link>
                <Link to="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Pricing
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/signin" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Sign In
                </Link>
                <Button asChild className="h-9 px-5 text-sm font-semibold transition-all hover:scale-[1.02]">
                    <Link to="/signup">
                        Get Started
                    </Link>
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
