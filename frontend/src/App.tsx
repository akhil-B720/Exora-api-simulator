import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { EndpointsPage } from './pages/EndpointsPage';
import { EndpointEditorPage } from './pages/EndpointEditorPage';
import { EndpointDetailsPage } from './pages/EndpointDetailsPage';
import { RequestsPage } from './pages/RequestsPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { ApiTesterPage } from './pages/ApiTesterPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="endpoints" element={<EndpointsPage />} />
          <Route path="endpoints/new" element={<EndpointEditorPage />} />
          <Route path="endpoints/:id" element={<EndpointDetailsPage />} />
          <Route path="endpoints/:id/edit" element={<EndpointEditorPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="requests/:id" element={<RequestDetailsPage />} />
          <Route path="api-tester" element={<ApiTesterPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
