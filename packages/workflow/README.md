# @nen/workflow

Shared workflow schemas and types for the nEn platform.

## Features

- **Zod Schemas**: Type-safe validation schemas for workflows, nodes, edges, and credentials
- **TypeScript Types**: Inferred types from Zod schemas
- **Validation**: Runtime validation for workflow data structures

## Usage

```typescript
import { 
  WorkflowSchema, 
  INodeSchema, 
  IEdgeSchema,
  type Workflow,
  type INode,
  type IEdge 
} from "@nen/workflow";

// Validate workflow data
const result = WorkflowSchema.safeParse(workflowData);
if (result.success) {
  const workflow: Workflow = result.data;
  // Use validated workflow
}

// Validate individual nodes
const nodeResult = INodeSchema.safeParse(nodeData);
if (nodeResult.success) {
  const node: INode = nodeResult.data;
  // Use validated node
}

// Type usage
function createWorkflow(data: Workflow) {
  // data is type-safe
}
```

## Schemas

- `WorkflowSchema` - Complete workflow structure
- `INodeSchema` - Workflow node definition
- `IEdgeSchema` - Workflow edge/connection
- `NodeDataSchema` - Node configuration data
- `UserCredentialsSchema` - User credential information
- `CredentialsISchema` - Credential definition
- `CredentialSubmitPayloadSchema` - Credential submission data
