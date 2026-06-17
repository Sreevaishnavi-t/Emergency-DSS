import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import DispatcherDashboard from "./components/DispatcherDashboard";
import CitizenDashboard from "./components/CitizenDashboard";
import PublicHealthDashboard from "./components/PublicHealthDashboard";
import CitizenWelcome from "./components/CitizenWelcome";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/citizen-welcome" element={<CitizenWelcome />} />
      <Route path="/dispatcher" element={<DispatcherDashboard />} />
      <Route path="/citizen" element={<CitizenDashboard />} />
      <Route path="/health" element={<PublicHealthDashboard />} />
    </Routes>
  );
}
