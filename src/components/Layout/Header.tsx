import { useLocation } from 'react-router-dom';
import Breadcrumbs, { BreadcrumbItem } from '../Navigation/Breadcrumbs';
import UserMenu from '../Navigation/UserMenu';
import BackButton from '../Navigation/BackButton';
import MainNav from '../Navigation/MainNav';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  showBack,
  backTo,
  backLabel,
  actions
}: HeaderProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {showBack && (
              <BackButton to={backTo} label={backLabel} />
            )}
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <UserMenu />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <MainNav />
            {actions && (
              <div className="flex items-center gap-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    const label = getBreadcrumbLabel(path);
    
    if (index === paths.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: currentPath });
    }
  });

  return breadcrumbs;
}

function getBreadcrumbLabel(path: string): string {
  switch (path) {
    case 'dashboard':
      return 'Dashboard';
    case 'kb':
      return 'Knowledge Base';
    case 'tickets':
      return 'Tickets';
    case 'settings':
      return 'Settings';
    default:
      return path.charAt(0).toUpperCase() + path.slice(1);
  }
}