import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Dashboard";
import { SignIn } from "./pages/SignIn";
import { Signup } from "./pages/Signup";
import Profile from "./pages/Profile";
import { FloatingNavbar } from "./components/FloatingNavbar";
import WorkflowPage from "./pages/WorkflowPage";
import CreateWorkflowPage from "./pages/CreateWorkflowPage";
import PromptToWorkflowPage from "./pages/PromptToWorkflowPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import Landing from "./pages/Landing";

function App() {
  return (
    <>
      <Routes>
        {/* Public landing page */}
        <Route element={<Landing />} path="/" />

        {/* Auth routes - redirect to dashboard if already logged in */}
        <Route element={<PublicRoute><SignIn /></PublicRoute>} path="/signin" />
        <Route element={<PublicRoute><Signup /></PublicRoute>} path="/signup" />

        {/* Protected dashboard route with floating navbar */}
        <Route
          element={
            <ProtectedRoute>
              <FloatingNavbar />
              <Home />
            </ProtectedRoute>
          }
          path="/dashboard"
        />

        {/* Prompt to workflow route */}
        <Route
          element={
            <ProtectedRoute>
              <PromptToWorkflowPage />
            </ProtectedRoute>
          }
          path="/prompt"
        />

        {/* Create new workflow route */}
        <Route
          element={
            <ProtectedRoute>
              <CreateWorkflowPage />
            </ProtectedRoute>
          }
          path="/create"
        />

        {/* View existing workflow route */}
        <Route
          element={
            <ProtectedRoute>
              <WorkflowPage />
            </ProtectedRoute>
          }
          path="/workflow/:workflowId"
        />

        {/* Profile route */}
        <Route
          element={
            <ProtectedRoute>
              <FloatingNavbar />
              <Profile />
            </ProtectedRoute>
          }
          path="/profile"
        />
      </Routes>
    </>
  );
}

export default App;
