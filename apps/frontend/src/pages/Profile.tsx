import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LogOut, ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";

interface UserData {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/signin");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/signin");
    }
  };

  if (loading) {
    return (
      <AuroraBackground>
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="h-8 w-8 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          <span className="text-white/70">Loading profile...</span>
        </div>
      </AuroraBackground>
    );
  }

  if (error) {
    return (
      <AuroraBackground>
        <Card className="w-96 border-red-500/20 bg-black/40 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-red-400 text-center">{error}</p>
          </CardContent>
        </Card>
      </AuroraBackground>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#020202] overflow-y-auto">
      {/* Background Elements - copied from AuroraBackground but integrated for layout compatibility */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-950/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[15000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-950/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[18000ms]" />
        <div className="absolute top-[30%] right-[20%] w-[50vw] h-[50vw] bg-slate-900/5 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[20000ms]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 hover:border-white/10 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </Button>
      </div>

      <div className="relative z-10 w-full p-6 max-w-4xl mx-auto pt-16">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded bg-white"></div>
            <h2 className="text-2xl font-semibold text-white">Profile</h2>
          </div>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl shadow-xl">
          <CardHeader className="border-b border-white/10 bg-white/5">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="font-light tracking-wide">User Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {user?.name && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <User className="h-5 w-5 text-white/60" />
                <div>
                  <p className="text-sm text-white/40">Name</p>
                  <p className="font-medium text-white/90">{user.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
              <Mail className="h-5 w-5 text-white/60" />
              <div>
                <p className="text-sm text-white/40">Email</p>
                <p className="font-medium text-white/90">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
              <Calendar className="h-5 w-5 text-white/60" />
              <div>
                <p className="text-sm text-white/40">Member Since</p>
                <p className="font-medium text-white/90">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
              <Calendar className="h-5 w-5 text-white/60" />
              <div>
                <p className="text-sm text-white/40">Last Updated</p>
                <p className="font-medium text-white/90">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
              <User className="h-5 w-5 text-white/60" />
              <div>
                <p className="text-sm text-white/40">User ID</p>
                <p className="font-mono text-sm text-white/60 truncate">
                  {user?.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400 bg-transparent transition-all"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
