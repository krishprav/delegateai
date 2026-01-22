import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InteractiveWorkflowHero } from "./InteractiveWorkflowHero";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

export function Hero() {
    const headingRef = useRef<HTMLHeadingElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);
    const btnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
            headingRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2 }
        )
            .fromTo(
                subRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                "-=0.5"
            )
            .fromTo(
                btnRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6 },
                "-=0.4"
            );
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 md:px-8 lg:px-12 pt-32">

            {/* Text Content */}
            <div className="z-10 flex flex-col items-center text-center max-w-4xl mx-auto mb-16">


                <h1 ref={headingRef} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                    <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                        Automate your
                    </span>
                    <br />
                    <span className="bg-gradient-to-b from-white/60 to-white/30 bg-clip-text text-transparent">
                        entire workflow.
                    </span>
                </h1>

                <p ref={subRef} className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                    Build powerful AI agents and connect your favorite tools with a visual,
                    node-based editor. No code required, but code available when you need it.
                </p>

                <div ref={btnRef} className="flex flex-col sm:flex-row items-center gap-5">
                    <Button asChild className="h-14 px-8 text-base">
                        <Link to="/signup">
                            Start Building Free <ArrowRight className="ml-2 w-4 h-4 text-white/70" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="h-14 px-8 text-base bg-transparent border border-white/20 text-white hover:bg-white/5 hover:text-white transition-all duration-300 hover:border-white/40 active:scale-95">
                        <Link to="#">
                            View Documentation
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Rich Workflow Visualization */}
            <div className="z-10 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both px-2 md:px-0">
                <InteractiveWorkflowHero />
            </div>

        </div>
    );
}
