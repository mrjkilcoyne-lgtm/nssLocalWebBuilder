import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Menu, X, Sparkles, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import DealTicker from './DealTicker';
import RegionToggle from './RegionToggle';
import Footer from './Footer';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/advisor', label: 'AI Advisor' },
  { to: '/about', label: 'About' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { easterEgg, showModal, dismiss } = useKonamiCode();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Deal Ticker */}
      <DealTicker />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="container-page flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 shadow-sm shadow-primary-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary-900">
              REFERRED
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <RegionToggle />
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-1 pt-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <RegionToggle />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Easter Egg Modal */}
      {showModal && easterEgg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={dismiss}>
          <div className="mx-4 max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Secret Unlocked!</h3>
            </div>
            <p className="mb-4 text-gray-600">{easterEgg.description}</p>
            {easterEgg.discount_code && (
              <div className="mb-4 rounded-lg bg-primary-50 p-3 text-center">
                <span className="text-sm text-primary-600">Code: </span>
                <span className="font-mono font-bold text-primary-800">{easterEgg.discount_code}</span>
              </div>
            )}
            <button
              onClick={dismiss}
              className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Nice! Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
