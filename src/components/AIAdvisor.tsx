import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Loan, Asset, ChatMessage } from '../types/finance';
import { formatINR } from '../utils/financeMath';

interface AIAdvisorProps {
  loans: Loan[];
  assets: Asset[];
  monthlyIncome: number;
  monthlyLivingExpenses: number;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  loans,
  assets,
  monthlyIncome,
  monthlyLivingExpenses,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Namaste! I am **DhanVeda AI**, your personal Chief Financial Strategist.

I have analyzed your live portfolio:
- **Total Outstanding Debt:** ₹${formatINR(loans.reduce((sum, l) => sum + l.currentBalance, 0))} across ${loans.length} loans
- **Monthly EMI Load:** ₹${formatINR(loans.reduce((sum, l) => sum + l.emi, 0))}/month
- **Net Worth:** ₹${formatINR(assets.reduce((sum, a) => sum + a.value, 0) - loans.reduce((sum, l) => sum + l.currentBalance, 0))}

How can I help you accelerate debt freedom and compound your wealth today? Choose a suggested question below or ask anything.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestedQuestions = [
    {
      title: 'Repayment Roadmap',
      desc: 'Build my step-by-step Avalanche debt elimination plan',
      prompt: 'Suggest a detailed step-by-step plan to repay all my current debts in the fastest and most cost-effective way (comparing Avalanche vs Snowball).',
      icon: Flame,
    },
    {
      title: 'Prepay vs Mutual Funds',
      desc: 'Should I prepay my home loan or invest in Nifty 50?',
      prompt: 'Should I prepay my existing home loan or invest that surplus cash in Nifty 50 equity mutual funds? Compare the tax and wealth impact.',
      icon: TrendingUp,
    },
    {
      title: 'Bonus Allocation',
      desc: 'What if I get ₹2,00,000 bonus? How to split?',
      prompt: 'I received a ₹2,00,000 bonus. How should I allocate it between prepaying my loans, investing in mutual funds, and emergency savings?',
      icon: Zap,
    },
    {
      title: '3-Year Debt Free',
      desc: 'How can I become 100% debt-free in 3 years?',
      prompt: 'How can I become completely debt-free in 3 years? What additional monthly payment or step-up is required on my current loans?',
      icon: ShieldCheck,
    },
  ];

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    // Prepare full financial context
    const totalDebt = loans.reduce((sum, l) => sum + l.currentBalance, 0);
    const totalEMI = loans.reduce((sum, l) => sum + l.emi, 0);
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const netWorth = totalAssets - totalDebt;

    const financialContext = {
      totalDebt,
      totalEMI,
      totalAssets,
      totalLiabilities: totalDebt,
      netWorth,
      debtToAssetRatio: totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0,
      monthlyIncome,
      monthlyLivingExpenses,
      loans: loans.map((l) => ({
        name: l.name,
        category: l.category,
        balance: l.currentBalance,
        interestRate: l.interestRate,
        emi: l.emi,
        remainingMonths: l.tenureMonths,
      })),
      assets: assets.map((a) => ({
        name: a.name,
        category: a.category,
        value: a.value,
      })),
    };

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          financialContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No advice generated. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Apologies, I encountered a temporary connection issue. However, here is the immediate heuristic rule:
1. Always eliminate any debt >12% interest (like personal loans or credit cards) first.
2. Maintain at least 6 months of living expenses + EMI buffer (₹${formatINR(totalEMI * 6)}).
3. For Home Loans (<9%), split spare cash 50% into principal prepayment and 50% into equity mutual funds for maximum wealth compounding.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/70 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Context-Aware AI Financial Advisor</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              DhanVeda Financial Strategist
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Get personalized, SEBI-grade debt repayment frameworks and wealth compounding plans tailored to your exact active loans, EMIs, and net-worth assets.
            </p>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Conversation</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {suggestedQuestions.map((q, idx) => {
          const Icon = q.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.prompt)}
              disabled={isLoading}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 text-left transition-all hover:bg-slate-850 group active:scale-98 disabled:opacity-60"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-purple-300">
                <Icon className="w-4 h-4 text-purple-400" />
                <span>{q.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                {q.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-xl">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                    isUser
                      ? 'bg-emerald-600/90 text-white rounded-tr-none'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Message content */}
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.content}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-800/40">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none p-4 bg-slate-950/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-150" />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-300" />
                <span className="ml-1 text-slate-400">DhanVeda is formulating your financial strategy...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputPrompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything (e.g. 'How should I repay my ICICI loan first?', 'Should I prepay or SIP?')"
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm shadow-purple-600/30"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
