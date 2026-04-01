import { Link } from 'react-router-dom';
import { CreditCard, Wallet, Bitcoin, Heart } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/advisor', label: 'AI Advisor' },
  { to: '/about', label: 'About' },
];

const paymentMethods = [
  { icon: CreditCard, label: 'Stripe' },
  { icon: Wallet, label: 'PayPal' },
  { icon: Bitcoin, label: 'Bitcoin' },
  { icon: Heart, label: 'Buy Me a Coffee' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="container-page py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="text-xl font-bold text-primary-900">
              REFERRED
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              The best deals in AI. Curated recommendations you can trust.
            </p>
            <p className="text-xs font-mono text-primary-500 tracking-wider">
              A BACK-ONLINE project
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-primary-900 mb-3">Navigate</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-primary-900 mb-3">Support Us</h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              REFERRED is free. If our recommendations save you time or money, consider tipping.
            </p>
            <Link to="/about" className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
              See all payment methods &rarr;
            </Link>
          </div>

          {/* Payment Icons */}
          <div>
            <h4 className="text-sm font-semibold text-primary-900 mb-3">We Accept</h4>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.label}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  <pm.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-600">{pm.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} REFERRED by BACK-ONLINE. All rights reserved.
          </p>
          <p className="text-xs font-mono text-primary-400 tracking-widest">
            BACK-ONLINE told me to tell you they referred me
          </p>
        </div>
      </div>
    </footer>
  );
}
