import Link from 'next/link';
import DynamicBreadcrumb from './DynamicBreadcrumb';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex flex-col px-4 py-2">
        <div className="text-xl font-bold mb-2">
          <Link href="/">MyApp</Link>
        </div>
        <DynamicBreadcrumb />
      </div>
    </header>
  );
};

export default Header;
