import { z } from "zod";

export const CredentialsISchema = z.object({
  displayName: z.string(),
  documentationUrl: z.string().url(),
  iconUrl: z.string().url(),
  name: z.string(),
  application: z.string(),
  properties: z.array(
    z.object({
      default: z.string().optional(),
      required: z.boolean(),
      description: z.string(),
      displayName: z.string(),
      name: z.string(),
      placeholder: z.string().optional(),
      type: z.string().optional(),
      options: z.array(z.any()).optional()
    })
  ),
  supportedNodes: z.array(z.string())
});

export const CredentialSubmitPayloadSchema = z.object({
  name: z.string(),
  apiName: z.string(),
  appIcon: z.string(),
  application: z.string(),
  data: z.record(z.any(), z.any())
});

export const UserCredentialsSchema = z.object({
  id: z.string(),
  name: z.string(),
  appIcon: z.string(),
  apiName: z.string(),
  application: z.string(),
  type: z.string().nullable().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  data: z.any()
});

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number()
});

export const MeasuredSchema = z.object({
  width: z.number(),
  height: z.number()
});

export const NodeDataSchema = z.object({
  label: z.string(),
  actionType: z.string().optional(),
  application: z.string().optional(),
  credentials: UserCredentialsSchema.optional(),
  description: z.string().optional(),
  triggerId: z.string().optional(),
  triggerType: z.string().optional(),
  metadata: z.any().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  parameters: z.any().optional(),
  actionDefination: z.any().optional(),
  cronExpression: z.string().optional(),
  scheduleName: z.string().optional(),
  configured: z.boolean().optional(),
  autoOpen: z.boolean().optional(),
});

export const INodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: PositionSchema,
  workflowId: z.string().optional(),
  data: NodeDataSchema,
  measured: MeasuredSchema.optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional()
});

export const IEdgeSchema = z.object({
  workflowId: z.string().optional(),
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().optional(),
  type: z.string().optional()
});

export const WorkflowSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  active: z.boolean(),
  tag: z.string().optional(),
  nodes: z.array(INodeSchema),
  edges: z.array(IEdgeSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type CredentialsI = z.infer<typeof CredentialsISchema>;
export type CredentialSubmitPayload = z.infer<typeof CredentialSubmitPayloadSchema>;
export type UserCredentials = z.infer<typeof UserCredentialsSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Measured = z.infer<typeof MeasuredSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type INode = z.infer<typeof INodeSchema>;
export type IEdge = z.infer<typeof IEdgeSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
