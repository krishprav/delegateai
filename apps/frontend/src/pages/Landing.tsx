import Navbar from "@/components/Navbar";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Hero } from "@/components/landing/Hero";


export default function HomePage() {
    return (
        <AuroraBackground>
            <div className="relative z-10 w-full min-h-screen">
                <Navbar />
                <Hero />


                {/* Footer simple fallback */}
                <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5 bg-black/40 backdrop-blur-md">
                    <p>© {new Date().getFullYear()} Delegate. All rights reserved.</p>
                </footer>
            </div>
        </AuroraBackground>
    );
}
