import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  Tag,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Globe,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentMethods from '@/components/payments/PaymentMethods';

const steps = [
  {
    icon: Search,
    title: 'Search',
    desc: 'Browse our curated catalog of AI tools, filtered by your region, budget, and skill level.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Get Advice',
    desc: 'Chat with our AI Advisor for personalized stack recommendations tailored to what you are building.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Tag,
    title: 'Get the Best Deal',
    desc: 'We find the best prices, verify credit ratings, and link you to the most trustworthy sellers.',
    color: 'bg-emerald-50 text-emerald-600',
  },
];


const faqs = [
  {
    q: 'How does REFERRED make money?',
    a: 'REFERRED is supported by affiliate commissions and voluntary tips. We never charge users to browse, compare, or get recommendations. If you purchase through one of our affiliate links, we may earn a small commission at no extra cost to you.',
  },
  {
    q: 'Are recommendations biased by affiliate commissions?',
    a: 'No. Our AI Advisor and editorial team evaluate tools independently. We clearly label affiliate links and always recommend the best tool for your needs, even if it means less commission for us.',
  },
  {
    q: 'What regions do you support?',
    a: 'We currently support US, EU, CN (China), and ROW (Rest of World) regions. Pricing, availability, and recommendations are tailored to each region. We are expanding coverage continuously.',
  },
  {
    q: 'How often are prices updated?',
    a: 'Prices are verified at least once every 48 hours. The deal ticker on our homepage shows real-time updates as we discover new promotions.',
  },
  {
    q: 'Can I suggest a tool to be added?',
    a: 'Absolutely! Use the AI Advisor chat to tell us about tools you think we should include, or reach out through our social channels.',
  },
  {
    q: 'What does BACK-ONLINE mean?',
    a: 'BACK-ONLINE is the parent project behind REFERRED. Our tagline — "BACK-ONLINE told me to tell you they referred me" — captures the spirit of trusted peer recommendations in the AI space.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-semibold text-primary-900 pr-4">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-primary-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-48 pb-5' : 'max-h-0'
        )}
      >
        <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-400/10 via-transparent to-transparent" />
        <div className="container-page relative py-20 sm:py-28 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-400/10 px-4 py-1.5 text-sm text-primary-200 mb-6">
            <Globe className="h-3.5 w-3.5" />
            Serving AI builders worldwide
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Built by{' '}
            <span className="text-primary-300">BACK-ONLINE</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-100/80 leading-relaxed">
            REFERRED is the AI tool marketplace that respects your time, your budget, and your intelligence. No noise, no fluff — just the best tools at the best prices.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container-page py-16 sm:py-20">
        <div className="text-center">
          <h2 className="section-heading">How REFERRED Works</h2>
          <p className="section-subheading mx-auto max-w-2xl">
            Three steps from overwhelmed to equipped.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute top-10 left-1/2 hidden w-full sm:block">
                  <ArrowRight className="mx-auto h-5 w-5 text-gray-200 translate-x-[60%]" />
                </div>
              )}
              <div className={cn('mx-auto flex h-16 w-16 items-center justify-center rounded-2xl', step.color)}>
                <step.icon className="h-7 w-7" />
              </div>
              <div className="mt-3 text-xs font-bold text-primary-500">Step {i + 1}</div>
              <h3 className="mt-1 text-lg font-bold text-primary-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="container-page py-16 sm:py-20">
          <div className="text-center">
            <h2 className="section-heading">Support REFERRED</h2>
            <p className="section-subheading mx-auto max-w-2xl">
              REFERRED is free. Tips and sponsorships keep the lights on and the deals flowing.
            </p>
          </div>
          <PaymentMethods className="mt-10" />
        </div>
      </section>

      {/* Explainer */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50 p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-primary-900 sm:text-2xl font-mono">
            "BACK-ONLINE told me to tell you they referred me"
          </h3>
          <p className="mt-4 text-gray-500 leading-relaxed">
            It started as an inside joke. Now it is our whole philosophy. The best
            recommendations come from people you trust. REFERRED treats every
            recommendation like a personal referral from a friend who has done the
            research, tested the tools, and found the best deal.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-500 font-medium">
            <Shield className="h-4 w-4" />
            Independent. Transparent. Trusted.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="container-page py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-subheading mx-auto max-w-2xl">
              Everything you need to know about REFERRED.
            </p>
          </div>
          <div className="mx-auto max-w-2xl card p-0 overflow-hidden">
            <div className="divide-y divide-gray-100 px-6">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page py-16 sm:py-20 text-center">
        <h2 className="section-heading">Ready to build your AI stack?</h2>
        <p className="section-subheading mx-auto max-w-lg">
          Stop drowning in options. Let REFERRED guide you to the best tools at the best prices.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/catalog" className="btn-primary text-base px-8 py-3.5">
            Browse Catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/advisor" className="btn-secondary text-base px-8 py-3.5">
            Talk to AI Advisor
          </Link>
        </div>
      </section>
    </div>
  );
}
