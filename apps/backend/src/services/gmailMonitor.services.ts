import Imap from "imap";
import { simpleParser } from "mailparser";
import { prisma } from "@delegate/db";
import { createRedisClient } from "@delegate/redis";
import { v4 as uuidv4 } from "uuid";
import { workflowQueue } from "@delegate/queue";

const publisherRedis = createRedisClient();

const connectRedis = async () => {
  try {
    await publisherRedis.connect();
  } catch (error) {
    console.log("redis cannot connect", error);
  }
};

connectRedis();

class GmailMonitor {
  private connections: Map<string, Imap> = new Map();

  async startMonitoring(
    userId: string,
    access_token: string,
    emailAddress: string
  ) {
    console.log(`Starting IMAP monitoring-> ${emailAddress}`);

    const imap = new Imap({
      user: emailAddress,
      xoauth2: access_token,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      password: "",
    });

    imap.once("ready", () => {
      console.log(`IMAP connected for: ${emailAddress}`);
      this.watchInbox(imap, userId);
    });

    imap.once("error", (err: any) => {
      console.error(`IMAP error for ${emailAddress}:`, err.message);
    });

    imap.connect();
    this.connections.set(userId, imap);
  }

  private watchInbox(imap: Imap, userId: string) {
    imap.openBox("INBOX", true, (err, box) => {
      if (err) {
        console.error("Cannot open inbox:", err);
        return;
      }

      console.log(`Watching inbox for user: ${userId}`);

      imap.on("mail", (numNewMsgs: any) => {
        console.log(`New email detected for user: ${userId}`);
        this.handleNewEmail(imap, userId);
      });
    });
  }

  private handleNewEmail(imap: Imap, userId: string) {
    const fetch = imap.seq.fetch("*", {
      bodies: "",
      struct: true,
    });

    fetch.on("message", (msg) => {
      let emailContent = "";

      msg.on("body", (stream) => {
        stream.on("data", (chunk) => {
          emailContent += chunk.toString("utf8");
        });
      });

      msg.once("end", async () => {
        try {
          const parsed = await simpleParser(emailContent);

          const emailData = {
            from: parsed.from?.text || "",
            subject: parsed.subject || "",
            body: parsed.text || "",
            date: new Date(),
          };

          console.log(
            `Email from: ${emailData.from}, Subject: ${emailData.subject}`
          );

          await this.checkForTriggers(userId, emailData);
        } catch (error) {
          console.error("Error parsing email:", error);
        }
      });
    });
  }

  private async checkForTriggers(userId: string, emailData: any) {
    try {
      const workflows = await prisma.workflow.findMany({
        where: { userId: userId, active: true },
      });

      for (const workflow of workflows) {
        const nodes = workflow.nodes as unknown as Array<{ id: string; type: string; data?: Record<string, unknown> }>;
        const emailTriggers = nodes.filter(
          (node) => node.type === "emailTrigger"
        );

        for (const trigger of emailTriggers) {
          if (this.emailMatches(emailData, trigger.data)) {
            await this.triggerWorkflow(workflow, emailData, trigger.id);
            console.log(`Triggered workflow: ${workflow.name}`);
          }
        }
      }
    } catch (error) {
      console.error("Error checking triggers:", error);
    }
  }

  private emailMatches(emailData: any, triggerConfig: any): boolean {
    if (!triggerConfig.senderFilter && !triggerConfig.subjectFilter)
      return true;

    if (triggerConfig.senderFilter)
      if (!emailData.from.includes(triggerConfig.senderFilter)) return false;

    if (triggerConfig.subjectFilter)
      if (!emailData.subject.includes(triggerConfig.subjectFilter))
        return false;

    return true;
  }

  private async triggerWorkflow(workflow: any, emailData: any, nodeId: string) {
    const executionId = uuidv4();

    const job = {
      executionId,
      workflowId: workflow.id,
      userId: workflow.userId,
      triggeredBy: "email",
      triggeredAt: new Date().toISOString(),
      triggerData: {
        nodeId,
        emailData,
      },
      workflow: {
        id: workflow.id,
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        active: workflow.active,
      },
      status: "queued",
      priority: "high",
    };

    await workflowQueue.add("execute-workflow", job, {
      jobId: executionId,
      priority: 1,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });

    console.log(`Queued workflow ${workflow.id} for email trigger`);
  }
}

export const gmailMonitor = new GmailMonitor();
