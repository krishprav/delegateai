import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type FitViewOptions,
  type OnNodeDrag,
  type DefaultEdgeOptions,
  Controls,
  Background,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AddTrigger } from "@/components/AddTrigger";
import { ManualTriggerNode } from "@/components/nodeComponents/ManualTriggerNode";
import { ScheduledTriggerNode } from "@/components/nodeComponents/ScheduleTrigger";
import { WebhookTriggerNode } from "@/components/nodeComponents/WebhookTrigger";
import { WorkflowNavbar } from "@/components/WorkflowNavbar";
import { useWorkflowStore } from "@/store/workflowStore";
import { ActionNode } from "@/components/nodeComponents/ActionNode";

// ye  Node configuration
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  style: {
    stroke: "#64748b", // slate-500 - neutral gray
    strokeWidth: 2,
    opacity: 0.5,
  },
};
const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};
const nodeTypes = {
  addTrigger: AddTrigger,
  manualTrigger: ManualTriggerNode,
  scheduleTrigger: ScheduledTriggerNode,
  webhookTrigger: WebhookTriggerNode,
  action: ActionNode,
};

const WorkflowContent = () => {
  const { workflowId } = useParams();
  const { screenToFlowPosition } = useReactFlow();

  const getViewportCenter = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return screenToFlowPosition({ x: centerX, y: centerY });
  };

  const {
    nodes,
    edges,

    nodeStatuses,
    executionEvents,

    isWorkflowActive,
    projectName,
    onNodesChange,
    onEdgesChange,
    onConnect,
    saveWorkflow,
    setIsWorkflowActive,
    loadWorkflow,
    loadUserCredentials,
    loadTriggers,
    isSaving,
    isLoading,
  } = useWorkflowStore();

  const nodesWithStatus = nodes.map((node) => {
    const status = nodeStatuses.get(node.id) || "idle";

    let style = { ...node.style };
    // Base dark mode node style
    const baseStyle = {
      backgroundColor: "#1e1e1e",
      color: "#ffffff",
      border: "1px solid #333",
      borderRadius: "8px",
    };

    switch (status) {
      case "running":
        style = {
          ...style,
          ...baseStyle,
          borderColor: "#FACC15", // yellow-400
          borderWidth: "2px",
          boxShadow: "0 0 15px rgba(250, 204, 21, 0.3)",
        };
        break;
      case "completed":
        style = {
          ...style,
          ...baseStyle,
          borderColor: "#10B981", // green-500
          borderWidth: "2px",
          // boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)",
        };
        break;
      case "failed":
        style = {
          ...style,
          ...baseStyle,
          borderColor: "#EF4444", // red-500
          borderWidth: "2px",
          // boxShadow: "0 0 10px rgba(239, 68, 68, 0.2)",
        };
        break;
      default:
        style = {
          ...style,
          ...baseStyle,
        };
    }

    return { ...node, style };
  });

  useEffect(() => {
    if (workflowId) {
      // Load the specific workflow when component mounts or workflowId changes
      loadWorkflow(workflowId);
      loadUserCredentials();
      loadTriggers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]); // Only depend on workflowId, not the function references

  const handleSave = async () => {
    try {
      await saveWorkflow(workflowId); // pass workflowId for updating
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020202] text-white">
        <div className="text-lg flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          Loading workflow...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#020202]">
      <WorkflowNavbar
        projectName={projectName}
        isActive={isWorkflowActive}
        onSave={handleSave}
        onActiveToggle={setIsWorkflowActive}
        onNameChange={useWorkflowStore.getState().setProjectName}
        isSaving={isSaving}
        isViewMode={true}
        getViewportCenter={getViewportCenter}
      />
      <div className="flex-1 relative">
        <ReactFlow
          className="h-full w-full"
          nodes={nodesWithStatus}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          colorMode="dark"
        >
          <Controls className="bg-white/10 border-white/10 [&>button]:bg-black/40 [&>button]:text-white [&>button]:border-white/10 hover:[&>button]:bg-white/20" />
          <Background color="#1f1f1f" gap={20} size={1} />
          <MiniMap
            nodeStrokeWidth={3}
            className="bg-black/50 border-white/10"
            maskColor="rgba(0, 0, 0, 0.7)"
          />
        </ReactFlow>

        {executionEvents.length > 0 && (
          <div className="absolute bottom-4 left-4 max-w-md bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-4 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Execution Log</h4>
              <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-1 rounded-full font-medium">
                {executionEvents.length} events
              </span>
            </div>
            <div className="space-y-2">
              {executionEvents.slice(-10).reverse().map((event, index) => (
                <div key={index} className="text-xs border-l-2 pl-3 py-1 border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${event.status === "started"
                        ? "text-orange-400"
                        : event.status === "completed"
                          ? "text-green-400"
                          : "text-red-400"
                        }`}
                    >
                      {event.status === "started" ? "▶" : event.status === "completed" ? "✓" : "✗"}
                    </span>
                    <span className="text-gray-400 font-medium">{event.nodeId}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${event.status === "started"
                        ? "bg-orange-500/10 text-orange-400"
                        : event.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                        }`}
                    >
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkflowPage = () => {
  return (
    <ReactFlowProvider>
      <WorkflowContent />
    </ReactFlowProvider>
  );
};

export default WorkflowPage;
