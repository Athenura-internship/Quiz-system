import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "/api/auth/login";

const Toast = ({ message, type }) => {
  if (!message) return null;

  const styles =
    type === "err"
      ? "bg-red-50 text-red-700 border border-red-200"
      : "bg-green-50 text-green-700 border border-green-200";

  return (
    <div className={`px-3 py-2 rounded-lg text-sm font-medium mb-3 ${styles}`}>
      {type === "err" ? "⚠ " : "✓ "} {message}
    </div>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [internId, setInternId] = useState("");
  const [internDate, setInternDate] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!internId.trim()) {
      setToast({ msg: "Enter your Unique ID", type: "err" });
      return;
    }

    if (!internDate) {
      setToast({ msg: "Select joining date", type: "err" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueId: internId,
          joiningDate: internDate,
        }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        setToast({ msg: data.message || "Login failed", type: "err" });
        setLoading(false);
        return;
      }

      // ✅ Store token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToast({ msg: "Login successful 🚀", type: "ok" });

      // ✅ Redirect
      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (err) {
      setToast({ msg: "Server not reachable", type: "err" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-200 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

        <h2 className="text-2xl font-bold text-center text-sky-700 mb-6">
          Intern Login
        </h2>

        <Toast message={toast.msg} type={toast.type} />

        <input
          type="text"
          placeholder="Enter Unique ID"
          value={internId}
          onChange={(e) => setInternId(e.target.value)}
          className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
        />

        <input
          type="date"
          value={internDate}
          onChange={(e) => setInternDate(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}