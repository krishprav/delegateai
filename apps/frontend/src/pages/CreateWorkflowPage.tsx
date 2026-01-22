import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { CreateWorkflowNavbar } from "@/components/CreateWorkflowNavbar";
import { useWorkflowStore } from "@/store/workflowStore";
import { ActionNode } from "@/components/nodeComponents/ActionNode";

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

const CreateWorkflowContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenToFlowPosition } = useReactFlow();

  const getViewportCenter = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return screenToFlowPosition({ x: centerX, y: centerY });
  };

  const {
    nodes,
    edges,
    isWorkflowActive,
    projectName,
    onNodesChange,
    onEdgesChange,
    onConnect,
    saveWorkflow,
    setIsWorkflowActive,
    setProjectName,
    loadTriggers,
    loadUserCredentials,
    isSaving,
    resetWorkflow,
  } = useWorkflowStore();

  useEffect(() => {
    // Only reset if explicitly navigating (location.state.resetWorkflow === true)
    // This preserves work on page refresh but resets on button clicks
    if (location.state?.resetWorkflow === true) {
      resetWorkflow();
      // Clear the navigation state to prevent reset on subsequent renders
      window.history.replaceState({}, document.title);
    }

    loadTriggers();
    loadUserCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]); // Trigger on navigation changes

  const handleSave = async () => {
    try {
      const workflowId = await saveWorkflow();
      if (workflowId) {
        navigate(`/workflow/${workflowId}`);
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#020202]">
      <CreateWorkflowNavbar
        projectName={projectName}
        isActive={isWorkflowActive}
        onSave={handleSave}
        onActiveToggle={setIsWorkflowActive}
        onNameChange={setProjectName}
        isSaving={isSaving}
        getViewportCenter={getViewportCenter}
      />
      <div className="flex-1">
        <ReactFlow
          className="h-full w-full"
          nodes={nodes}
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
      </div>
    </div>
  );
};

const CreateWorkflowPage = () => {
  return (
    <ReactFlowProvider>
      <CreateWorkflowContent />
    </ReactFlowProvider>
  );
};

export default CreateWorkflowPage;