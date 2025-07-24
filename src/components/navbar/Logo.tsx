import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-1 sm:space-x-2 min-w-0">
      <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex-shrink-0">
        <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
      <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent truncate">
        Sentinel Sight
      </span>
    </Link>
  );
};