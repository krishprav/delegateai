import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import type { UserCredentials, Workflow, INode } from "@delegate/db";
import axios from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Pencil, Save, Trash, Search, XIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ExecutionsTabImproved } from "@/components/ExecutionsTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CredentialFormData {
  name?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export const DashboardTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "workflows";

  const [credentials, setCredentials] = useState<UserCredentials[] | null>();
  const [loading, setLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [selectedCred, setSelectedCred] = useState<UserCredentials | null>(
    null
  );
  const [userWorkflows, setUserWorkflows] = useState<Workflow[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CredentialFormData>({});

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "deleted">("all");

  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const fetchWorkflows = async () => {
    try {
      setWorkflowLoading(true);
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/workflow/getAllWorkflows`,
        {},
        {
          withCredentials: true,
        }
      );

      setUserWorkflows(res.data.data);
      setWorkflowLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/v1/cred/all`, {
        withCredentials: true,
      });
      setCredentials(res.data.data);
    } catch (err) {
      console.error("Error fetching credentials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
    fetchWorkflows();
  }, []);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setFormData(selectedCred || {});
  };

  const handleChange = (field: string, value: string, nested = false) => {
    if (nested) {
      setFormData((prev: CredentialFormData) => ({
        ...prev,
        data: { ...prev.data, [field]: value },
      }));
    } else {
      setFormData((prev: CredentialFormData) => ({ ...prev, [field]: value }));
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/v1/workflow/${workflowId}`,
        {
          withCredentials: true,
        }
      );

      if (res) {
        toast.success("Workflow deleted successfully");
      }
      fetchWorkflows();
    } catch (error) {
      toast.error("Failed to delete workflow");
      console.log(error);
    }
  };

  const handleSave = async () => {
    if (!selectedCred) return;
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/cred/update/${selectedCred.id}`,
        formData,
        { withCredentials: true }
      );
      toast.success("Credential updated successfully!");
      fetchCredentials();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating credential", err);
      toast.error("Failed to update credential");
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs
        className="w-full"
        value={currentTab}
        onValueChange={handleTabChange}
      >
        <div className="w-full mb-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 hover:text-white transition-all"
              value="workflows"
            >
              Workflows
            </TabsTrigger>
            <TabsTrigger
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 hover:text-white transition-all"
              value="credentials"
            >
              Credentials
            </TabsTrigger>
            <TabsTrigger
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 hover:text-white transition-all"
              value="executions"
            >
              Executions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="workflows" className="mt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="text-sm font-semibold text-white/40 uppercase tracking-widest pl-1">Recent Workflows</div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex items-center">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === "all" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/40 hover:text-white/70"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/40 hover:text-white/70"}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus("inactive")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === "inactive" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-white/40 hover:text-white/70"}`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setFilterStatus("deleted")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === "deleted" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-white/40 hover:text-white/70"}`}
                >
                  Deleted
                </button>
              </div>
            </div>
          </div>

          {workflowLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              <span className="ml-3 text-white/60">Loading workflows...</span>
            </div>
          )}

          {!workflowLoading && userWorkflows && userWorkflows.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <p className="text-white/40 mb-2">No workflows found</p>
              <p className="text-sm text-white/20">Create your first workflow to get started</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {!workflowLoading &&
              userWorkflows &&
              userWorkflows
                .filter((wf) => {
                  const typedWf = wf as Workflow & { description?: string; deletedAt?: Date };
                  const matchesSearch =
                    typedWf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (typedWf.description &&
                      typedWf.description.toLowerCase().includes(searchTerm.toLowerCase()));

                  const isDeleted = typedWf.deletedAt;
                  const isActive = typedWf.active && !isDeleted;
                  const isDraft = !typedWf.active && !isDeleted;

                  if (filterStatus === "all") return matchesSearch && !isDeleted;
                  if (filterStatus === "deleted") return matchesSearch && !!isDeleted;
                  if (filterStatus === "active") return matchesSearch && isActive;
                  if (filterStatus === "inactive") return matchesSearch && isDraft;

                  return matchesSearch;
                })
                .map((wf) => (
                  <Card
                    key={wf.id}
                    onClick={() => {
                      navigate(`/workflow/${wf.id}`);
                    }}
                    className={`border-white/10 backdrop-blur-md transition-all duration-300 group cursor-pointer hover:scale-[1.01] hover:border-white/20
                    ${(wf as Workflow & { deletedAt?: Date }).deletedAt
                        ? "bg-red-900/10 border-red-500/20"
                        : "bg-[#1e1e1e] hover:bg-[#252525] hover:shadow-2xl shadow-lg border-white/5"
                      }`}
                  >
                    <CardHeader className="flex flex-row items-center justify-between px-5 py-4 gap-2 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${(wf as Workflow & { deletedAt?: Date }).deletedAt ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"}`} />
                        <CardTitle className="text-base font-medium text-white group-hover:text-emerald-400 transition-colors">
                          {wf.name}
                        </CardTitle>
                        {(wf as Workflow & { deletedAt?: Date }).deletedAt && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-medium uppercase tracking-wider">
                            Deleted
                          </span>
                        )}
                      </div>
                      {!(wf as Workflow & { deletedAt?: Date }).deletedAt && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash
                            width={16}
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card navigation
                              handleDeleteWorkflow(wf.id);
                            }}
                            className="cursor-pointer text-white/40 hover:text-red-400 transition-colors"
                          />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="px-5 py-4 space-y-4">
                      <p className="text-white/60 text-sm line-clamp-2 h-10">
                        {(wf as Workflow & { description?: string }).description || "No description provided"}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Created: {new Date(wf.createdAt!).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Updated: {new Date(wf.updatedAt!).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {wf.nodes && Array.isArray(wf.nodes) && wf.nodes.length > 0 && (
                        <div className="pt-3 border-t border-white/5">
                          <div className="flex flex-wrap gap-1.5">
                            {(wf.nodes as INode[]).slice(0, 4).map((node, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-md text-[10px] bg-white/5 text-white/70 border border-white/10"
                              >
                                {node.type?.split('.').pop() || 'Node'}
                              </span>
                            ))}
                            {wf.nodes.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] bg-white/5 text-white/40">
                                +{wf.nodes.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="credentials" className="mt-0">
          <div>
            <div className="mb-6 text-sm font-semibold text-white/40 uppercase tracking-widest pl-1">Connected Credentials</div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                <span className="ml-3 text-white/60">Loading credentials...</span>
              </div>
            )}

            {!loading && credentials && credentials.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-white/40">No credentials found</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {!loading &&
                credentials &&
                credentials.map((cred) => (
                  <Dialog
                    key={cred.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedCred(null);
                        setIsEditing(false);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Card
                        onClick={() => setSelectedCred(cred)}
                        className="border-white/5 bg-[#1e1e1e] hover:bg-[#252525] hover:border-white/20 transition-all cursor-pointer group shadow-lg"
                      >
                        <CardHeader className="flex flex-row justify-between items-center px-5 py-4 border-b border-white/5">
                          <div className="flex flex-row items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center">
                              <img src={cred.appIcon} width={24} alt="" className="object-contain" />
                            </div>
                            <CardTitle className="text-base text-white font-medium group-hover:text-emerald-400 transition-colors">
                              {cred.name}
                            </CardTitle>
                          </div>
                          <Trash
                            className="text-white/20 hover:text-red-400 cursor-pointer transition-colors"
                            width={16}
                            onClick={async (e) => {
                              // ... existing delete logic ...
                              e.stopPropagation();
                              try {
                                const res = await axios.delete(
                                  `${BACKEND_URL}/api/v1/cred/${cred.id}`,
                                  { withCredentials: true }
                                );

                                if (res.status === 200) {
                                  setCredentials((prev) =>
                                    prev!.filter((c) => c.id !== cred.id)
                                  );
                                  toast.success("Credential deleted successfully");
                                }
                              } catch (err) {
                                console.error("Failed to delete credential", err);
                              }
                            }}
                          />
                        </CardHeader>
                        <CardContent className="text-sm px-5 py-4">
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex items-center gap-2 text-white/40">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Created: {new Date(cred.createdAt!).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/40">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Updated: {new Date(cred.updatedAt!).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg bg-[#0A0A0A] border-white/10 text-white">
                      <DialogHeader className="flex flex-row justify-between items-center border-b border-white/10 pb-4">
                        <DialogTitle className="text-white font-light">
                          Credential Details
                        </DialogTitle>
                        {!isEditing && (
                          <Button variant="ghost" size="icon" onClick={handleEditToggle} className="text-white/50 hover:text-white hover:bg-white/10">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </DialogHeader>

                      {selectedCred && (
                        <div className="space-y-4 mt-4">
                          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <label className="text-xs text-white/40 uppercase tracking-widest">
                              Name
                            </label>
                            <p className="text-white mt-1 font-medium">{selectedCred.name}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <label className="text-xs text-white/40 uppercase tracking-widest">
                              Application API
                            </label>
                            <p className="text-white mt-1 font-mono text-sm">{selectedCred.apiName}</p>
                          </div>

                          {/* Nested Data */}
                          {selectedCred.data &&
                            Object.entries(selectedCred.data).map(
                              ([key, value]) => (
                                <div key={key} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                  <label className="text-xs text-white/40 uppercase tracking-widest">
                                    {key}
                                  </label>
                                  {isEditing ? (
                                    <Input
                                      className="mt-2 bg-black/50 border-white/10 text-white focus:border-white/20"
                                      value={
                                        String(formData.data?.[key] ?? value ?? "")
                                      }
                                      onChange={(e) =>
                                        handleChange(key, e.target.value, true)
                                      }
                                    />
                                  ) : (
                                    <p className="text-white/80 mt-1 font-mono text-sm break-all">
                                      {String(value)}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                        </div>
                      )}

                      {/* Save Button */}
                      {isEditing && (
                        <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
                          <Button
                            onClick={handleSave}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                ))}
            </div>
          </div>
        </TabsContent>

        {/* Executions - Keeping original component but assume it might need updates or is outside scope for now */}
        <TabsContent value="executions">
          <ExecutionsTabImproved />
        </TabsContent>
      </Tabs>
    </div>
  );
};
