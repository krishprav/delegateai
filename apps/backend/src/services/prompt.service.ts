import { CustomError } from "@delegate/auth";
import { createLogger } from "@delegate/monitoring";

const logger = createLogger({ serviceName: "nen-backend" });

export class PromptService {
  async generateWorkflow(prompt: string, template?: string): Promise<any> {
    logger.info("Starting workflow generation", {
      promptLength: prompt.length,
      template,
    });

    try {
      // In a real implementation, this would integrate with an AI service
      // like OpenAI GPT-4 or Claude 3 to analyze the prompt and generate
      // a valid workflow structure.

      // For now, we'll return a simple default workflow based on the prompt
      const workflow = this.generateDefaultWorkflow(prompt, template);

      logger.info("Workflow generation completed", {
        nodeCount: workflow.nodes.length,
        edgeCount: workflow.edges.length,
      });

      return workflow;
    } catch (error: any) {
      logger.error("Error generating workflow", { error: error.message });
      throw new CustomError(500, "Failed to generate workflow from prompt");
    }
  }

  private generateDefaultWorkflow(prompt: string, template?: string): any {
    const promptLower = prompt.toLowerCase();

    // 1. Handle explicit templates first
    if (template === "email-automation") {
      return this.createInvoiceWorkflow(prompt);
    } else if (template === "social-media") {
      return this.createSocialMediaWorkflow(prompt);
    } else if (template === "data-analysis") {
      return this.createDataAnalysisWorkflow(prompt);
    } else if (template === "task-management") {
      return this.createTaskManagementWorkflow(prompt);
    }

    // 2. Keyword-based detection for free text prompts
    if (promptLower.includes("invoice") || promptLower.includes("extract")) {
      return this.createInvoiceWorkflow(prompt);
    }

    if (promptLower.includes("twitter") || promptLower.includes("tweet") || promptLower.includes("post")) {
      return this.createSocialMediaWorkflow(prompt);
    }

    if (promptLower.includes("trello") || promptLower.includes("github") || promptLower.includes("task") || promptLower.includes("card")) {
      return this.createTaskManagementWorkflow(prompt);
    }

    if (promptLower.includes("csv") || promptLower.includes("report") || promptLower.includes("analyze") || promptLower.includes("sheet")) {
      return this.createDataAnalysisWorkflow(prompt);
    }

    if (promptLower.includes("fetch") || promptLower.includes("weather") || promptLower.includes("transform")) {
      return this.createComplexDataWorkflow(prompt);
    }

    // 3. Fallback to generic workflow logic
    let triggerType = "manual";
    if (promptLower.includes("every") || promptLower.includes("daily") || promptLower.includes("weekly") || promptLower.includes("schedule")) {
      triggerType = "schedule";
    } else if (promptLower.includes("webhook") || promptLower.includes("http")) {
      triggerType = "webhook";
    } else if (promptLower.includes("email") || promptLower.includes("inbox")) {
      triggerType = "email";
    }

    let actionType = "sendEmail";
    if (promptLower.includes("slack")) {
      actionType = "sendSlackMessage";
    } else if (promptLower.includes("database")) {
      actionType = "saveToDatabase";
    }

    return {
      name: this.extractWorkflowName(prompt),
      description: prompt,
      active: false,
      nodes: [
        this.createTriggerNode(triggerType),
        this.createActionNode(actionType),
      ],
      edges: [
        {
          id: "e1-2",
          source: "1",
          target: "2",
          type: "smoothstep",
          animated: false,
        },
      ],
    };
  }

  // --- Specific Workflow Generators ---

  private createInvoiceWorkflow(prompt: string) {
    return {
      name: "Invoice Processing Automation",
      description: prompt,
      active: false,
      nodes: [
        this.createTriggerNode("email"),
        this.createActionNode("extractInvoiceData"),
        this.createActionNode("saveToGoogleSheets"),
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", type: "smoothstep", animated: false },
        { id: "e2-3", source: "2", target: "3", type: "smoothstep", animated: false },
      ],
    };
  }

  private createSocialMediaWorkflow(prompt: string) {
    return {
      name: "Social Media Scheduler",
      description: prompt,
      active: false,
      nodes: [
        this.createTriggerNode("schedule"),
        this.createActionNode("sendTweet"),
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", type: "smoothstep", animated: false },
      ],
    };
  }

  private createTaskManagementWorkflow(prompt: string) {
    return {
      name: "Task Management Sync",
      description: prompt,
      active: false,
      nodes: [
        this.createTriggerNode("webhook"), // GitHub issues often via webhook
        this.createActionNode("createTrelloCard"),
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", type: "smoothstep", animated: false },
      ],
    };
  }

  private createDataAnalysisWorkflow(prompt: string) {
    return {
      name: "Data Analysis Pipeline",
      description: prompt,
      active: false,
      nodes: [
        this.createTriggerNode("manual"),
        this.createActionNode("downloadFile"),
        this.createActionNode("analyzeData"),
        this.createActionNode("sendEmail"),
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", type: "smoothstep", animated: false },
        { id: "e2-3", source: "2", target: "3", type: "smoothstep", animated: false },
        { id: "e3-4", source: "3", target: "4", type: "smoothstep", animated: false },
      ],
    };
  }

  private createComplexDataWorkflow(prompt: string) {
    // Determine the destination based on keywords
    const promptLower = prompt.toLowerCase();
    let finalAction = "sendEmail";
    if (promptLower.includes("slack")) finalAction = "sendSlackMessage";
    else if (promptLower.includes("tweet") || (promptLower.includes("twitter"))) finalAction = "sendTweet";

    return {
      name: "Data Processing Workflow",
      description: prompt,
      active: false,
      nodes: [
        this.createTriggerNode("manual"),
        this.createActionNode("fetchData"),
        this.createActionNode("transformData"),
        this.createActionNode(finalAction),
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", type: "smoothstep", animated: false },
        { id: "e2-3", source: "2", target: "3", type: "smoothstep", animated: false },
        { id: "e3-4", source: "3", target: "4", type: "smoothstep", animated: false },
      ],
    };
  }

  private extractWorkflowName(prompt: string): string {
    // Try to extract a meaningful name from the prompt
    if (prompt.length <= 50) {
      return prompt.trim();
    }

    // Find the first sentence or clause that describes the main action
    const sentences = prompt.split(/[.!?]/);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 0 && firstSentence.length <= 50) {
        return firstSentence;
      }
    }

    return prompt.substring(0, 47) + "...";
  }

  private createTriggerNode(type: string): any {
    const baseNode = {
      id: "1",
      position: { x: 100, y: 100 },
      data: {
        label: type === "manual" ? "Manual Trigger" :
          type === "schedule" ? "Scheduled Trigger" :
            type === "webhook" ? "Webhook Trigger" :
              "Email Trigger",
        configured: type === "manual",
      },
    };

    switch (type) {
      case "schedule":
        return {
          ...baseNode,
          type: "scheduleTrigger",
          data: {
            ...baseNode.data,
            cron: "0 9 * * 1-5", // Every weekday at 9 AM
            configured: false,
          },
        };
      case "webhook":
        return {
          ...baseNode,
          type: "webhookTrigger",
          data: {
            ...baseNode.data,
            endpoint: "/webhook/" + Math.random().toString(36).substring(2, 15),
            configured: false,
          },
        };
      case "email":
        return {
          ...baseNode,
          type: "GmailTrigger",
          data: {
            ...baseNode.data,
            label: "Email Trigger",
            subjectFilter: "invoice",
            configured: false,
          },
        };
      default:
        return {
          ...baseNode,
          type: "manualTrigger",
        };
    }
  }

  private createActionNode(type: string): any {
    const baseNode = {
      id: type === "extractInvoiceData" ? "2" : type === "saveToGoogleSheets" ? "3" : "2",
      position: type === "extractInvoiceData" ? { x: 400, y: 100 } : type === "saveToGoogleSheets" ? { x: 700, y: 100 } : { x: 400, y: 100 },
      data: {
        label: this.getActionLabel(type),
        configured: false,
      },
    };

    switch (type) {
      case "sendEmail":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "sendEmail",
            application: "gmail",
            metadata: {
              to: "",
              subject: "Automated Email",
              body: "This is an automated email from nEn.",
            },
          },
        };
      case "sendSlackMessage":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "sendSlackMessage",
            application: "slack",
            metadata: {
              channel: "#general",
              text: "This is an automated message from nEn.",
            },
          },
        };
      case "sendTweet":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "sendTweet",
            application: "twitter",
            metadata: {
              text: "This is an automated tweet from nEn.",
            },
          },
        };
      case "saveToDatabase":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "saveToDatabase",
            application: "database",
            metadata: {
              table: "workflow_results",
              data: {},
            },
          },
        };
      case "extractInvoiceData":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "openAiNodeType",
            application: "openai",
            metadata: {
              prompt: "Extract the invoice amount and due date from the email content. Return JSON with 'amount' and 'dueDate' fields.",
              model: "gpt-5-mini",
              temperature: 0.7,
              maxTokens: 1000,
            },
          },
        };
      case "saveToGoogleSheets":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "GoogleSheetsNodeType",
            application: "google_sheets",
            metadata: {
              spreadsheetId: "",
              range: "A1",
              operation: "APPEND",
              values: "[[\"{{2.amount}}\", \"{{2.dueDate}}\"]]",
            },
          },
        };
      case "createTrelloCard":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "createTrelloCard",
            application: "trello",
            metadata: {
              cardTitle: "{{1.body.title}}",
              listId: "",
            },
          },
        };
      case "downloadFile":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "downloadFile",
            application: "google_drive",
            metadata: {
              fileId: "",
            },
          },
        };
      case "analyzeData":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "openAiNodeType",
            application: "openai",
            metadata: {
              prompt: "Analyze this CSV data and identify high-value customers. Return a summary.",
              model: "gpt-4o",
            },
          },
        };
      case "fetchData":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            label: "Fetch Data",
            actionType: "openAiNodeType",
            application: "openai",
            metadata: {
              prompt: "Fetch or simulate weather data for New York City. Return JSON with temperature and unit.",
              model: "gpt-5-mini",
            },
          },
        };
      case "transformData":
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            label: "Transform Data",
            actionType: "CodeNodeType",
            application: "custom",
            metadata: {
              code: "const data = previousNode.data;\ndata.temperature = (data.temperature * 9/5) + 32;\ndata.unit = 'F';\nreturn data;",
            },
          },
        };
      default:
        return {
          ...baseNode,
          type: "action",
          data: {
            ...baseNode.data,
            actionType: "custom",
            application: "custom",
            metadata: {},
          },
        };
    }
  }

  private getActionLabel(type: string): string {
    switch (type) {
      case "sendEmail":
        return "Send Email";
      case "sendSlackMessage":
        return "Send Slack Message";
      case "sendTweet":
        return "Send Tweet";
      case "saveToDatabase":
        return "Save to Database";
      case "extractInvoiceData":
        return "Extract Invoice Data";
      case "saveToGoogleSheets":
        return "Save to Google Sheets";
      case "createTrelloCard":
        return "Create Trello Card";
      case "downloadFile":
        return "Download File";
      case "analyzeData":
        return "Analyze Data (AI)";
      default:
        return "Custom Action";
    }
  }
}
