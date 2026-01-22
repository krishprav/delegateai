import { asyncHandler, ApiResponse, CustomError } from "@delegate/auth";

const wbId = new Set();

const AVAILABLE_TRIGGERS = [
  {
    id: "manual-trigger",
    name: "Manual Trigger",
    type: "manual",
    description: "Manually trigger your workflow when needed",
  },
  {
    id: "webhook-trigger",
    name: "Webhook Trigger",
    type: "webhook",
    description: "Trigger workflow via HTTP webhook endpoint",
  },
  {
    id: "schedule-trigger",
    name: "Schedule Trigger",
    type: "schedule",
    description: "Run workflow on a scheduled interval (cron)",
  },
];

export const getAllTriggers = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) throw new CustomError(400, "user does not exits");

  res.status(200).json(new ApiResponse(200, "triggers returned", AVAILABLE_TRIGGERS));
});

export const createTrigger = asyncHandler(async (req, res) => {
  res.status(501).json(new ApiResponse(501, "Triggers are now hardcoded in the system", null));
});

