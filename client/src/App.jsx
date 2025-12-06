import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import {
  Dashboard,
  Today,
  Sales,
  Estimates,
  Contracts,
  Production,
  Completed,
  ProjectView,
  LoopDetail,
  TaskDetail,
  EstimateBuilder,
  HomeownerQuote,
  Profile,
  Intake,
  CostCatalogue,
  Settings,
  FieldGuide,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Intake wizard - standalone, no app layout */}
        <Route path="/intake" element={<Intake />} />
        <Route path="/intake/new-construction" element={<Intake />} />
        <Route path="/intake/renovation" element={<Intake />} />

        {/* Main app with layout */}
        <Route element={<AppLayout />}>
          {/* Overview */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />

          {/* Pipeline - Pre-Contract */}
          <Route path="/sales" element={<Sales />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/contracts" element={<Contracts />} />

          {/* Production - Post-Contract */}
          <Route path="/production" element={<Production />} />
          <Route path="/completed" element={<Completed />} />

          {/* Project Detail Views */}
          <Route path="/projects/:projectId" element={<ProjectView />} />
          <Route path="/projects/:projectId/estimate" element={<EstimateBuilder />} />
          <Route path="/projects/:projectId/quote" element={<HomeownerQuote />} />
          <Route path="/projects/:projectId/loops/:loopId" element={<LoopDetail />} />
          <Route path="/projects/:projectId/loops/:loopId/tasks/:taskId" element={<TaskDetail />} />

          {/* Other */}
          <Route path="/profile" element={<Profile />} />

          {/* Settings & Tools */}
          <Route path="/cost-catalogue" element={<CostCatalogue />} />
          <Route path="/settings" element={<Settings />} />

          {/* Training */}
          <Route path="/field-guide" element={<FieldGuide />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
