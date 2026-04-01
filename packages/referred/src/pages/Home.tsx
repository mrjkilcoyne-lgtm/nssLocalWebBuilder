import { Link } from 'react-router-dom';
import {
  Cpu,
  Mic,
  Video,
  Wifi,
  Code,
  Landmark,
  Home as HomeIcon,
  Wrench,
  ArrowRight,
  Heart,
  TrendingUp,
} from 'lucide-react';

const categories = [
  { icon: Cpu, label: 'Compute', desc: 'GPUs, cloud, TPUs', color: 'bg-blue-50 text-blue-600' },
  { icon: Mic, label: 'Audio', desc: 'TTS, STT, music', color: 'bg-purple-50 text-purple-600' },
  { icon: Video, label: 'Video', desc: 'Generation, editing', color: 'bg-red-50 text-red-600' },
  { icon: Wifi, label: 'Networking', desc: 'APIs, data pipes', color: 'bg-green-50 text-green-600' },
  { icon: Code, label: 'Software', desc: 'IDEs, agents, tools', color: 'bg-amber-50 text-amber-600' },
  { icon: Landmark, label: 'Financial', desc: 'Fintech AI tools', color: 'bg-emerald-50 text-emerald-600' },
  { icon: HomeIcon, label: 'Home Hubs', desc: 'Smart home AI', color: 'bg-cyan-50 text-cyan-600' },
  { icon: Wrench, label: 'Dev Tools', desc: 'Build, test, deploy', color: 'bg-orange-50 text-orange-600' },
];

const stackBattles = [
  { left: 'Cursor + Claude', right: 'VS Code + Copilot', leftPct: 68 },
  { left: 'RunPod', right: 'Lambda Cloud', leftPct: 55 },
  { left: 'Midjourney', right: 'DALL-E 3', leftPct: 72 },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400/10 via-transparent to-transparent" />
        <div className="container-page relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-400/10 px-4 py-1.5 text-sm text-primary-200">
              <TrendingUp className="h-3.5 w-3.5" />
              Updated daily with the latest AI deals
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop drowning in AI news.{' '}
              <span className="text-primary-300">Start building.</span>
            </h1>
            <p className="mt-5 text-lg text-primary-100/80 sm:text-xl leading-relaxed max-w-2xl">
              The best deals. The best tools. The best path forward. REFERRED
              curates the AI marketplace so you don't have to.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-primary text-base px-8 py-3.5">
                Browse Catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/advisor" className="btn-secondary border-primary-400/30 text-primary-200 hover:bg-primary-800/50 text-base px-8 py-3.5">
                Talk to AI Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="container-page py-16 sm:py-20">
        <div className="text-center">
          <h2 className="section-heading">Browse by Category</h2>
          <p className="section-subheading mx-auto max-w-2xl">
            Eight curated verticals covering every corner of the AI ecosystem.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/catalog?category=${cat.label.toLowerCase()}`}
              className="card group flex flex-col items-center gap-3 py-8 text-center hover:border-primary-200 hover:shadow-primary-500/5"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color} transition-transform duration-200 group-hover:scale-110`}
              >
                <cat.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">{cat.label}</h3>
                <p className="mt-0.5 text-xs text-gray-400">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stack Battles */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="container-page py-16 sm:py-20">
          <div className="text-center">
            <h2 className="section-heading">This Week's Stack Battles</h2>
            <p className="section-subheading mx-auto max-w-2xl">
              Community votes on head-to-head tool comparisons.
            </p>
          </div>
          <div className="mt-10 mx-auto max-w-2xl space-y-6">
            {stackBattles.map((battle, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center justify-between text-sm font-medium mb-3">
                  <span className="text-primary-700">{battle.left}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-gray-600">{battle.right}</span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500"
                    style={{ width: `${battle.leftPct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-gray-400">
                  <span>{battle.leftPct}%</span>
                  <span>{100 - battle.leftPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tip Jar CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50 p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/20">
            <Heart className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-primary-900 sm:text-2xl">
            REFERRED is free. Tips keep it running.
          </h3>
          <p className="mt-3 text-gray-500 leading-relaxed">
            Every recommendation is researched, tested, and updated weekly. If
            we've saved you time or money, consider supporting the project.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/about" className="btn-primary">
              Support REFERRED
              <Heart className="h-4 w-4" />
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
