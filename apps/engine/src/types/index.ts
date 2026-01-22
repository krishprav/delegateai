type ExecutionMetadata = {
  source: string;
  userAgent: string;
  ip: string;
  scheduledTime?: string;
  nodeId?: string;
};

type TriggerData = {
  nodeId?: string;
  webhookPayload?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  method?: string;
  ip?: string;
  emailData?: Record<string, unknown>;
};

export type NodeData = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label?: string;
    triggerId?: string;
    triggerType?: string;
    description?: string;

    name?: string;
    application?: string;
    actionType?: string;
    credentials?: Record<string, any>;
    parameters?: Record<string, any>;
    metadata?: Record<string, any>;
  };
};

export type EdgeData = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  active: boolean;
  nodes: NodeData[];
  edges: EdgeData[];
};

export type WorkflowExecutionData = {
  executionId: string;
  workflowId: string;
  userId: string;
  triggeredBy: "manual" | "api" | "schedule" | "webhook" | "email";
  triggeredAt: string;
  status: "queued" | "running" | "completed" | "failed";
  priority: "low" | "normal" | "high";
  maxRetries?: number;
  timeout?: number;
  metadata?: ExecutionMetadata;
  triggerData?: TriggerData;
  workflow: WorkflowDefinition;
};
