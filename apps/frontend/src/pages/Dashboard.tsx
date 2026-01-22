import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import type { CredentialsI } from "@delegate/db";

import axios from "axios";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config/api";
import { CredentialDialogContent } from "@/components/CredentialDialogContent";
import { DashboardTabs } from "@/components/DashboardTabs";
import { Link, useLocation } from "react-router-dom";
import { useWorkflowStore } from "@/store/workflowStore";

import { AuroraBackground } from "@/components/AuroraBackground";

const Home = () => {
  const location = useLocation();
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);
  const [credApis, setCredApis] = useState<CredentialsI[]>([]);
  const [credName, setCredName] = useState<string>("");
  const [currCredApi, setCredCurrApi] = useState<CredentialsI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reset workflow when navigating to dashboard with reset flag
  useEffect(() => {
    if (location.state?.resetWorkflow === true) {
      resetWorkflow();
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, resetWorkflow]);

  console.log(credApis, credName, currCredApi);

  return (
    <AuroraBackground>
      <div className="w-full h-full flex flex-col relative z-20 pt-16">
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Redundant header removed */}
          </div>
          <div className="flex gap-3">
            <Link to={"/prompt"}>
              <Button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm transition-all hover:scale-105 rounded-lg flex items-center gap-2">
                Create with Prompt
              </Button>
            </Link>
            <Link to={"/create"} state={{ resetWorkflow: true }}>
              <Button className="px-4 py-2 bg-white text-black hover:bg-white/90 border border-transparent shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-105 rounded-lg">
                Create Manually
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={async () => {
                    const res = await axios.get(
                      `${BACKEND_URL}/api/v1/cred/get-all`,
                      {
                        withCredentials: true,
                      }
                    );
                    setCredApis(res.data.data);
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all rounded-lg"
                >
                  Add Credentials
                </Button>
              </DialogTrigger>

              <CredentialDialogContent
                credApis={credApis}
                credName={credName}
                currCredApi={currCredApi}
                setCredName={setCredName}
                setCredCurrApi={setCredCurrApi}
                onSuccess={() => setIsDialogOpen(false)}
              />
            </Dialog>
          </div>
        </div>

        <div className="flex-1 w-full p-6 overflow-y-auto">
          <DashboardTabs />
        </div>
      </div>
    </AuroraBackground>
  );
};

export default Home;
