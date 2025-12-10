import { ClipboardList, Camera, CloudSun, Users, FileText } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';

/**
 * DailyLog - Job site daily reports
 *
 * Placeholder page for daily logging functionality.
 * Future features:
 * - Weather conditions
 * - Crew on site
 * - Work performed
 * - Photos and notes
 * - Safety observations
 */
export function DailyLog() {
  return (
    <PageContainer
      title="Daily Log"
      subtitle="Job site daily reports"
      icon={ClipboardList}
    >
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <ClipboardList className="w-10 h-10 text-blue-500" />
        </div>

        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Daily Logs Coming Soon
        </h2>

        <p className="text-gray-500 text-center max-w-md mb-8">
          Document daily job site activity including weather, crew attendance,
          work performed, and progress photos.
        </p>

        <Card className="w-full max-w-md p-6">
          <h3 className="font-medium text-charcoal mb-4">Planned Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CloudSun className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal">Weather Tracking</p>
                <p className="text-xs text-gray-500">Auto-fetch or manual entry of conditions</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal">Crew Attendance</p>
                <p className="text-xs text-gray-500">Track who was on site and hours worked</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal">Progress Photos</p>
                <p className="text-xs text-gray-500">Document work with timestamped images</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal">Work Notes</p>
                <p className="text-xs text-gray-500">Record activities, issues, and observations</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </PageContainer>
  );
}

export default DailyLog;
