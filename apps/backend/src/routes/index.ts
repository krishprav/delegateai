import { Router } from "express";
import authRouter from "./auth.routes";
import credRouter from "./cred.routes";
import triggerRouter from "./triggers.routes"
import workflowRouter from "./workflow.routes"
import webHookRouter from "./webhook.routes"

const router = Router();

router.use("/auth", authRouter);
router.use("/cred", credRouter);
router.use("/trigger", triggerRouter)
router.use('/workflow', workflowRouter)
router.use('/webhook', webHookRouter)

export default router;
