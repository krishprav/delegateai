import { Worker } from "bullmq";

const worker = new Worker(
  "workflow-execution",
  async (job) => {
    const executionData = job.data;
    console.log("Job Details:");
    console.log(`   Execution ID: ${executionData.executionId}`);
    console.log(`   Workflow ID: ${executionData.workflowId}`);
    console.log(`   User ID: ${executionData.userId}`);
    console.log(`   Workflow Name: ${executionData.workflow.name}`);
    console.log(`   Triggered By: ${executionData.triggeredBy}`);
    console.log(`   Priority: ${executionData.priority}`);
    console.log(`   Status: ${executionData.status}`);

    console.log("\n🔗 Workflow Structure:");
    console.log(`   Nodes: ${executionData.workflow.nodes.length}`);
    console.log(`   Edges: ${executionData.workflow.edges.length}`);

    console.log("\n Full Job Data:");
    console.log(JSON.stringify(executionData, null, 2));

    console.log("\n" + "=".repeat(50) + "\n");
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});

console.log("Test Worker started");

process.on("SIGINT", async () => {
  console.log("\n Shutting down...");
  await worker.close();
  process.exit(0);
});
});