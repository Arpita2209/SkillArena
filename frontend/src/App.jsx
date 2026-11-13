
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import BackendTest from "./pages/BackendTest";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import FeaturePlaceholder from "./pages/FeaturePlaceholder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backend-test" element={<BackendTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="resume"
            element={
              <FeaturePlaceholder
                eyebrow="RESUME INTELLIGENCE"
                title="Your professional story, refined."
                description="Upload your resume and get AI-powered insights to improve your profile."
              />
            }
          />

          <Route
            path="interviews"
            element={
              <FeaturePlaceholder
                eyebrow="INTERVIEW PRACTICE"
                title="Prepare for what comes next."
                description="Practice with Text, Voice or Hybrid interview experiences."
              />
            }
          />

          <Route
            path="reports"
            element={
              <FeaturePlaceholder
                eyebrow="PERFORMANCE ANALYTICS"
                title="Measure your progress."
                description="Review your interview performance and identify opportunities to improve."
              />
            }
          />

          <Route
            path="settings"
            element={
              <FeaturePlaceholder
                eyebrow="PREFERENCES"
                title="Make SkillArena yours."
                description="Manage your profile and application preferences."
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
