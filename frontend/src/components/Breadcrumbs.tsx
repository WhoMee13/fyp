import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on Home page
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Capitalize and format path segment
          const label = value
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                {last ? (
                  <span className="text-foreground font-semibold ml-1 md:ml-2">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="text-muted-foreground hover:text-primary transition-colors ml-1 md:ml-2"
                  >
                    {label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
