import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { WindowDoorFraming } from '../../components/calculators/framing';

/**
 * Window & Door Framing Calculator Page
 */
export function WindowDoorFramingPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        to="/toolbox"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Toolbox
      </Link>

      {/* Calculator */}
      <WindowDoorFraming />
    </div>
  );
}

export default WindowDoorFramingPage;
