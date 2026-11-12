
import { useEffect, useState } from "react";
import api from "../services/api";

function BackendTest() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const testBackend = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/hello");

        setMessage(response.data);
      } catch (err) {
        console.error("Backend connection failed:", err);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to connect to backend"
        );
      } finally {
        setLoading(false);
      }
    };

    testBackend();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>SkillArena - Backend Integration</h1>

      {loading && <p>Connecting to backend...</p>}

      {message && (
        <p style={{ color: "green" }}>
          Backend Response: {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          Error: {error}
        </p>
      )}
    </div>
  );
}

export default BackendTest;
