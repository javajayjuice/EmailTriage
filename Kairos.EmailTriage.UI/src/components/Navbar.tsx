import Link from "next/link";

// Navbar Component (Reusable)
const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 bg-blue-600 text-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/" className="text-lg font-semibold hover:text-gray-200">
            Home
          </Link>
          <Link href="/features" className="text-lg hover:text-gray-200">
            Features
          </Link>
          <Link href="/pricing" className="text-lg hover:text-gray-200">
            Pricing
          </Link>
          <Link href="/about" className="text-lg hover:text-gray-200">
            About
          </Link>
        </div>
        <div>
          {/* Placeholder for user profile/avatar */}
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700">U</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;