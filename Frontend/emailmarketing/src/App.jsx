import Login from './auth/Login'
import Signup from './auth/Signup'
import OAuthCallback from './auth/OAuthCallback'
import TermsStandalone from './auth/TermsStandalone'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'
import Settings from './dashboard/Settings'
import CampaignDetails from './dashboard/campagin/campagindetails';
import EmailEditor from './editor/EmailEditor';
import SimpleEditor from './editor/SimpleEditor';
import HtmlEditor from './editor/HtmlEditor';
import PrivacyPolicy from './dashboard/PrivacyPolicy';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms" element={<TermsStandalone />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/campaign/:id" element={<CampaignDetails />} />
      <Route path="/editor/:id" element={<EmailEditor />} />
      <Route path="/simple-editor/:id" element={<SimpleEditor />} />
      <Route path="/html-editor/:id" element={<HtmlEditor />} />
    </Routes>
  )
}


export default App
