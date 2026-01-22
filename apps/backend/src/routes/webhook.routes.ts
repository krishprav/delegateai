import { Router } from "express";
import { triggerWebhook } from "../controllers";

const router = Router();

router.get('/:workflowId/:nodeId', triggerWebhook);
router.post('/:workflowId/:nodeId', triggerWebhook);

export default router