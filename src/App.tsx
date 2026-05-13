import { 
  Home, 
  MessageSquare, 
  Plus, 
  History, 
  User, 
  LayoutDashboard, 
  Plane, 
  Map, 
  GraduationCap, 
  Briefcase, 
  Home as HomeIcon, 
  ShoppingBag, 
  MoreHorizontal,
  Bell,
  Menu,
  Mic,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Receipt,
  Wallet,
  CheckCircle2,
  ChevronLeft,
  MoreVertical,
  Paperclip,
  Send,
  PlusCircle,
  FileText,
  Clock,
  Filter,
  Search as SearchIcon,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { sendMessage } from './services/gemini';
import Markdown from 'react-markdown';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Pie,
  PieChart as RechartsPieChart
} from 'recharts';

// --- Types ---
type View = 'home' | 'chats' | 'history' | 'profile' | 'budgeting' | 'travel' | 'home-bills' | 'work' | 'education';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachment?: {
    type: 'itinerary';
    data: any;
  };
}

// --- Components ---

const GlowContainer = ({ children, className, glowColor = 'rgba(139, 92, 246, 0.1)' }: { children: React.ReactNode, className?: string, glowColor?: string }) => (
  <div className={cn("relative group", className)}>
    <div 
      className="absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"
      style={{ backgroundColor: glowColor }}
    />
    <div className="relative h-full">
      {children}
    </div>
  </div>
);

const Navbar = ({ active, onChange }: { active: View, onChange: (v: View) => void }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'chats', icon: MessageSquare, label: 'Chats' },
    { id: 'plus', icon: Plus, label: '', primary: true },
    { id: 'history', icon: History, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0d0d12]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 pb-4">
      {items.map((item) => {
        if (item.primary) {
          return (
            <button
              key={item.id}
              onClick={() => onChange('chats')}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
            >
              <item.icon className="w-6 h-6 text-white" />
            </button>
          );
        }

        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id as View)}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-indigo-400" : "text-white/40 hover:text-white/60"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const Header = ({ title = "NEXA AI", onBack }: { title?: string, onBack?: () => void }) => (
  <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md">
    <div className="flex items-center gap-3">
      {onBack ? (
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      ) : (
        <button className="p-2 -ml-2 rounded-full hover:bg-white/5">
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}
      <div className="flex flex-col">
        {onBack ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
               <div className="w-5 h-5 rounded-full bg-indigo-700 border-2 border-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">{title}</h1>
              <p className="text-[10px] text-green-400 font-medium">● Online</p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {!onBack && (
        <>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0a0a0c]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/20 ml-2 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="avatar" />
          </div>
        </>
      )}
      {onBack && (
        <button className="p-2 rounded-full hover:bg-white/5">
          <MoreVertical className="w-5 h-5 text-white/60" />
        </button>
      )}
    </div>
  </header>
);

// --- View: Home ---
const HomeView = ({ onNavigate }: { onNavigate: (v: View) => void }) => {
  const categories = [
    { id: 'budgeting', icon: Wallet, label: 'Budgeting', color: '#10b981', desc: 'Track, plan & save' },
    { id: 'travel', icon: Plane, label: 'Travel', color: '#3b82f6', desc: 'Plan trips & explore' },
    { id: 'education', icon: GraduationCap, label: 'Education', color: '#f59e0b', desc: 'Learn anything' },
    { id: 'work', icon: Briefcase, label: 'Work & Papers', color: '#8b5cf6', desc: 'Docs, PDF, tasks' },
    { id: 'home-bills', icon: HomeIcon, label: 'Home & Bills', color: '#f43f5e', desc: 'Expenses & billing' },
    { id: 'shopping', icon: ShoppingBag, label: 'Shopping', color: '#ec4899', desc: 'Smart shopping' },
    { id: 'maps', icon: Map, label: 'Maps', color: '#6366f1', desc: 'Navigate anywhere' },
    { id: 'more', icon: MoreHorizontal, label: 'More', color: '#94a3b8', desc: 'All tools' },
  ];

  const overview = [
    { label: 'Budget', value: '₱24,650', sub: 'Left this month', color: 'indigo' },
    { label: 'Bills', value: '₱3,240', sub: '2 Due Soon', color: 'red' },
    { label: 'Expenses', value: '₱1,860', sub: 'Today spent', color: 'orange' },
    { label: 'Tasks', value: '6', sub: 'Pending', color: 'green' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Intro */}
      <section className="px-6 pt-2">
        <h2 className="text-2xl font-light text-white/60">Good morning,</h2>
        <h1 className="text-4xl font-bold text-white mt-1">I'm NEXA 👋</h1>
        <p className="text-white/40 mt-3 text-sm font-medium">Your all-in-one AI assistant.<br />How can I help you today?</p>
      </section>

      {/* Hero Bot */}
      <div className="px-6 flex justify-center -mt-4">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-48 h-48"
        >
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="relative w-full h-full bg-[#1a1b23] rounded-full border border-white/10 flex items-center justify-center p-8 overflow-hidden">
             {/* Simple Roboto Head Mockup */}
             <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/2 bg-[#0a0a0c] rounded-3xl border border-white/5 flex items-center justify-around px-4">
                   <div className="w-6 h-6 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                   <div className="w-6 h-6 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-indigo-500/20 rounded-full overflow-hidden">
                   <motion.div 
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-full w-1/2 bg-indigo-400"
                   />
                </div>
             </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-[#0a0a0c] shadow-lg">
            NEXA
          </div>
        </motion.div>
      </div>

      {/* Prompt Bar */}
      <section className="px-6">
        <button 
          onClick={() => onNavigate('chats')}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-6 flex items-center justify-between group active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-white/30 group-hover:text-white/60" />
            <span className="text-white/30 font-medium">Ask anything or create...</span>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-white/30" />
            <div className="p-1.5 rounded-lg bg-indigo-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </button>
      </section>

      {/* Categories Grid */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create & Get Things Done ✨</h3>
          <button className="text-indigo-400 text-xs font-bold">View all</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => onNavigate(cat.id as View)}
              className="flex flex-col items-center gap-2"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-90"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-white leading-tight">{cat.label}</p>
                <p className="text-[8px] text-white/30 leading-tight mt-0.5 line-clamp-1">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Overview Cards */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Overview</h3>
          <button className="text-indigo-400 text-xs font-bold">See all</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {overview.map((item, idx) => (
            <GlowContainer key={idx} glowColor={item.color === 'indigo' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(244, 63, 94, 0.1)'}>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl min-h-[100px] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">{item.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{item.value}</p>
                </div>
                <p className={cn("text-[9px] font-medium", item.color === 'red' ? "text-red-400" : "text-white/40")}>
                  {item.sub}
                </p>
              </div>
            </GlowContainer>
          ))}
        </div>
      </section>

      {/* Pro Banner */}
      <section className="px-6">
        <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-indigo-500/20 p-5 rounded-3xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10" />
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-white">NEXA Pro</h4>
                <p className="text-[10px] text-white/40 font-medium">Unlock advanced features</p>
             </div>
          </div>
          <button className="bg-white text-black text-[10px] font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform">
            Upgrade
          </button>
        </div>
      </section>
    </div>
  );
};

// --- View: Chat ---
const ChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm NEXA 🤖\nWhat would you like to do today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await sendMessage(input);
    
    // Simulate Trip Plan for Baguio if requested (special UI mock)
    const isTripRequest = input.toLowerCase().includes('baguio') || input.toLowerCase().includes('itinerary');

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      attachment: isTripRequest ? {
        type: 'itinerary',
        data: {
          title: "Trip plan to Baguio (18-19 May)",
          budget: "₱4,850 (per person)",
          transport: "Bus (Manila ⇄ Baguio) ₱1,600",
          stay: "1 Night | Hotel ₱2,000",
          food: "₱800",
          places: "Burnham Park, Mines View, Camp John Hay",
          weather: "16° - 23°C | Cool"
        }
      } : undefined
    };

    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex-shrink-0 flex items-center justify-center">
                 <div className="w-4 h-4 rounded-full bg-indigo-600 border border-indigo-400" />
              </div>
            )}
            <div className={cn("flex flex-col gap-2 max-w-[80%]", msg.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white/5 border border-white/5 text-white/90 rounded-tl-none backdrop-blur-md"
              )}>
                <Markdown>{msg.content}</Markdown>
              </div>

              {msg.attachment?.type === 'itinerary' && (
                 <div className="w-full bg-[#15161c] border border-white/5 rounded-3xl p-4 overflow-hidden mt-2">
                    <img src="https://images.unsplash.com/photo-1518173946687-a4c8a24e03e7?auto=format&fit=crop&q=80&w=800" alt="Baguio" className="w-full h-32 object-cover rounded-2xl mb-4" />
                    <h3 className="text-white font-bold text-sm mb-3">Sure! Here's your {msg.attachment.data.title}</h3>
                    <div className="space-y-3">
                       {[
                         { icon: Wallet, label: 'Budget Estimate', value: msg.attachment.data.budget, color: 'text-amber-400' },
                         { icon: Plane, label: 'Transport', value: msg.attachment.data.transport, color: 'text-emerald-400' },
                         { icon: HomeIcon, label: 'Stay', value: msg.attachment.data.stay, color: 'text-orange-400' },
                         { icon: TrendingUp, label: 'Food', value: msg.attachment.data.food, color: 'text-yellow-400' },
                         { icon: Map, label: 'Top Places', value: msg.attachment.data.places, color: 'text-indigo-400' },
                         { icon: Sparkles, label: 'Weather', value: msg.attachment.data.weather, color: 'text-blue-400' },
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                               <item.icon className={cn("w-4 h-4", item.color)} />
                               <span className="text-white/40 text-[11px] font-medium">{item.label}</span>
                            </div>
                            <span className="text-white text-[11px] font-bold text-right">{item.value}</span>
                         </div>
                       ))}
                    </div>
                    <button className="w-full mt-6 bg-indigo-600 py-3 rounded-2xl text-xs font-bold text-white shadow-lg active:scale-[0.98]">
                      View Full Itinerary
                    </button>
                    <div className="flex gap-2 mt-3">
                       <button className="flex-1 bg-white/5 py-2 rounded-xl text-[9px] font-bold text-white/60">Show budget details</button>
                       <button className="flex-1 bg-white/5 py-2 rounded-xl text-[9px] font-bold text-white/60">Best time to visit?</button>
                       <button className="flex-1 bg-white/5 py-2 rounded-xl text-[9px] font-bold text-white/60">Map </button>
                    </div>
                 </div>
              )}

              <span className="text-[9px] text-white/20 font-medium px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                 <div className="w-4 h-4 rounded-full bg-indigo-600" />
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                 <div className="flex gap-1">
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                 </div>
              </div>
           </div>
        )}
      </div>

      <div className="px-6 py-4 flex items-center gap-3 bg-[#0a0a0c]">
         <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95">
           <Plus className="w-6 h-6 text-white/60" />
         </button>
         <div className="flex-1 relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/20 hover:text-white/60">
              <Mic className="w-5 h-5" />
            </button>
         </div>
         <button 
           onClick={handleSend}
           disabled={!input.trim() || loading}
           className="p-3.5 rounded-2xl bg-indigo-600 text-white disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
         >
           <Send className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};

// --- View: Budgeting ---
const BudgetView = () => {
  const data = [
    { name: 'Rent', value: 45, color: '#6366f1' },
    { name: 'Groceries', value: 25, color: '#10b981' },
    { name: 'Utilities', value: 15, color: '#f59e0b' },
    { name: 'Others', value: 15, color: '#94a3b8' },
  ];

  const categories = [
    { label: 'Home', spent: 12500, total: 20000, color: 'indigo' },
    { label: 'Food', spent: 8250, total: 10000, color: 'emerald' },
    { label: 'Transport', spent: 4200, total: 6000, color: 'blue' },
    { label: 'Shopping', spent: 3100, total: 5000, color: 'pink' },
    { label: 'Others', spent: 5000, total: 6000, color: 'gray' },
  ];

  return (
    <div className="px-6 flex flex-col gap-8 pb-32">
      <section>
        <div className="flex items-center justify-between mb-1">
          <p className="text-white/40 text-xs font-bold uppercase tracking-wider">May 2024</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest leading-none">Total Budget</p>
            <h2 className="text-3xl font-bold text-white mt-1">₱50,000</h2>
          </div>
          <div className="relative w-16 h-16">
             <div className="absolute inset-0 rounded-full border-[6px] border-white/5" />
             <div className="absolute inset-0 rounded-full border-[6px] border-indigo-500 border-t-transparent -rotate-45" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-indigo-400">68%</span>
             </div>
          </div>
        </div>
        <div className="flex gap-8 mt-6">
           <div>
             <p className="text-[9px] text-white/40 uppercase font-bold">Spent</p>
             <p className="text-sm font-bold text-white">₱33,850</p>
           </div>
           <div>
             <p className="text-[9px] text-white/40 uppercase font-bold">Left</p>
             <p className="text-sm font-bold text-indigo-400">₱16,150</p>
           </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-bold text-white uppercase tracking-wider">Categories</h3>
           <button className="text-indigo-400 text-xs font-bold underline underline-offset-4">Edit</button>
        </div>
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col gap-2">
               <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                     <div className={cn("w-2 h-2 rounded-full", `bg-${cat.color}-500`)} />
                     <span className="text-white">{cat.label}</span>
                  </div>
                  <div className="text-white/40">
                     <span className="text-white">₱{cat.spent.toLocaleString()}</span> / ₱{cat.total.toLocaleString()}
                     <span className="ml-2 text-indigo-400">{Math.round((cat.spent/cat.total)*100)}%</span>
                  </div>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.spent/cat.total)*100}%` }}
                    className={cn("h-full rounded-full", `bg-${cat.color}-500/80`)}
                  />
               </div>
            </div>
          ))}
        </div>
      </section>

      <button className="w-full bg-indigo-600/10 border border-indigo-500/20 py-4 rounded-2xl flex items-center justify-center gap-2 text-indigo-400 text-sm font-bold active:scale-[0.98]">
         <Plus className="w-5 h-5" />
         Add Expense
      </button>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [view, setView] = useState<View>('home');
  const [historyOrder, setHistoryOrder] = useState<View[]>(['home']);

  const navigate = (to: View) => {
    setView(to);
    setHistoryOrder(prev => [...prev, to]);
  };

  const back = () => {
    if (historyOrder.length > 1) {
      const newHistory = [...historyOrder];
      newHistory.pop();
      const prev = newHistory[newHistory.length - 1];
      setView(prev);
      setHistoryOrder(newHistory);
    } else {
      setView('home');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView onNavigate={navigate} />;
      case 'chats': return <ChatView />;
      case 'budgeting': return <BudgetView />;
      // Placeholders for other views
      case 'travel': return (
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Travel</h2>
            <SearchIcon className="w-5 h-5 text-white/40" />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
             <input type="text" placeholder="Where do you want to go?" className="w-full bg-transparent text-sm text-white focus:outline-none" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Popular Destinations</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
             {['Baguio', 'Boracay', 'Cebu', 'Palawan'].map((city) => (
                <div key={city} className="min-w-[120px] h-40 rounded-2xl overflow-hidden relative border border-white/5">
                   <img src={`https://images.unsplash.com/photo-1518173946687-a4c8a24e03e7?auto=format&fit=crop&q=80&w=300`} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                   <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white uppercase tracking-wider">{city}</span>
                </div>
             ))}
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-6 mb-4">My Trips</h3>
          <div className="space-y-4">
             <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1518173946687-a4c8a24e03e7?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-1">
                   <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">Baguio Trip</h4>
                      <span className="text-[9px] text-white/40 uppercase">Pending</span>
                   </div>
                   <p className="text-[10px] text-white/40 mt-1">18 - 19 May 2024</p>
                   <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400">₱4,850</span>
                      <button className="text-[9px] font-bold text-white/60 bg-white/5 px-3 py-1 rounded-lg">Confirm</button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      );
      case 'home-bills': return (
        <div className="px-6 py-8">
           <h2 className="text-2xl font-bold text-white mb-6">Home & Bills</h2>
           <div className="bg-white/5 border border-white/5 p-6 rounded-3xl mb-8 flex flex-col items-center">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Expense Overview</p>
              <div className="w-48 h-48 mt-4 relative">
                 {/* Recharts Pie Mockup with custom SVG for better visual control */}
                 <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="125.6" className="opacity-80" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="188.4" className="opacity-80" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226" className="opacity-80" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-lg font-bold text-white">₱24,650</p>
                    <p className="text-[8px] text-white/40 uppercase font-bold">Total Spent</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-6 w-full">
                 {[
                   { label: 'Rent', value: '45%', color: 'bg-indigo-500' },
                   { label: 'Groceries', value: '25%', color: 'bg-emerald-500' },
                   { label: 'Utilities', value: '15%', color: 'bg-amber-500' },
                   { label: 'Others', value: '15%', color: 'bg-slate-500' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                         <div className={cn("w-2 h-2 rounded-full", item.color)} />
                         <span className="text-[10px] text-white/60">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white">{item.value}</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Bills</h3>
              <button className="text-indigo-400 text-xs font-bold">View all</button>
           </div>
           <div className="space-y-4">
              {[
                { label: 'Electricity Bill', date: 'Due in 3 days', amount: '₱1,240', icon: Sparkles },
                { label: 'Water Bill', date: 'Due in 5 days', amount: '₱450', icon: TrendingUp },
              ].map((bill, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                         <bill.icon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                         <h4 className="text-xs font-bold text-white">{bill.label}</h4>
                         <p className="text-[9px] text-emerald-400 mt-0.5">{bill.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-white">{bill.amount}</p>
                      <button className="text-[9px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">Pay Now</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      );
      case 'work': return (
        <div className="px-6 py-8">
           <h2 className="text-2xl font-bold text-white mb-6">Work & Papers</h2>
           <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Docs', 'Tasks', 'PDF', 'Notes'].map((filter, i) => (
                <button key={filter} className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  i === 0 ? "bg-indigo-600 text-white" : "bg-white/5 text-white/40"
                )}>{filter}</button>
              ))}
           </div>
           <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Actions</h3>
           <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Create Document', icon: FileText, color: 'bg-blue-500' },
                { label: 'Summarize PDF', icon: PieChart, color: 'bg-rose-500' },
                { label: 'Scan Document', icon: Search, color: 'bg-emerald-500' },
                { label: 'AI Writer', icon: MessageSquare, color: 'bg-purple-500' },
              ].map((action, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                   <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                      <action.icon className="w-5 h-5 text-white" />
                   </div>
                   <span className="text-[10px] font-bold text-white leading-tight">{action.label}</span>
                </div>
              ))}
           </div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Files</h3>
              <button className="text-indigo-400 text-xs font-bold">View all</button>
           </div>
           <div className="space-y-3">
              {[
                { label: 'Project Proposal.pdf', size: '2.4 MB', date: 'May 10' },
                { label: 'Quarterly Report.docx', size: '1.8 MB', date: 'May 08' },
              ].map((file, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-rose-500" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-xs font-bold text-white">{file.label}</h4>
                      <p className="text-[9px] text-white/40 mt-1">{file.date} • {file.size}</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              ))}
           </div>
        </div>
      );
      case 'education': return (
        <div className="px-6 py-8">
           <h2 className="text-2xl font-bold text-white mb-6">Education</h2>
           <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
              <div className="flex items-center gap-3">
                 <SearchIcon className="w-4 h-4 text-white/20" />
                 <input type="text" placeholder="What do you want to learn?" className="bg-transparent text-xs text-white focus:outline-none w-full" />
              </div>
           </div>
           <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Study Tools</h3>
           <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Explain', desc: 'Any topic in simple terms', icon: GraduationCap, color: 'text-indigo-400' },
                { label: 'Solve', desc: 'Math & logic problems', icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Quiz Me', desc: 'Test your knowledge', icon: CheckCircle2, color: 'text-amber-400' },
                { label: 'Summarize', desc: 'Text, articles, books', icon: FileText, color: 'text-rose-400' },
                { label: 'Flashcards', desc: 'Memorize with ease', icon: Sparkles, color: 'text-purple-400' },
              ].map((tool, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group active:bg-white/10 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                         <tool.icon className={cn("w-6 h-6", tool.color)} />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-white">{tool.label}</h4>
                         <p className="text-[10px] text-white/40 mt-0.5">{tool.desc}</p>
                      </div>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
                </div>
              ))}
           </div>
        </div>
      );
      default: return <HomeView onNavigate={navigate} />;
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'home': return 'NEXA AI';
      case 'chats': return 'NEXA AI';
      case 'budgeting': return 'Budgeting';
      case 'travel': return 'Travel';
      case 'home-bills': return 'Home & Bills';
      case 'work': return 'Work & Papers';
      case 'education': return 'Education';
      default: return 'NEXA AI';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Header 
        title={getTitle()} 
        onBack={(view !== 'home' && view !== 'chats' && view !== 'history' && view !== 'profile') ? back : undefined} 
      />
      
      <main className="max-w-md mx-auto relative min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navbar active={view} onChange={(v) => setView(v)} />

      {/* Decorative gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[50%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
