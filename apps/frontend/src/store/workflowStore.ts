/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { toast } from "sonner";
import { devtools } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import type { UserCredentials } from "@delegate/db";
import { WorkflowSchema } from "@/lib/workflowSchema";
import axios from "axios";
import { BACKEND_URL } from "../config/api";

export interface TriggerI {
  id: string;
  name: string;
  type: string;
  description?: string;
}
export interface WorkflowEvent {
  executionId: string;
  workflow: string;
  nodeId: string;
  timeStamp: Date;
  status: "started" | "completed" | "failed";
  data?: any;
}

export interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  workflowId?: string;

  isWorkflowActive: boolean;
  projectName: string;
  projectDescription: string;

  triggers: TriggerI[];
  userCredentials: UserCredentials[];

  isLoading: boolean;
  isSaving: boolean;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  setIsWorkflowActive: (active: boolean) => void;
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  resetWorkflow: () => void;

  updateNodeData: (id: string, data: any) => void;
  deleteNode: (nodeId: string) => void;

  setTriggers: (triggers: TriggerI[]) => void;
  addTriggerNode: (trigger: TriggerI, position?: { x: number; y: number }) => void;

  setUserCredentials: (credentials: UserCredentials[]) => void;

  saveWorkflow: (workflowId?: string) => Promise<string | null>;
  loadWorkflow: (workflowId: string) => Promise<void>;
  loadTriggers: () => Promise<void>;
  loadUserCredentials: () => Promise<void>;

  addActionNode: (actionData: any, position?: { x: number; y: number }) => void; 

  importWorkflow: (jsonString: string) => Promise<{ success: boolean; error?: string }>;
  exportWorkflow: () => string;
  validateWorkflowJson: (jsonString: string) => { success: boolean; error?: string };

  ws: WebSocket | null;
  currExecutionId: string | null;
  nodeStatuses: Map<string, "running" | "idle" | "completed" | "failed">;
  isExecuting: boolean;
  executionEvents: WorkflowEvent[];

  connectWebSocket: (executionId: string) => void;
  disconnectWebSocket: () => void;
  executeWorkflowWithWebSocket: () => Promise<string | null>;
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "addTrigger",
    data: {
      label: "Add Trigger",
      triggers: [],
    },
    position: { x: 0, y: 50 },
  },
];

const getNodeType = (triggerType: string) => {
  switch (triggerType?.toLowerCase()) {
    case "manual":
      return "manualTrigger";
    case "webhook":
      return "webhookTrigger";
    case "schedule":
      return "scheduleTrigger";
    default:
      return "default";
  }
};

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      nodes: initialNodes,
      edges: [],
      workflowId: undefined,
      isWorkflowActive: true,
      projectName: "My Workflow",
      projectDescription: "",
      triggers: [],
      userCredentials: [],
      isLoading: false,
      isSaving: false,

      validateWorkflowJson: (jsonString: string) => {
        try {
          const data = JSON.parse(jsonString);
          WorkflowSchema.parse(data);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message || "Invalid JSON format" };
        }
      },

      importWorkflow: async (jsonString: string) => {
        try {
          const validation = get().validateWorkflowJson(jsonString);
          if (!validation.success) {
            return validation;
          }

          const data = JSON.parse(jsonString);
          const workflow = WorkflowSchema.parse(data);

          // Update workflow state
          set({
            nodes: workflow.nodes as Node[],
            edges: workflow.edges as Edge[],
            projectName: workflow.name || "Imported Workflow",
            projectDescription: workflow.description || "",
            isWorkflowActive: workflow.active || true,
            workflowId: workflow.id,
          });

          toast.success("Workflow imported successfully");
          return { success: true };
        } catch (error: any) {
          toast.error("Failed to import workflow: " + (error.message || "Unknown error"));
          return { success: false, error: error.message || "Unknown error" };
        }
      },

      exportWorkflow: () => {
        try {
          const state = get();
          const workflow = {
            id: state.workflowId,
            name: state.projectName,
            description: state.projectDescription,
            active: state.isWorkflowActive,
            nodes: state.nodes,
            edges: state.edges,
          };

          const validated = WorkflowSchema.parse(workflow);
          return JSON.stringify(validated, null, 2);
        } catch (error: any) {
          toast.error("Failed to export workflow: " + (error.message || "Unknown error"));
          throw error;
        }
      },

      onNodesChange: (changes) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
        }));
      },

      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
        }));
      },
      onConnect: (connection) => {
        set((state) => ({
          edges: addEdge(connection, state.edges),
        }));
      },

      setIsWorkflowActive: (active) => {
        set({ isWorkflowActive: active });
      },
      setProjectName: (name) => {
        set({ projectName: name });
      },
      setProjectDescription: (description) => {
        set({ projectDescription: description });
      },
      resetWorkflow: () => {
        set({
          nodes: initialNodes,
          edges: [],
          workflowId: undefined,
          isWorkflowActive: true,
          projectName: "My Workflow",
          projectDescription: "",
        });
      },

      setTriggers: (triggers) => {
        set({ triggers });

        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === "1"
              ? {
                ...node,
                data: {
                  ...node.data,
                  triggers,
                  onSelectTrigger: get().addTriggerNode,
                },
              }
              : node
          ),
        }));
      },

      addTriggerNode: (trigger, position) => {
        const { nodes } = get();

        const needsConfiguration = trigger.type === 'schedule' || trigger.type === 'webhook';

        const defaultPosition = { x: 100 + nodes.length * 50, y: 100 };
        const nodePosition = position || defaultPosition;

        const newNode: Node = {
          id: `trigger-${nodes.length}`,
          type: getNodeType(trigger.type),
          position: nodePosition,
          data: {
            label: trigger.name,
            description: trigger.description,
            triggerType: trigger.type,
            triggerId: trigger.id,
            autoOpen: needsConfiguration,
            configured: !needsConfiguration,
          },
        };

        const newNodes = nodes.filter((node) => node.id !== "1");
        set(() => ({
          nodes: [...newNodes, newNode],
        }));
      },

      setUserCredentials: (credentials) => {
        set({ userCredentials: credentials });
      },

      updateNodeData: (nodeId: string, newData: any) => {
        set((state) => {
          return {
            nodes: state.nodes.map(node =>
              node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
            )
          }
        })
      },

      deleteNode: (nodeId: string) => {
        set((state) => {
          const updatedNodes = state.nodes.filter(node => node.id !== nodeId);
          const updatedEdges = state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
          
          // Check if the deleted node was a trigger
          const deletedNode = state.nodes.find(node => node.id === nodeId);
          const isTriggerNode = deletedNode && (
            deletedNode.type === 'manualTrigger' || 
            deletedNode.type === 'webhookTrigger' || 
            deletedNode.type === 'scheduleTrigger'
          );
          
          // Check if there are any remaining trigger nodes
          const hasRemainingTriggers = updatedNodes.some(node => 
            node.type === 'manualTrigger' || 
            node.type === 'webhookTrigger' || 
            node.type === 'scheduleTrigger'
          );
          
          // Check if there's already an addTrigger node
          const hasAddTriggerNode = updatedNodes.some(node => node.type === 'addTrigger');
          
          // If a trigger was deleted and no triggers remain and no addTrigger node exists, add it back
          if (isTriggerNode && !hasRemainingTriggers && !hasAddTriggerNode) {
            const addTriggerNode: Node = {
              id: "1",
              type: "addTrigger",
              data: {
                label: "Add Trigger",
                triggers: state.triggers,
                onSelectTrigger: get().addTriggerNode,
              },
              position: { x: 0, y: 50 },
            };
            
            return {
              nodes: [...updatedNodes, addTriggerNode],
              edges: updatedEdges
            };
          }
          
          return {
            nodes: updatedNodes,
            edges: updatedEdges
          };
        });
        toast.success("Node deleted successfully");
      },

      // Action node management
      addActionNode: (actionData, position) => {
        const { nodes } = get();

        const defaultPosition = { x: 100 + nodes.length * 50, y: 250 };
        const nodePosition = position || defaultPosition;

        const newNode: Node = {
          id: `action-${nodes.length}`,
          type: "action",
          position: nodePosition,
          data: {
            label: actionData.name || "Action",
            actionType: actionData.type,
            application: actionData.application,
            credentials: actionData.credentials,
            metadata: actionData.metadata,
            ...actionData,
          },
        };

        set((state) => ({
          nodes: [...state.nodes, newNode],
        }));
      },

      saveWorkflow: async (workflowId?: string) => {
        const { nodes, edges, projectName, projectDescription, isWorkflowActive } = get();

        set({ isSaving: true });

        try {
          const workflow = {
            nodes,
            edges,
            name: projectName,
            description: projectDescription,
            active: isWorkflowActive,
          };

          let res;
          if (workflowId) {
            console.log("in update ");
            res = await axios.put(
              `${BACKEND_URL}/api/v1/workflow/${workflowId}`,
              workflow,
              { withCredentials: true }
            );
          } else {
            console.log("in create");
            res = await axios.post(
              `${BACKEND_URL}/api/v1/workflow/save`,
              workflow,
              { withCredentials: true }
            );

            console.log(res);
          }

          if (res && res.data) {
            const savedWorkflowId =
              res.data.workflowId || res.data.data?.workflowId;
            console.log(savedWorkflowId);
            set({ workflowId: savedWorkflowId });
            toast.success("Workflow saved successfully!");
            return savedWorkflowId;
          }
        } catch (error) {
          console.error("Failed to save workflow:", error);
          toast.error("Failed to save workflow");
          return null;
        } finally {
          set({ isSaving: false });
        }
        return null;
      },

      loadWorkflow: async (workflowId: string) => {
        set({ isLoading: true });

        try {
          const res = await axios.get(
            `${BACKEND_URL}/api/v1/workflow/${workflowId}`,
            { withCredentials: true }
          );

          if (res.data && res.data.data) {
            const workflow = res.data.data;
            set({
              workflowId: workflowId,
              nodes: workflow.nodes || initialNodes,
              edges: workflow.edges || [],
              projectName: workflow.name || "Loaded Workflow",
              projectDescription: workflow.description || "",
              isWorkflowActive: workflow.active || false,
            });
          }
        } catch (error) {
          console.error("Failed to load workflow:", error);
          toast.error("Failed to load workflow");
        } finally {
          set({ isLoading: false });
        }
      },

      loadTriggers: async () => {
        set({ isLoading: true });

        try {
          const res = await axios.get(
            `${BACKEND_URL}/api/v1/trigger/all`,
            { withCredentials: true }
          );

          get().setTriggers(res.data.data);
        } catch (error) {
          console.error("Failed to load triggers:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadUserCredentials: async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/v1/cred/all`, {
            withCredentials: true,
          });

          get().setUserCredentials(res.data.data);
        } catch (error) {
          console.error("Failed to load user credentials:", error);
        }
      },

      // execution workflow
      ws: null,
      currExecutionId: null,
      nodeStatuses: new Map(),
      isExecuting: false,
      executionEvents: [],

      connectWebSocket: (executionId: string) => {
        const { ws } = get();
        if (ws) {
          ws.close();
        }

        try {
          const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';
          const websocket = new WebSocket(
            `${wsUrl}/${executionId}`
          );

          websocket.onopen = () => {
            console.log("socket opened for execution id ", executionId);
            set({ ws: websocket, currExecutionId: executionId });
          };

          websocket.onmessage = (event) => {
            const workflowEvent: WorkflowEvent = JSON.parse(event.data);

            set((state) => {
              const newNodeStatus = new Map(state.nodeStatuses); 

              switch (workflowEvent.status) {
                case "started":
                  newNodeStatus.set(workflowEvent.nodeId, "running");
                  break;
                case "completed":
                  newNodeStatus.set(workflowEvent.nodeId, "completed");
                  break;
                case "failed":
                  newNodeStatus.set(workflowEvent.nodeId, "failed");
              }

              const stillRunning = Array.from(newNodeStatus.values()).some(
                (status) => status === "running"
              );

              if (!stillRunning && state.isExecuting) {
                toast.dismiss("workflow-execution");
                const hasFailed = Array.from(newNodeStatus.values()).some(
                  (status) => status === "failed"
                );
                if (hasFailed) {
                  toast.error("Workflow execution failed", { duration: 3000 });
                } else {
                  toast.success("Workflow executed successfully", { duration: 3000 });
                }
              }

              return {
                nodeStatuses: newNodeStatus,
                isExecuting: stillRunning,
                executionEvents: [...state.executionEvents, workflowEvent],
              };
            });
          };

          websocket.onclose = () => {
            toast.dismiss("workflow-execution");
            set({ ws: null, currExecutionId: null });
          };

          websocket.onerror = (error) => {
            console.log("WebSocket Error ", error);
            toast.dismiss("workflow-execution");
            set({ isExecuting: false });
          };
        } catch (error) {
          console.log(error);
        }
      },
      disconnectWebSocket: () => {
        const { ws } = get();
        if (ws) {
          ws.close();
          set({
            ws: null,
            currExecutionId: null,
            nodeStatuses: new Map(),
            isExecuting: false,
          });
        }
      },
      executeWorkflowWithWebSocket: async () => {
        const { nodes, workflowId } = get();
        if (!workflowId) throw new Error("No workflow Id available");

        try {
          const nodeStatuses = new Map();
          nodes.forEach((node) => {
            return nodeStatuses.set(node.id, "idle");
          });

          set({
            isExecuting: true,
            nodeStatuses,
            executionEvents: [],
          });

          toast.loading("Executing Workflow...", { id: "workflow-execution" });

          const res = await axios.post(
            `${BACKEND_URL}/api/v1/workflow/execute/${workflowId}`,
            {},
            { withCredentials: true }
          );

          if (res.status === 200) {
            const { executionId } = res.data.data;

            get().connectWebSocket(executionId);
            return executionId;
          }
        } catch (error) {
          console.error('Error executing workflow:', error);
          toast.dismiss("workflow-execution");
          toast.error("Failed to execute workflow");
          set({ isExecuting: false });

          get().disconnectWebSocket();
        }
      },
    }),
    {
      name: "workflow-store",
    }
  )
);

