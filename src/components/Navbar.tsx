import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Menu, X, User, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
              <Calendar className="h-8 w-8" />
              <span className="hidden sm:block">Smart Campus Events</span>
              <span className="sm:hidden">SCE</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
              Home
            </Link>
            <Link to="/events" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
              Events
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                {user?.role === 'organizer' && (
                  <Link to="/create-event" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Create Event
                  </Link>
                )}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                  <div className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user?.name}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link
                  to="/login"
                  className="text-white/90 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 hover:bg-white/90 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-700 pb-4">
          <div className="px-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              Events
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
                {user?.role === 'organizer' && (
                  <Link
                    to="/create-event"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  >
                    Create Event
                  </Link>
                )}
                <div className="pt-2 mt-2 border-t border-white/20">
                  <div className="flex items-center gap-2 text-white px-3 py-2">
                    <User className="h-5 w-5" />
                    <span>{user?.name}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 mt-2 border-t border-white/20 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-white text-indigo-600 px-3 py-2 rounded-md text-base font-medium text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
