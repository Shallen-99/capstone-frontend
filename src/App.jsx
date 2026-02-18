import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import TripDetails from "./pages/TripDetails";
import "./styles/theme.css";

function App() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard (protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Create new trip */}
      <Route
        path="/trips/new"
        element={
          <ProtectedRoute>
            <TripDetails />
          </ProtectedRoute>
        }
      />

      {/* Edit existing trip */}
      <Route
        path="/trip/:tripId"
        element={
          <ProtectedRoute>
            <TripDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
