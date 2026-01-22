import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config/api";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const items: any[] = [];

interface UserData {
    id: string;
    email: string;
    name?: string;
}

const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

const getRandomColor = (name: string | undefined) => {
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-teal-500",
        "bg-orange-500",
    ];
    if (!name) return colors[0];
    const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
};

export function FloatingNavbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
                    withCredentials: true,
                });
                setUser(res.data.data);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, []);

    const handleProfile = () => {
        navigate("/profile");
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <Logo className="h-8 w-auto" />
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        {items.map((item) => (
                            <NavLink
                                key={item.title}
                                to={item.url}
                                state={item.url === "/dashboard" ? { resetWorkflow: true } : undefined}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={isActive ? "text-white" : "text-white/60"} size={18} />
                                        <span className={`${isActive ? "text-white font-medium" : ""}`}>{item.title}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleProfile}
                            className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors rounded-md"
                            variant="ghost"
                        >
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-inner border border-white/10 ${getRandomColor(user?.name)}`}>
                                {getInitials(user?.name)}
                            </div>
                            <span className="font-medium text-sm text-white hidden sm:inline">
                                {user?.name || "User"}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
