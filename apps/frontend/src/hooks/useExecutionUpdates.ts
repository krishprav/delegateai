import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BACKEND_URL, WS_URL } from "@/config/api";

interface ExecutionEvent {
  executionId: string;
  workflowId: string;
  workflowName: string;
  userId: string;
  nodeId: string;
  timeStamp: string;
  status: "started" | "completed" | "failed";
  data?: unknown;
}

interface UseExecutionUpdatesOptions {
  onEvent?: (event: ExecutionEvent) => void;
  onNewExecution?: (event: ExecutionEvent) => void;
  onExecutionComplete?: (event: ExecutionEvent) => void;
}

export const useExecutionUpdates = (options: UseExecutionUpdatesOptions = {}) => {
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const optionsRef = useRef(options);
  const maxReconnectAttempts = 5;
  const initRef = useRef(false);

  optionsRef.current = options;

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const connect = (uid: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      
      const wsUrl = `${WS_URL}/user/${uid}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Execution WebSocket connected");
        setConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: ExecutionEvent = JSON.parse(event.data);
          
          optionsRef.current.onEvent?.(data);
          
          if (data.nodeId === "workflow" && data.status === "started") {
            optionsRef.current.onNewExecution?.(data);
          }
          
          if (data.nodeId === "workflow" && (data.status === "completed" || data.status === "failed")) {
            optionsRef.current.onExecutionComplete?.(data);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message", err);
        }
      };

      ws.onclose = () => {
        console.log("Execution WebSocket closed");
        setConnected(false);
        wsRef.current = null;
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(3000 * reconnectAttemptsRef.current, 15000);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect(uid);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("Execution WebSocket error", error);
      };

      wsRef.current = ws;
    };

    const init = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
          withCredentials: true,
        });
        const uid = res.data.data.id;
        setUserId(uid);
        if (uid) {
          connect(uid);
        }
      } catch {
        console.error("Failed to fetch user ID");
      }
    };
    
    init();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { connected, userId };
};
