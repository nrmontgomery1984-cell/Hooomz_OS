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
  TimeTrackerPage,
  ExpenseTracker,
  DailyLog,
  ProjectView,
  LoopDetail,
  TaskDetail,
  EstimateBuilder,
  HomeownerQuote,
  Selections,
  PhaseBuilder,
  FloorPlanPage,
  Profile,
  Team,
  EmployeeProfile,
  Intake,
  ContractorIntake,
  CostCatalogue,
  Settings,
  FieldGuide,
  TimeBudgetCalculator,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Intake wizards - standalone, no app layout */}
        <Route path="/intake" element={<Intake />} />
        <Route path="/intake/new-construction" element={<Intake />} />
        <Route path="/intake/renovation" element={<Intake />} />

        {/* Contractor intake - scope-of-work focused */}
        <Route path="/contractor/intake" element={<ContractorIntake />} />

        {/* Main app with layout */}
        <Route element={<AppLayout />}>
          {/* Overview */}
          <Route path="/" element={<Dashboard />} />
          {/* Today page hidden - reserved for field worker features */}
          {/* <Route path="/today" element={<Today />} /> */}

          {/* Pipeline - Pre-Contract */}
          <Route path="/sales" element={<Sales />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/contracts" element={<Contracts />} />

          {/* Production - Post-Contract */}
          <Route path="/production" element={<Production />} />
          <Route path="/completed" element={<Completed />} />

          {/* Daily */}
          <Route path="/time-tracker" element={<TimeTrackerPage />} />
          <Route path="/expenses" element={<ExpenseTracker />} />
          <Route path="/daily-log" element={<DailyLog />} />

          {/* Project Detail Views */}
          <Route path="/projects/:projectId" element={<ProjectView />} />
          <Route path="/projects/:projectId/estimate" element={<EstimateBuilder />} />
          <Route path="/projects/:projectId/quote" element={<HomeownerQuote />} />
          <Route path="/projects/:projectId/selections" element={<Selections />} />
          <Route path="/projects/:projectId/phases" element={<PhaseBuilder />} />
          <Route path="/projects/:projectId/floor-plans" element={<FloorPlanPage />} />
          <Route path="/projects/:projectId/loops/:loopId" element={<LoopDetail />} />
          <Route path="/projects/:projectId/loops/:loopId/tasks/:taskId" element={<TaskDetail />} />

          {/* Other */}
          <Route path="/profile" element={<Profile />} />

          {/* People */}
          <Route path="/team" element={<Team />} />
          <Route path="/team/new" element={<EmployeeProfile />} />
          <Route path="/team/:employeeId" element={<EmployeeProfile />} />

          {/* Settings & Tools */}
          <Route path="/cost-catalogue" element={<CostCatalogue />} />
          <Route path="/time-budget" element={<TimeBudgetCalculator />} />
          <Route path="/settings" element={<Settings />} />

          {/* Training */}
          <Route path="/field-guide" element={<FieldGuide />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
