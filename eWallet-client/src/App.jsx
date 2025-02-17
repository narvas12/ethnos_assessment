import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminRegister from "./pages/Auth/AdminRegister";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Auth/AdminLogin";
import ProtectedRoute from "../utils/ProtectedRoutes";
import IncomeExpenditureAnalysis from "./pages/Dashboard/dashboardComponents/IncomeExpenditureAnalytics";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<AdminRegister />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <IncomeExpenditureAnalysis />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
