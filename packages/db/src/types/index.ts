export interface CredentialsI {
  displayName: string;
  documentationUrl: string;
  iconUrl: string;
  name: string;
  application: string;
  properties: PropertiesI[];
  supportedNodes: string[];
}

export interface PropertiesI {
  default?: string;
  required: boolean;
  description: string;
  displayName: string;
  name: string;
  placeholder?: string;
  type?: string;
  options?: any[];
}

export type CredentialSubmitPayload = {
  name: string;
  apiName: string;
  appIcon: string;
  application: string;
  data: Record<string, any>;
};

export type UserCredentials = {
  id: string;
  name: string;
  appIcon: string;
  apiName: string;
  application: string;
  type: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  data: any;
};

export interface Position {
  x: number;
  y: number;
}

export interface Measured {
  width: number;
  height: number;
}

export interface NodeData {
  label: string;
  actionType?: string;
  application?: string;
  credentials?: UserCredentials;
  description?:string,
  triggerId?: string,
  triggerType?:string,
  metadata?: any;
  name: string;
  type?: string;
  parameters?: any;
  actionDefination?: any;
}

export interface INode {
  id: string;
  type: string;
  position: Position;
  workflowId?: string;
  data: NodeData;
  measured?: Measured;
  selected?: boolean;
  dragging?: boolean;
}

export interface IEdge {
  workflowId?: string;
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  active: boolean;
  tag?: string;
  nodes: INode[];
  edges: IEdge[];
  createdAt?: Date;
  updatedAt?: Date;
}
