import { type NodeData, type WorkflowExecutionData } from "../types";
import { EventPublisher } from "../services/EventPublisher";
import { ActionExecutor } from "../executors/ActionExecutor";
import { prisma } from "@delegate/db";

export class Workflow {
  private executionData: WorkflowExecutionData;
  private adjacencyList: Map<string, string[]>;
  private inDegree: Map<string, number>;
  private nodes: Map<string, NodeData>;
  private eventPublisher = new EventPublisher();

  private actionExecutor: ActionExecutor;
  private nodeOutputs: Map<string, any>;

  constructor(executionData: WorkflowExecutionData) {
    this.executionData = executionData;
    this.adjacencyList = new Map<string, string[]>();
    this.inDegree = new Map<string, number>();
    this.nodes = new Map<string, NodeData>();
    this.actionExecutor = new ActionExecutor();
    this.nodeOutputs = new Map();
  }

  buildGraph() {
    this.executionData.workflow.nodes.map((node) => {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, []);
      this.inDegree.set(node.id, 0);
    });
    this.executionData.workflow.edges.forEach((edge) => {
      this.adjacencyList.get(edge.source)?.push(edge.target);
      this.inDegree.set(edge.target, (this.inDegree.get(edge.target) ?? 0) + 1);
    });
  }
  detectCycle(): boolean {
    const tempInDegree = new Map(this.inDegree);
    const queue: string[] = [];
    const processed: string[] = [];

    for (let [nodeId, degree] of tempInDegree) {
      if (degree === 0) queue.push(nodeId);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      processed.push(current);

      for (let dependent of this.adjacencyList.get(current) ?? []) {
        tempInDegree.set(dependent, (tempInDegree.get(dependent) ?? 0) - 1);
        if (tempInDegree.get(dependent) === 0) queue.push(dependent);
      }
    }

    return processed.length !== this.nodes.size;
  }

  getExecutionOrder(): string[] {
    const tempInDegree = new Map(this.inDegree);

    const queue: string[] = [];
    const order: string[] = [];

    for (let [nodeId, degree] of tempInDegree) {
      if (degree === 0) queue.push(nodeId);
    }
    while (queue.length > 0) {
      const currNodeId = queue.shift()!;
      order.push(currNodeId);

      for (let neighbour of this.adjacencyList.get(currNodeId) ?? []) {
        tempInDegree.set(neighbour, (tempInDegree.get(neighbour) ?? 0) - 1);
        if (tempInDegree.get(neighbour) === 0) {
          queue.push(neighbour);
        }
      }
    }
    if (order.length !== this.nodes.size) {
      console.log("the graph is Cyclic,");
    }
    return order;
  }

  private async loadCredentials(): Promise<void> {
    try {
      console.log("Loading credentials for user:", this.executionData.userId);

      const userCredentials = await prisma.userCredentials.findMany({
        where: {
          userId: this.executionData.userId,
        },
      });

      console.log("Found credentials:", userCredentials);

      const credMap = new Map();
      userCredentials.forEach((cred) => {
        console.log(`Mapping credential: ${cred.application} ->`, cred);
        credMap.set(cred.application, cred);
      });

      console.log("Credential map:", credMap);
      this.actionExecutor.setCredentials(credMap);
    } catch (error) {
      console.error("Failed to load credentials:", error);
    }
  }

  async executeNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);

    if (!node) {
      console.log("node not found ");
      return;
    }

    if (this.detectCycle()) {
      this.eventPublisher.publish("workflow.event", {
        executionId: this.executionData.executionId,
        workflowId: this.executionData.workflow.id,
        workflowName: this.executionData.workflow.name,
        userId: this.executionData.userId,
        nodeId: node.id,
        timeStamp: new Date(Date.now()),
        status: "started",
      });
    }

    console.log(`Executing node ${node.id} of type ${node.type}`);

    this.eventPublisher.publish("workflow.event", {
      executionId: this.executionData.executionId,
      workflowId: this.executionData.workflow.id,
      workflowName: this.executionData.workflow.name,
      userId: this.executionData.userId,
      nodeId: node.id,
      timeStamp: new Date(Date.now()),
      status: "started",
    });

    try {
      let output: any = null;

      if (node.type === "webhookTrigger") {
        const triggerData = this.executionData.triggerData;

        console.log("Webhook trigger executed with data:", {
          payload: triggerData?.webhookPayload,
          method: triggerData?.method,
          query: triggerData?.queryParams,
        });

        output = {
          webhookPayload: triggerData?.webhookPayload,
          payload: triggerData?.webhookPayload,
          triggerSource: triggerData?.ip,
          method: triggerData?.method,
          queryParams: triggerData?.queryParams,
          headers: triggerData?.headers,
          timestamp: new Date().toISOString(),
        };

        this.nodeOutputs.set(nodeId, output);
      } else if (node.type === "manualTrigger") {
        console.log("Manual trigger executed");

        output = {
          triggeredBy: "manual",
          timestamp: new Date().toISOString(),
          executionId: this.executionData.executionId,
        };

        this.nodeOutputs.set(nodeId, output);
      } else if (node.type === "scheduleTrigger") {
        console.log("Schedule trigger executed");

        const metadata = this.executionData.metadata;

        output = {
          triggeredBy: "schedule",
          timestamp: new Date().toISOString(),
          executionId: this.executionData.executionId,
          scheduledTime: metadata?.scheduledTime,
          nodeId: metadata?.nodeId,
        };

        this.nodeOutputs.set(nodeId, output);
      } else if (node.type === "action") {
        if (!this.actionExecutor) {
          await this.loadCredentials();
        }
        const previousOutputs = Object.fromEntries(this.nodeOutputs);

        const parentEdges = this.executionData.workflow.edges.filter(
          edge => edge.target === nodeId
        );

        if (parentEdges.length > 0) {
          const parentNodeId = parentEdges[0]!.source;
          const parentOutput = this.nodeOutputs.get(parentNodeId);

          if (parentOutput) {
            previousOutputs.previousNode = parentOutput;
            console.log(`Added previousNode alias: ${parentNodeId} -> previousNode`);
          }
        }

        console.log(`║ Current Node: ${node.id} (${node.data.actionType})`);
        console.log("║ Available Data from Previous Nodes:");

        if (Object.keys(previousOutputs).length === 0) {
          console.log("║   (No previous outputs available)");
        } else {
          for (const [nodeId, output] of Object.entries(previousOutputs)) {
            console.log(`║    ${nodeId}:`);
            if (output && typeof output === 'object') {
              const keys = Object.keys(output);
              console.log(`║      Available fields: ${keys.join(', ')}`);
              if ('content' in output) {
                const preview = String(output.content).substring(0, 80);
                console.log(`║      content: "${preview}${String(output.content).length > 80 ? '...' : ''}"`);
              }
            }
          }
        }

        console.log(`Executing action: ${node.data.actionType}`);

        output = await this.actionExecutor.executeAction(node, previousOutputs);
        this.nodeOutputs.set(nodeId, output);

        console.log("\nAction completed successfully");
        console.log(" Output stored for node:", nodeId);

        console.log(`Action ${node.data.actionType} completed:`, output);
      } else {
        console.log(`Unknown node type: ${node.type}`);
        output = {
          error: `Unknown node type: ${node.type}`,
          timestamp: new Date().toISOString(),
        }
      }

      this.eventPublisher.publish("workflow.event", {
        executionId: this.executionData.executionId,
        workflowId: this.executionData.workflow.id,
        workflowName: this.executionData.workflow.name,
        userId: this.executionData.userId,
        nodeId: node.id,
        timeStamp: new Date(Date.now()),
        status: "completed",
        data: output,
      });
    } catch (error: any) {
      console.error(`Error executing node ${nodeId}:`, error);

      const errorOutput = {
        error: error.message,
        timestamp: new Date().toISOString(),
        nodeId: nodeId,
      };

      this.nodeOutputs.set(nodeId, errorOutput);

      this.eventPublisher.publish("workflow.event", {
        executionId: this.executionData.executionId,
        workflowId: this.executionData.workflow.id,
        workflowName: this.executionData.workflow.name,
        userId: this.executionData.userId,
        nodeId: node.id,
        timeStamp: new Date(Date.now()),
        status: "failed",
        data: {
          message: error.message,
          stack: error.stack,
        },
      });

      throw error;
    }
  }
  async execute(): Promise<void> {
    this.buildGraph();

    if (this.detectCycle()) {
      console.log("Workflow contains cycles");
      return;
    }

    this.eventPublisher.publish("workflow.event", {
      executionId: this.executionData.executionId,
      workflowId: this.executionData.workflow.id,
      workflowName: this.executionData.workflow.name,
      userId: this.executionData.userId,
      nodeId: "workflow",
      timeStamp: new Date(Date.now()),
      status: "started",
    });

    await this.loadCredentials();
    const executionOrder = this.getExecutionOrder();
    console.log(executionOrder);

    let hasError = false;
    for (let nodeId of executionOrder) {
      try {
        await this.executeNode(nodeId);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        hasError = true;
        console.error(`Workflow execution stopped at node ${nodeId}:`, error);
        break;
      }
    }

    this.eventPublisher.publish("workflow.event", {
      executionId: this.executionData.executionId,
      workflowId: this.executionData.workflow.id,
      workflowName: this.executionData.workflow.name,
      userId: this.executionData.userId,
      nodeId: "workflow",
      timeStamp: new Date(Date.now()),
      status: hasError ? "failed" : "completed",
    });
  }
}
