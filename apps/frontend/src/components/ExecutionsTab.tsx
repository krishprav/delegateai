/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config/api";
import {
  Clock,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Calendar,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";
import JsonViewer from "./JsonViewer";
import { useExecutionUpdates } from "@/hooks/useExecutionUpdates";

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  triggeredBy: string;
  startedAt: string;
  finishedAt: string | null;
  duration: number | null;
  error: string | null;
  workflow?: {
    active: boolean;
  };
}

interface ExecutionDetails extends Execution {
  nodeResults: any[];
  metadata: any;
}

interface WorkflowGroup {
  workflowId: string;
  workflowName: string;
  executions: Execution[];
  stats: {
    total: number;
    completed: number;
    failed: number;
    running: number;
  };
  lastRun: string;
  isActive: boolean;
}

export const ExecutionsTabImproved = () => {
  const [workflowGroups, setWorkflowGroups] = useState<WorkflowGroup[]>([]);
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());
  const [expandedExecutions, setExpandedExecutions] = useState<Set<string>>(new Set());
  const [hoveredWorkflow, setHoveredWorkflow] = useState<string | null>(null);
  const [hoveredExecution, setHoveredExecution] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [executionDetails, setExecutionDetails] = useState<Map<string, ExecutionDetails>>(new Map());
  const [detailsLoading, setDetailsLoading] = useState<Set<string>>(new Set());

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 500 };
      if (filter !== "all") {
        params.status = filter;
      }

      const res = await axios.get(
        `${BACKEND_URL}/api/v1/workflow/executions/list`,
        {
          params,
          withCredentials: true
        }
      );

      const executions: Execution[] = res.data.data.executions;

      const grouped = executions.reduce((acc: { [key: string]: WorkflowGroup }, exec) => {
        if (!acc[exec.workflowId]) {
          acc[exec.workflowId] = {
            workflowId: exec.workflowId,
            workflowName: exec.workflowName,
            executions: [],
            stats: {
              total: 0,
              completed: 0,
              failed: 0,
              running: 0,
            },
            lastRun: exec.startedAt,
            isActive: exec.workflow?.active ?? true,
          };
        }

        acc[exec.workflowId].executions.push(exec);
        acc[exec.workflowId].stats.total++;

        if (exec.status === "COMPLETED") acc[exec.workflowId].stats.completed++;
        if (exec.status === "FAILED") acc[exec.workflowId].stats.failed++;
        if (exec.status === "RUNNING") acc[exec.workflowId].stats.running++;

        if (new Date(exec.startedAt) > new Date(acc[exec.workflowId].lastRun)) {
          acc[exec.workflowId].lastRun = exec.startedAt;
        }

        return acc;
      }, {});

      const groupsArray = Object.values(grouped).sort(
        (a, b) => new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime()
      );

      setWorkflowGroups(groupsArray);
    } catch (error) {
      console.error("Failed to fetch executions", error);
      toast.error("Failed to load executions");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const { connected } = useExecutionUpdates({
    onNewExecution: () => {
      fetchExecutions();
    },
    onExecutionComplete: () => {
      fetchExecutions();
    }
  });

  const fetchExecutionDetails = async (executionId: string) => {
    if (executionDetails.has(executionId)) {
      return;
    }

    try {
      setDetailsLoading(prev => new Set(prev).add(executionId));
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/workflow/executions/${executionId}`,
        { withCredentials: true }
      );
      setExecutionDetails(prev => new Map(prev).set(executionId, res.data.data));
    } catch (error) {
      console.error("Failed to fetch execution details", error);
      toast.error("Failed to load execution details");
    } finally {
      setDetailsLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(executionId);
        return newSet;
      });
    }
  };

  const toggleExecution = async (executionId: string) => {
    const newExpanded = new Set(expandedExecutions);
    if (newExpanded.has(executionId)) {
      newExpanded.delete(executionId);
    } else {
      newExpanded.add(executionId);
      await fetchExecutionDetails(executionId);
    }
    setExpandedExecutions(newExpanded);
  };

  useEffect(() => {
    fetchExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const toggleWorkflow = (workflowId: string) => {
    const newExpanded = new Set(expandedWorkflows);
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId);
    } else {
      newExpanded.add(workflowId);
    }
    setExpandedWorkflows(newExpanded);
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    const seconds = duration / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {/* Header with Filter */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-light text-white pl-1">Workflow Executions</h3>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/5 text-white/40 border-white/10'
              }`}
            title={connected ? "Live updates active" : "Connecting..."}
          >
            {connected ? (
              <><Wifi className="w-3 h-3" /> Live</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Offline</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/60">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#0A0A0A]">All Statuses</option>
            <option value="COMPLETED" className="bg-[#0A0A0A]">Completed</option>
            <option value="FAILED" className="bg-[#0A0A0A]">Failed</option>
            <option value="RUNNING" className="bg-[#0A0A0A]">Running</option>
            <option value="QUEUED" className="bg-[#0A0A0A]">Queued</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          <span className="ml-3 text-white/60">Loading executions...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && workflowGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/5 text-center">
          <Clock className="w-10 h-10 mx-auto mb-3 text-white/20" />
          <p className="text-lg font-medium text-white/40">No executions found</p>
          <p className="text-sm mt-1 text-white/20">Execute a workflow to see results here</p>
        </div>
      )}

      {/* Workflow Groups */}
      {!loading && workflowGroups.length > 0 && (
        <div className="space-y-3 min-w-0">
          {workflowGroups.map((group) => (
            <Card key={group.workflowId} className="border border-white/10 overflow-hidden py-0 gap-0 min-w-0 max-w-full bg-black/40 backdrop-blur-md">
              {/* Workflow Header */}
              <div
                onClick={() => toggleWorkflow(group.workflowId)}
                onMouseEnter={() => setHoveredWorkflow(group.workflowId)}
                onMouseLeave={() => setHoveredWorkflow(null)}
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white shadow-sm">{group.workflowName}</h4>
                    {hoveredWorkflow === group.workflowId && (
                      expandedWorkflows.has(group.workflowId) ? (
                        <ChevronDown className="w-[1em] h-[1em] text-white/60" />
                      ) : (
                        <ChevronRight className="w-[1em] h-[1em] text-white/60" />
                      )
                    )}
                    <span className="text-white/20">|</span>
                    <p className="text-xs text-white/50 font-mono">
                      {formatRelativeTime(group.lastRun)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Active Status Label - Middle */}
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${group.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-white/40 border-white/10'
                      }`}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>

                    {/* Stats Badges */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 text-white/60 border border-white/5">
                        {group.stats.total} total
                      </span>
                      {group.stats.completed > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ {group.stats.completed}
                        </span>
                      )}
                      {group.stats.failed > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          ✕ {group.stats.failed}
                        </span>
                      )}
                      {group.stats.running > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
                          ▶ {group.stats.running}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Executions List (Expanded) */}
              {expandedWorkflows.has(group.workflowId) && (
                <div className="border-t border-white/10 bg-black/20 min-w-0 max-w-full">
                  <div className="divide-y divide-white/5 min-w-0">
                    {group.executions.map((exec) => {
                      const isExpanded = expandedExecutions.has(exec.id);
                      const details = executionDetails.get(exec.id);
                      const isLoadingDetails = detailsLoading.has(exec.id);

                      return (
                        <div key={exec.id} className="min-w-0">
                          <div
                            onClick={() => toggleExecution(exec.id)}
                            onMouseEnter={() => setHoveredExecution(exec.id)}
                            onMouseLeave={() => setHoveredExecution(null)}
                            className="p-3 hover:bg-white/5 cursor-pointer transition-colors min-w-0"
                          >
                            <div className="flex items-center justify-between gap-4 min-w-0">
                              <div className="flex items-center gap-2 text-sm min-w-0">
                                <p className="text-white/80 truncate font-mono text-xs">
                                  {new Date(exec.startedAt).toLocaleString()}
                                </p>
                                {hoveredExecution === exec.id && (
                                  isExpanded ? (
                                    <ChevronDown className="w-[1em] h-[1em] text-white/40" />
                                  ) : (
                                    <ChevronRight className="w-[1em] h-[1em] text-white/40" />
                                  )
                                )}
                                <span className="text-white/20 px-1">via</span>
                                <p className="text-xs text-white/50">
                                  <span className="font-medium capitalize text-white/70">{exec.triggeredBy}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${exec.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : exec.status === 'FAILED'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : exec.status === 'RUNNING'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      : exec.status === 'QUEUED'
                                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        : 'bg-white/5 text-white/50 border-white/10'
                                  }`}>
                                  {exec.status === 'COMPLETED' ? 'Success' : exec.status === 'FAILED' ? 'Failed' : exec.status}
                                </span>

                                <div className="text-right">
                                  <p className="text-white/30 text-[10px] uppercase">Duration</p>
                                  <p className="font-mono text-xs text-white/80">{formatDuration(exec.duration)}</p>
                                </div>

                                {exec.error && (
                                  <AlertCircle className="w-5 h-5 text-red-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Execution Details (Expanded) */}
                          {isExpanded && (
                            <div className="bg-black/40 border-t border-white/10 p-4 min-w-0 overflow-hidden">
                              {isLoadingDetails && (
                                <div className="flex justify-center items-center py-8">
                                  <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                  <span className="ml-3 text-white/60">Loading details...</span>
                                </div>
                              )}

                              {!isLoadingDetails && details && (
                                <div className="space-y-4 min-w-0">
                                  {/* Overview */}
                                  <Card className="border-white/10 bg-white/5 min-w-0">
                                    <CardContent className="py-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-white/40 mb-1 text-xs uppercase tracking-wide">Execution ID</p>
                                          <p className="font-mono text-xs break-all text-white/80">{details.id}</p>
                                        </div>
                                        <div>
                                          <p className="text-white/40 mb-1 text-xs uppercase tracking-wide">Duration</p>
                                          <p className="font-medium text-white/90">{formatDuration(details.duration)}</p>
                                        </div>
                                        <div>
                                          <p className="text-white/40 mb-1 text-xs uppercase tracking-wide">Started At</p>
                                          <p className="font-medium flex items-center gap-1 text-white/90">
                                            <Calendar className="w-3 h-3 text-white/40" />
                                            {new Date(details.startedAt).toLocaleString()}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-white/40 mb-1 text-xs uppercase tracking-wide">Finished At</p>
                                          <p className="font-medium text-white/90">
                                            {details.finishedAt
                                              ? new Date(details.finishedAt).toLocaleString()
                                              : "In progress"}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Error Display */}
                                  {details.error && (
                                    <Card className="border-red-500/20 bg-red-900/10 min-w-0">
                                      <CardContent className="pt-4 min-w-0">
                                        <div className="flex items-start gap-2">
                                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                          <div className="min-w-0 overflow-hidden">
                                            <h4 className="font-semibold text-red-400 mb-1">Error</h4>
                                            <p className="text-sm text-red-300 wrap-break-word font-mono overflow-wrap-anywhere">
                                              {details.error}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Node Results */}
                                  {details.nodeResults && details.nodeResults.length > 0 && (
                                    <div className="min-w-0">
                                      <h4 className="font-medium text-white mb-3 pl-1">Node Execution Results</h4>
                                      <div className="space-y-2 min-w-0">
                                        {details.nodeResults.map((nodeResult: any, index: number) => (
                                          <Card key={index} className="border border-white/10 bg-white/5 min-w-0 max-w-full">
                                            <CardContent className="py-4 min-w-0 max-w-full grid grid-cols-1">
                                              <div className="flex items-start justify-between mb-3">
                                                <div>
                                                  <p className="font-medium text-white/90">
                                                    {nodeResult.nodeId || `Node ${index + 1}`}
                                                  </p>
                                                  <p className="text-xs text-white/40 font-mono">
                                                    {nodeResult.executedAt && new Date(nodeResult.executedAt).toLocaleString()}
                                                  </p>
                                                </div>
                                                {nodeResult.status && (
                                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${nodeResult.status === 'completed'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {nodeResult.status}
                                                  </span>
                                                )}
                                              </div>
                                              {nodeResult.output && (
                                                <div className="mt-2 min-w-0 w-full overflow-hidden rounded-md border border-white/10">
                                                  <JsonViewer data={nodeResult.output} initialExpanded={true} />
                                                </div>
                                              )}
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
