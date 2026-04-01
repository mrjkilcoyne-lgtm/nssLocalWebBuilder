import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegionStore } from '@/stores/regionStore';
import RegionToggle from '@/components/RegionToggle';

interface Message {
  id: number;
  role: 'assistant' | 'user';
  content: string;
}

const steps = [
  { label: 'Understanding you', active: true },
  { label: 'Building your stack', active: false },
  { label: "Here's your plan", active: false },
];

const welcomeMessage = `Hey there! I'm REFERRED's AI Advisor. I help you find the perfect AI tool stack for your needs and budget.

Tell me a bit about yourself:
- What are you building or working on?
- What's your experience level with AI tools? (beginner / intermediate / pro)
- Any budget constraints I should know about?`;

export default function Advisor() {
  const region = useRegionStore((s) => s.region);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: welcomeMessage },
  ]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate advisor response
    setTimeout(() => {
      const responses = [
        `Great choices! Based on your ${region} region, I'm looking at the best deals available to you right now. Let me build a personalized stack...`,
        `I've analyzed your needs. Here's what I recommend:\n\n1. **Cursor Pro** ($20/mo) - Best AI code editor\n2. **Claude Pro** ($20/mo) - Advanced reasoning\n3. **RunPod** (pay-as-you-go) - GPU compute\n\nTotal: ~$40/mo + compute costs\n\nWant me to create a detailed stack comparison?`,
        `Stack saved! You can view it at /stack/1. I've included alternatives at every price point and a skill progression path from your current level.\n\nAnything else you'd like me to look into?`,
      ];
      const nextStep = Math.min(currentStep + 1, steps.length - 1);
      setCurrentStep(nextStep);

      const assistantMsg: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: responses[Math.min(currentStep, responses.length - 1)],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header Bar */}
      <div className="border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary-900">AI Advisor</h1>
              <p className="text-xs text-gray-400">Personalized stack recommendations</p>
            </div>
          </div>
          <RegionToggle compact />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-6">
        <div className="container-page">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={cn('h-px w-8 sm:w-12', i <= currentStep ? 'bg-primary-400' : 'bg-gray-200')} />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                      i <= currentStep
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    )}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden text-xs font-medium sm:inline',
                      i <= currentStep ? 'text-primary-700' : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="container-page max-w-3xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' && 'flex-row-reverse'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                  msg.role === 'assistant'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'assistant'
                    ? 'rounded-tl-md bg-white border border-gray-100 text-gray-700 shadow-sm'
                    : 'rounded-tr-md bg-primary-500 text-white'
                )}
              >
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="container-page max-w-3xl">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Tell me what you're building..."
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-all',
                input.trim()
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 hover:bg-primary-600'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-gray-300">
            AI Advisor provides recommendations, not financial advice. Always do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}
