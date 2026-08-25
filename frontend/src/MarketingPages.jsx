import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileImage,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  Network,
  Play,
  Search,
  Shield,
  Sun,
  UploadCloud,
  X,
  Loader2,
} from 'lucide-react';
import { DotField } from './components/DotField';
import { SpotlightCard } from './components/SpotlightCard';
import { supabase } from './lib/supabaseClient';

const getTheme = (isLightMode) => ({
  page: isLightMode ? 'bg-[#F7F3EA] text-[#1E1D1A]' : 'bg-[#11100E] text-[#F4EBDD]',
  surface: isLightMode ? 'bg-white/86 border-[#1E1D1A]/10' : 'bg-[#1A1815]/86 border-[#F4EBDD]/10',
  surfaceSolid: isLightMode ? 'bg-white border-[#1E1D1A]/10' : 'bg-[#1A1815] border-[#F4EBDD]/10',
  text: isLightMode ? 'text-[#1E1D1A]' : 'text-[#F4EBDD]',
  muted: isLightMode ? 'text-[#6F6A60]' : 'text-[#A69E92]',
  faint: isLightMode ? 'text-[#1E1D1A]/50' : 'text-[#F4EBDD]/45',
  border: isLightMode ? 'border-[#1E1D1A]/10' : 'border-[#F4EBDD]/10',
  line: isLightMode ? 'bg-[#1E1D1A]/10' : 'bg-[#F4EBDD]/10',
  dotGlow: isLightMode ? '#F7F3EA' : '#11100E',
  dotFrom: isLightMode ? 'rgba(143, 92, 18, 0.16)' : 'rgba(214, 154, 45, 0.18)',
  dotTo: isLightMode ? 'rgba(143, 92, 18, 0.08)' : 'rgba(214, 154, 45, 0.08)',
});

const FadeReveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: '-70px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const MagneticButton = ({ children, className = '', ...props }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.14);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.14);
  };

  return (
    <motion.button
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const DotGridLayer = ({ theme, opacity = 1 }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
    <DotField
      glowColor={theme.dotGlow}
      gradientFrom={theme.dotFrom}
      gradientTo={theme.dotTo}
      dotRadius={1.4}
      dotSpacing={20}
      cursorRadius={360}
      cursorForce={0.045}
      bulgeStrength={26}
    />
  </div>
);

const CursorSpotlight = () => {
  useEffect(() => {
    const handleMouse = (event) => {
      document.documentElement.style.setProperty('--spotlight-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--spotlight-y', `${event.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-70"
      style={{
        background: `radial-gradient(540px circle at var(--spotlight-x, 50%) var(--spotlight-y, 20%), rgba(214,154,45,0.12), transparent 42%)`,
      }}
    />
  );
};

const AnimatedCounter = ({ target, suffix = '' }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const frames = 82;
    const id = setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / frames, 3);
      setValue(Math.round(target * progress));
      if (frame >= frames) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
};

const ProductPreview = ({ theme }) => (
  <SpotlightCard className={`rounded-[28px] ${theme.surface} shadow-2xl shadow-black/20`}>
    <div className="relative p-4 sm:p-5">
      <div className={`mb-4 flex items-center justify-between border-b ${theme.border} pb-4`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${theme.faint}`}>Workspace</p>
          <p className={`mt-1 text-sm font-semibold ${theme.text}`}>M&A diligence packet</p>
        </div>
        <div className="rounded-full border border-[#D69A2D]/25 bg-[#D69A2D]/10 px-3 py-1 text-xs font-semibold text-[#D69A2D]">
          Live Graph
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={`rounded-2xl border ${theme.border} bg-black/[0.03] p-4`}>
          <div className={`mb-4 flex items-center gap-2 text-sm font-semibold ${theme.text}`}>
            <FileText size={17} className="text-[#D69A2D]" />
            Source stack
          </div>
          {['Board deck.pdf', 'Q4 financials.xlsx', 'Risk memo.png'].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.12 }}
              className={`mb-3 rounded-xl border ${theme.border} px-3 py-3`}
            >
              <div className={`text-sm font-medium ${theme.text}`}>{item}</div>
              <div className="mt-2 h-1.5 rounded-full bg-[#D69A2D]/12">
                <motion.div
                  className="h-full rounded-full bg-[#D69A2D]"
                  initial={{ width: '18%' }}
                  animate={{ width: `${76 + index * 8}%` }}
                  transition={{ duration: 1.1, delay: 0.5 + index * 0.15 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`relative min-h-[310px] overflow-hidden rounded-2xl border ${theme.border} bg-[#11100E] p-5`}>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 320" aria-hidden="true">
            {[
              ['210,82', '106,150'],
              ['210,82', '306,146'],
              ['106,150', '166,236'],
              ['306,146', '248,238'],
              ['166,236', '248,238'],
              ['210,82', '210,170'],
              ['210,170', '248,238'],
            ].map(([a, b]) => {
              const [x1, y1] = a.split(',');
              const [x2, y2] = b.split(',');
              return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(214,154,45,.28)" strokeWidth="1.2" />;
            })}
          </svg>
          {[
            { label: 'Revenue', x: '47%', y: '20%' },
            { label: 'Contracts', x: '20%', y: '43%' },
            { label: 'Risk', x: '73%', y: '42%' },
            { label: 'Tables', x: '34%', y: '72%' },
            { label: 'Answer', x: '59%', y: '73%' },
          ].map((node, index) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + index * 0.12 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D69A2D]/35 bg-[#1A1815] px-3 py-2 text-xs font-semibold text-[#F4EBDD] shadow-[0_0_0_6px_rgba(214,154,45,0.06)]"
              style={{ left: node.x, top: node.y }}
            >
              {node.label}
            </motion.div>
          ))}
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[#F4EBDD]/10 bg-[#1A1815]/92 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D69A2D]">Query</p>
            <p className="mt-2 text-sm text-[#F4EBDD]">Which revenue risks are tied to customer concentration?</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#A69E92]">
              <CheckCircle2 size={14} className="text-[#D69A2D]" />
              7 linked sources with citations
            </div>
          </div>
        </div>
      </div>
    </div>
  </SpotlightCard>
);

export const LandingPage = ({ setView, isLightMode, setIsLightMode }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const theme = getTheme(isLightMode);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setShowDemo(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const features = [
    {
      icon: FileImage,
      title: 'Visual Parsing',
      description: 'Read layouts, charts, diagrams, scans, and image-heavy reports while preserving document context.',
    },
    {
      icon: Network,
      title: 'Knowledge Graph Generation',
      description: 'Turn extracted entities, tables, clauses, and figures into connected intelligence teams can navigate.',
    },
    {
      icon: BrainCircuit,
      title: 'Multi-Modal Reasoning',
      description: 'Reason across text, numbers, visuals, and relationships with cited answers built for auditability.',
    },
    {
      icon: MessageSquare,
      title: 'Natural Language Querying',
      description: 'Ask plain-English questions across document collections and receive grounded, source-linked responses.',
    },
  ];

  const pipeline = [
    { label: 'Upload', icon: UploadCloud },
    { label: 'Parse', icon: Search },
    { label: 'Connect', icon: Network },
    { label: 'Reason', icon: BrainCircuit },
    { label: 'Answer', icon: MessageSquare },
  ];

  const stats = [
    { value: 98, suffix: '%', label: 'Parsing accuracy on structured enterprise files' },
    { value: 3, suffix: ' Seconds', label: 'Median response time after ingestion' },
    { value: 50, suffix: '+', label: 'Supported document and language patterns' },
    { value: 10, suffix: 'M+', label: 'Document pages ready for graph retrieval' },
  ];

  return (
    <div className={`landing-scroll relative min-h-screen overflow-x-hidden font-sans ${theme.page}`}>
      <CursorSpotlight />

      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed left-0 right-0 top-0 z-50 px-4 py-4"
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-300 ${scrollY > 24 ? `${theme.surface} shadow-xl shadow-black/10` : 'border-transparent bg-transparent'}`}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`flex items-center gap-3 ${theme.text}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D69A2D]/30 bg-[#D69A2D]/12">
              <BrainCircuit size={19} className="text-[#D69A2D]" />
            </span>
            <span className="text-lg font-bold tracking-tight">EvidentAI</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${theme.border} ${theme.faint} transition-colors hover:text-[#D69A2D]`}
              title="Toggle theme"
            >
              {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={() => setView('login')} className={`hidden rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:text-[#D69A2D] sm:block ${theme.muted}`}>
              Sign In
            </button>
            <MagneticButton
              onClick={() => setView('login')}
              className="rounded-xl bg-[#D69A2D] px-5 py-2.5 text-sm font-bold text-[#16130E] shadow-lg shadow-[#D69A2D]/15 transition-colors hover:bg-[#C8891E]"
            >
              Start Analyzing
            </MagneticButton>
          </div>
        </div>
      </motion.nav>

      <section className="relative min-h-screen overflow-hidden px-6 pb-24 pt-32">
        <DotGridLayer theme={theme} opacity={1} />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[calc(100vh-8rem)] lg:grid-cols-[0.92fr_1.08fr]">
          <FadeReveal className="max-w-3xl">
            <h1 className={`max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl ${theme.text}`}>
              Turn Documents Into Connected Intelligence
            </h1>
            <p className={`mt-7 max-w-2xl text-lg leading-8 sm:text-xl ${theme.muted}`}>
              Transform PDFs, reports, spreadsheets, diagrams, and images into a searchable knowledge graph powered by multi-modal AI.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                onClick={() => setView('login')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D69A2D] px-7 py-4 text-base font-bold text-[#16130E] shadow-xl shadow-[#D69A2D]/18 transition-colors hover:bg-[#C8891E]"
              >
                Start Analyzing <ArrowRight size={19} />
              </MagneticButton>
            </div>
            <div className={`mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm ${theme.faint}`}>
              <span className="flex items-center gap-2"><Shield size={15} className="text-[#D69A2D]" /> Tenant-aware processing</span>
              <span className="flex items-center gap-2"><Lock size={15} className="text-[#D69A2D]" /> Cited, auditable answers</span>
            </div>
          </FadeReveal>

          <FadeReveal delay={0.12}>
            <ProductPreview theme={theme} />
          </FadeReveal>
        </div>
      </section>

      <section className="relative z-10 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <FadeReveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D69A2D]">Pipeline</p>
            <h2 className={`mt-4 text-3xl font-semibold tracking-tight sm:text-5xl ${theme.text}`}>A connected workflow from raw files to grounded answers.</h2>
          </FadeReveal>
          <div className="mt-16 grid gap-4 md:grid-cols-5">
            {pipeline.map((step, index) => (
              <FadeReveal key={step.label} delay={index * 0.06} className="relative">
                <div className={`relative h-full rounded-2xl border ${theme.surfaceSolid} p-5 text-center shadow-sm`}>
                  <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl border border-[#D69A2D]/24 bg-[#D69A2D]/10 text-[#D69A2D]">
                    <step.icon size={24} />
                  </div>
                  <p className={`mt-4 text-lg font-semibold ${theme.text}`}>{step.label}</p>
                  {index < pipeline.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.08, duration: 0.7 }}
                      className="absolute left-[calc(50%+2rem)] top-11 hidden h-px w-[calc(100%-1rem)] origin-left bg-[#D69A2D]/45 md:block"
                    />
                  )}
                </div>
              </FadeReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-28">
        <DotGridLayer theme={theme} opacity={0.18} />
        <div className="relative z-10 mx-auto max-w-6xl">
          <FadeReveal className="mb-14 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D69A2D]">Capabilities</p>
            <h2 className={`mt-4 text-3xl font-semibold tracking-tight sm:text-5xl ${theme.text}`}>Built for documents that do not fit neatly into a database.</h2>
          </FadeReveal>
          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature, index) => (
              <FadeReveal key={feature.title} delay={index * 0.06}>
                <motion.div
                  whileHover={{ y: -5, rotateX: 1.5, rotateY: -1.5 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className={`group min-h-[230px] rounded-3xl border ${theme.surfaceSolid} p-8 transition-colors hover:border-[#D69A2D]/50`}
                >
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D69A2D]/25 bg-[#D69A2D]/10 text-[#D69A2D]">
                    <feature.icon size={24} />
                  </div>
                  <h3 className={`text-2xl font-semibold tracking-tight ${theme.text}`}>{feature.title}</h3>
                  <p className={`mt-4 max-w-xl text-base leading-7 ${theme.muted}`}>{feature.description}</p>
                </motion.div>
              </FadeReveal>
            ))}
          </div>
        </div>
      </section>

    

      <section className="relative overflow-hidden px-6 py-32">
        <DotGridLayer theme={theme} opacity={0.95} />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D69A2D]/12 blur-[90px]" />
        <FadeReveal className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className={`text-4xl font-semibold tracking-tight sm:text-6xl ${theme.text}`}>Ready to Decode Intelligence?</h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg leading-8 ${theme.muted}`}>Give every analyst, operator, and decision-maker a connected view of the documents behind the business.</p>
          <MagneticButton
            onClick={() => setView('login')}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D69A2D] px-8 py-4 text-base font-bold text-[#16130E] shadow-2xl shadow-[#D69A2D]/20 transition-colors hover:bg-[#C8891E]"
          >
            Start Analyzing <ArrowRight size={19} />
          </MagneticButton>
        </FadeReveal>
      </section>

      <footer className={`relative z-10 border-t px-6 py-10 ${theme.border}`}>
        <div className={`mx-auto flex max-w-7xl flex-col gap-5 text-sm md:flex-row md:items-center md:justify-between ${theme.muted}`}>
          <div className={`flex items-center gap-3 font-semibold ${theme.text}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D69A2D]/30 bg-[#D69A2D]/10">
              <BrainCircuit size={17} className="text-[#D69A2D]" />
            </span>
            EvidentAI
          </div>
          <div className="flex flex-wrap gap-5">
            <span>Security</span>
            <span>Privacy</span>
            <span>Docs</span>
            <span>Contact</span>
          </div>
          <span>2026 EvidentAI. Enterprise document intelligence.</span>
        </div>
      </footer>

      {showDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowDemo(false)}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#1A1815] p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowDemo(false)} className="absolute right-5 top-5 text-[#F4EBDD]/50 transition-colors hover:text-[#F4EBDD]">
              <X size={20} />
            </button>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D69A2D]/25 bg-[#D69A2D]/10 text-[#D69A2D]">
              <Play size={24} />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-[#F4EBDD]">Demo preview</h3>
            <p className="mx-auto mt-3 max-w-lg text-[#A69E92]">Connect your product demo video here when it is ready. The landing page now keeps this interaction quiet and premium.</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export const LoginPage = ({ setView, isLightMode, setIsLightMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const theme = getTheme(isLightMode);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) return setError('Please enter your email address.');
    if (!password) return setError('Please enter your password.');
    if (password.length < 6) return setError('Password must be at least 6 characters long.');
    if (!supabase) return setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');

    setLoading(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setError('Check your email for the confirmation link.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        setView('dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    if (!supabase) return setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');

    setGoogleLoading(true);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (googleError) throw googleError;
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans ${theme.page}`}>
      <CursorSpotlight />
      <DotGridLayer theme={theme} opacity={0.6} />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-screen items-center px-10 py-16 lg:flex">
          <FadeReveal className="mx-auto max-w-xl">
            <button onClick={() => setView('landing')} className={`mb-12 inline-flex items-center gap-2 text-sm font-semibold ${theme.muted} transition-colors hover:text-[#D69A2D]`}>
              <ArrowLeft size={17} /> Back to Home
            </button>
            <div className={`mb-8 inline-flex items-center gap-2 rounded-full border ${theme.border} ${theme.surface} px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${theme.muted}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D69A2D]" />
              EvidentAI Workspace
            </div>
            <h1 className={`text-5xl font-semibold leading-[1.02] tracking-tight xl:text-6xl ${theme.text}`}>Decode Intelligence From Every Document</h1>
            <p className={`mt-6 text-lg leading-8 ${theme.muted}`}>Transform unstructured information into connected knowledge with AI-powered document understanding.</p>

            <div className={`mt-12 rounded-[28px] border ${theme.surface} p-6 backdrop-blur-xl`}>
              <div className="relative h-64 overflow-hidden rounded-2xl border border-[#D69A2D]/12 bg-[#11100E]">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 280" aria-hidden="true">
                  {[
                    [260, 62, 146, 126],
                    [260, 62, 374, 126],
                    [146, 126, 214, 214],
                    [374, 126, 306, 214],
                    [214, 214, 306, 214],
                    [260, 62, 260, 154],
                  ].map(([x1, y1, x2, y2]) => (
                    <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(214,154,45,.24)" strokeWidth="1.2" />
                  ))}
                  {[
                    [260, 62, 56],
                    [146, 126, 42],
                    [374, 126, 42],
                    [260, 154, 34],
                    [214, 214, 38],
                    [306, 214, 38],
                  ].map(([cx, cy, r], index) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={index === 0 ? 'rgba(214,154,45,.18)' : 'rgba(244,235,221,.06)'} stroke="rgba(214,154,45,.28)" />
                  ))}
                </svg>
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-[#1A1815]/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D69A2D]">Connected sources</p>
                  <p className="mt-2 text-sm text-[#F4EBDD]">Legal, financial, and visual evidence mapped into one answer layer.</p>
                </div>
              </div>
            </div>
          </FadeReveal>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <FadeReveal className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <button onClick={() => setView('landing')} className={`inline-flex items-center gap-2 text-sm font-semibold ${theme.muted}`}>
                <ArrowLeft size={17} /> Home
              </button>
              <button
                onClick={() => setIsLightMode(!isLightMode)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${theme.border} ${theme.faint}`}
                title="Toggle theme"
              >
                {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>

            <div className={`rounded-[30px] border ${theme.surface} p-7 shadow-2xl shadow-black/15 backdrop-blur-2xl sm:p-9`}>
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D69A2D]/30 bg-[#D69A2D]/10 text-[#D69A2D]">
                  <BrainCircuit size={24} />
                </div>
                <h2 className={`text-3xl font-semibold tracking-tight ${theme.text}`}>{isSignUp ? 'Create your workspace' : 'Welcome back'}</h2>
                <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>Enter EvidentAI's secure document intelligence workspace.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-2xl border border-[#D69A2D]/30 bg-[#D69A2D]/10 px-4 py-3 text-sm text-[#D69A2D]"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${theme.text}`}>Email</label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.faint}`} size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-2xl border ${theme.border} bg-transparent py-3.5 pl-12 pr-4 ${theme.text} outline-none transition-colors focus:border-[#D69A2D]/60`}
                      placeholder="analyst@enterprise.com"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={`block text-sm font-semibold ${theme.text}`}>Password</label>
                    <button type="button" className="text-xs font-semibold text-[#D69A2D]">Forgot Password</button>
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.faint}`} size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-2xl border ${theme.border} bg-transparent py-3.5 pl-12 pr-4 ${theme.text} outline-none transition-colors focus:border-[#D69A2D]/60`}
                      placeholder="Password"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <MagneticButton
                  type="submit"
                  disabled={loading || googleLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D69A2D] px-5 py-3.5 font-bold text-[#16130E] transition-colors hover:bg-[#C8891E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Continue'}
                  {!loading && <ArrowRight size={18} />}
                </MagneticButton>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className={`h-px flex-1 ${theme.line}`} />
                <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.faint}`}>or</span>
                <div className={`h-px flex-1 ${theme.line}`} />
              </div>

              <MagneticButton
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl border ${theme.border} px-5 py-3.5 font-semibold ${theme.text} transition-colors hover:border-[#D69A2D]/50 hover:text-[#D69A2D] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {googleLoading ? <Loader2 className="animate-spin" size={18} /> : <span className="font-black">G</span>}
                Continue with Google
              </MagneticButton>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={`mt-6 w-full text-center text-sm font-semibold ${theme.muted} transition-colors hover:text-[#D69A2D]`}
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
              </button>

              <button
                onClick={() => setIsLightMode(!isLightMode)}
                className={`mt-5 hidden w-full items-center justify-center gap-2 rounded-2xl border ${theme.border} py-3 text-sm font-semibold ${theme.muted} transition-colors hover:text-[#D69A2D] lg:flex`}
                type="button"
              >
                {isLightMode ? <Moon size={17} /> : <Sun size={17} />}
                {isLightMode ? 'Use dark mode' : 'Use light mode'}
              </button>
            </div>
          </FadeReveal>
        </section>
      </div>
    </div>
  );
};
