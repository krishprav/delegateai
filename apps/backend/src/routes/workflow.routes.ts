import { Router } from "express";
import {
  saveWorkflow,
  getWorkflowById,
  updateWorkflow,
  getUserWorkflows,
  executeFlow,
  deleteWorkflow,
  generateWorkflowFromPrompt
} from "../controllers";
import {
  getUserExecutions,
  getExecutionDetails,
  getExecutionStats
} from "../controllers";
import { isLoggedIn } from "../middlewares";

const router = Router();

router.post('/generate', isLoggedIn, generateWorkflowFromPrompt);
router.get('/executions/list', isLoggedIn, getUserExecutions);
router.get('/executions/stats', isLoggedIn, getExecutionStats);
router.get('/executions/:executionId', isLoggedIn, getExecutionDetails);

router.post('/save', isLoggedIn, saveWorkflow);
router.get('/:workflowId', isLoggedIn, getWorkflowById);
router.put('/:workflowId', isLoggedIn, updateWorkflow);
router.get('/', isLoggedIn, getUserWorkflows);
router.post('/execute/:workflowId', isLoggedIn, executeFlow)
router.post('/getAllWorkflows', isLoggedIn, getUserWorkflows)
router.delete('/:workflowId', isLoggedIn, deleteWorkflow)
export default router;
