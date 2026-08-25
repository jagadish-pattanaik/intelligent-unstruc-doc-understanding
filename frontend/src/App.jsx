import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform } from 'framer-motion';
import { SpotlightCard } from './components/SpotlightCard';
import { SplashCursor } from './components/SplashCursor';
import { DotField } from './components/DotField';
import VariableProximity from './components/VariableProximity';
import ShinyText from './components/ShinyText';
import TrueFocus from './components/TrueFocus';
import TextPressure from './components/TextPressure';
import ScrollReveal from './components/ScrollReveal';
import DecryptedText from './components/DecryptedText';
import GradientText from './components/GradientText';
import Shuffle from './components/Shuffle';
import ScrollVelocity from './components/ScrollVelocity';
import SplitText from './components/SplitText';
import CountUp from './components/CountUp';
import FuzzyText from './components/FuzzyText';
import RotatingText from './components/RotatingText';
import CurvedLoop from './components/CurvedLoop';
import CircularText from './components/CircularText';
import TextCursor from './components/TextCursor';
import BlurText from './components/BlurText';
import TextType from './components/TextType';
import GlitchText from './components/GlitchText';
import ScrambledText from './components/ScrambledText';
import AuroraBackground from './components/AuroraBackground';
import ScrollFloat from './components/ScrollFloat';
import ASCIIText from './components/ASCIIText';
import FallingText from './components/FallingText';
import LaserFlow from './components/LaserFlow';
import GlareHover from './components/GlareHover';
import ClickSpark from './components/ClickSpark';
import GradualBlur from './components/GradualBlur';
import ShapeBlur from './components/ShapeBlur';
import Strands from './components/Strands';
import FluidGlass from './components/FluidGlass';
import {
  UploadCloud, FileText, FileImage, FileBarChart,
  Send, BrainCircuit, Network, LayoutDashboard,
  ChevronRight, Lock, User, CheckCircle2, Loader2,
  Sparkles, Zap, Shield, ArrowRight, Play, Star,
  Layers, Search, MessageSquare, Database, Globe, Cpu,
  X, ArrowLeft, Mail, BookOpen, Scale, FileCheck, Copy,
  Sun, Moon, Maximize2, Minimize2
} from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { LandingPage, LoginPage } from './MarketingPages';
import { DashboardWorkspace } from './DashboardWorkspace';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

import BorderGlow from './components/BorderGlow';

// --- COMPONENTS ---

const GlassCard = ({ children, className = "", style = {} }) => {
  const safeClassName = className.replace('overflow-hidden', '');
  return (
    <BorderGlow
      backgroundColor="transparent"
      borderRadius={16}
      fillOpacity={0}
      className={`bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl ${safeClassName}`}
    >
      {children}
    </BorderGlow>
  );
};

// --- ANIMATED DOT GRID BACKGROUND ---
const DotGrid = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let cols, rows;
    const spacing = 40;
    const baseRadius = 1.2;
    const hoverRadius = 3.5;
    const hoverRange = 120;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.querySelector('.landing-scroll')?.scrollHeight || window.innerHeight * 4;
      cols = Math.ceil(canvas.width / spacing);
      rows = Math.ceil(canvas.height / spacing);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rect = canvas.getBoundingClientRect();

      let mx = -1000;
      let my = -1000;
      if (mouseRef.current.x !== -1000) {
        mx = mouseRef.current.x - rect.left;
        my = mouseRef.current.y - rect.top;
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing + spacing / 2;
          const y = r * spacing + spacing / 2;
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / hoverRange);
          const radius = baseRadius + (hoverRadius - baseRadius) * t;
          const alpha = 0.08 + 0.35 * t;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(136, 189, 242, ${alpha})`;
          ctx.fill();
        }
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

// --- ANIMATED COUNTER ---
const AnimCounter = ({ target, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// --- FLOATING ORB ---
const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none blur-3xl ${className}`}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

// --- PIPELINE NODE ---
const PipelineNode = ({ icon: Icon, label, color, delay, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <div ref={ref} className="flex flex-col items-center gap-3 relative">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: delay, type: "spring", stiffness: 300, damping: 20 }}
        className={`electric-border relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 flex items-center justify-center ${color} backdrop-blur-sm`}
      >
        {/* Pulse ring */}
        <motion.div
          className={`absolute inset-0 rounded-2xl ${color}`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: delay + 0.5 }}
        />
        <Icon size={32} className="relative z-10" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: delay + 0.2 }}
        className="text-xs md:text-sm font-semibold text-storm-100/80 text-center"
      >
        <DecryptedText text={label} animateOn="hover" />
      </motion.div>
    </div>
  );
};

// --- PIPELINE CONNECTOR ---
const PipelineConnector = ({ delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <div ref={ref} className="flex items-center justify-center flex-1 max-w-[80px] md:max-w-[120px] relative h-20 md:h-24">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        className="h-[2px] w-full bg-gradient-to-r from-storm-300/60 to-storm-500/40 origin-left"
      />
      {/* Traveling dot */}
      <motion.div
        initial={{ left: "0%", opacity: 0 }}
        animate={inView ? { left: ["0%", "100%"], opacity: [0, 1, 1, 0] } : {}}
        transition={{ delay: delay + 0.3, duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
        className="absolute w-2 h-2 bg-storm-300 rounded-full shadow-[0_0_10px_rgba(136,189,242,0.8)]"
        style={{ top: "calc(50% - 4px)" }}
      />
    </div>
  );
};

// 1. LANDING PAGE
const LegacyLandingPage = ({ setView, isLightMode, setIsLightMode }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [footerModal, setFooterModal] = useState(null); // 'privacy' | 'terms' | 'docs' | 'contact' | null
  const [copied, setCopied] = useState(null);

  // For Variable Proximity
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ESC key to close demo modal
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setShowDemo(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const features = [
    {
      icon: FileImage,
      title: "Visual Parsing",
      description: "Extract semantic meaning from charts, diagrams, and embedded images using state-of-the-art multi-modal models.",
      hex: "#88BDF2",
      borderColor: "hover:border-storm-300/50",
      glowColor: "from-storm-300/10",
      iconColor: "text-storm-300",
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      description: "Automatically map relationships between paragraphs, tables, footnotes, and figures into a traversable graph.",
      hex: "#34d399",
      borderColor: "hover:border-emerald-400/50",
      glowColor: "from-emerald-400/10",
      iconColor: "text-emerald-400",
    },
    {
      icon: BrainCircuit,
      title: "Agentic QA",
      description: "Ask multi-hop questions across documents and get fully cited, explainable answers with reasoning chains.",
      hex: "#c084fc",
      borderColor: "hover:border-purple-400/50",
      glowColor: "from-purple-400/10",
      iconColor: "text-purple-400",
    },
    {
      icon: Layers,
      title: "Table Extraction",
      description: "Precisely extract and reconstruct complex tables from PDFs, scans, and images—preserving structure and hierarchy.",
      hex: "#fbbf24",
      borderColor: "hover:border-amber-400/50",
      glowColor: "from-amber-400/10",
      iconColor: "text-amber-400",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC-2 compliant, end-to-end encrypted processing. Your documents never leave your tenant boundary.",
      hex: "#22d3ee",
      borderColor: "hover:border-cyan-400/50",
      glowColor: "from-cyan-400/10",
      iconColor: "text-cyan-400",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Process documents in 50+ languages with cross-lingual understanding—query in English, parse in any language.",
      hex: "#fb7185",
      borderColor: "hover:border-rose-400/50",
      glowColor: "from-rose-400/10",
      iconColor: "text-rose-400",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Documents",
      desc: "Drag-and-drop PDFs, DOCX, images, or spreadsheets. Our engine automatically detects document type and structure.",
      icon: UploadCloud,
      accentHex: "#88BDF2",
    },
    {
      num: "02",
      title: "AI Parses & Connects",
      desc: "Multi-modal models extract text, tables, charts, and images—then build a semantic knowledge graph linking every element.",
      icon: Cpu,
      accentHex: "#34d399",
    },
    {
      num: "03",
      title: "Ask Anything",
      desc: "Query across all your documents in natural language. Get cited, explainable answers with source traceability.",
      icon: MessageSquare,
      accentHex: "#c084fc",
    },
  ];

  const stats = [
    { value: 98, suffix: "%", label: "Extraction Accuracy" },
    { value: 50, suffix: "+", label: "Languages Supported" },
    { value: 3, suffix: "s", label: "Avg. Parse Time" },
    { value: 10, suffix: "M+", label: "Documents Processed" },
  ];

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="landing-scroll relative bg-black overflow-x-hidden font-sans selection:bg-storm-300 selection:text-storm-900">

      {/* Dot Field Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField
          glowColor="#000000"
          gradientFrom="#6A89A7"
          gradientTo="#88BDF2"
          dotRadius={2.0}
          dotSpacing={18}
        />
      </div>

      {/* Floating Ambient Orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-storm-300/8 top-[-100px] left-[-150px]" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-purple-500/6 top-[30%] right-[-100px]" delay={3} />
      <FloatingOrb className="w-[350px] h-[350px] bg-emerald-400/6 bottom-[20%] left-[10%]" delay={6} />

      {/* ====== STICKY NAVBAR ====== */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-500 ${scrollY > 50
            ? 'bg-[#0f1923]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20'
            : 'bg-transparent'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-storm-300 to-storm-500 flex items-center justify-center shadow-lg shadow-storm-300/20">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <ShinyText text="EvidentAI" disabled={false} speed={3} className="text-white font-bold text-lg tracking-tight hidden sm:inline" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-storm-300 hover:text-white hover:bg-white/10 transition-colors z-20"
              title="Toggle Theme"
            >
              {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setView('login')}
              className="electric-border text-storm-100/70 hover:text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <ShinyText text="Sign In" disabled={false} speed={3} className="text-sm font-medium" />
            </button>
            <button
              onClick={() => setShowOnboarding(true)}
              className="electric-border bg-storm-300 hover:bg-storm-100 text-[#0f1923] font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-storm-300/20 hover:shadow-storm-300/40"
            >
              <ShinyText text="Get Started" disabled={false} speed={3} className="font-bold text-sm" color="#0f1923" shineColor="#ffffff" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ====== HERO SECTION ====== */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20">
        {/* Top Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-storm-300/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-storm-300/20 bg-storm-300/5 backdrop-blur-md mb-8"
          >
            <Sparkles size={16} className="text-storm-300" />
            <span className="text-storm-100/90 text-xs font-bold tracking-[0.2em] uppercase">
              <ShinyText text="Powered by Multi-Modal AI" disabled={false} speed={3} className="inline-block" color="#88BDF2" shineColor="#ffffff" />
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          {/* Main Headline */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.95]"
          >
            <div className="flex flex-col items-center justify-center">
              <VariableProximity
                label="Decode the"
                className="cursor-default"
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={120}
                falloff="linear"
              />
              <span className="relative inline-block mt-2">
                <VariableProximity
                  label="Unstructured."
                  className="animate-gradient-shift cursor-default"
                  style={{
                    background: 'linear-gradient(90deg, #88BDF2, #a8d8ff, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 200%',
                  }}
                  fromFontVariationSettings="'wght' 400, 'opsz' 9"
                  toFontVariationSettings="'wght' 1000, 'opsz' 40"
                  containerRef={containerRef}
                  radius={120}
                  falloff="linear"
                />
              </span>
            </div>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12 max-w-2xl text-storm-100/70 text-lg md:text-xl leading-relaxed"
          >
            <BlurText
              text="Upload any document and let our AI build a living knowledge graph you can query in natural language"
              delay={30}
              animateBy="words"
              direction="top"
              className="inline-block"
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => setView('login')}
              className="electric-border group relative inline-flex items-center justify-center gap-3 text-[#0f1923] hover:text-[#0f1923] font-extrabold text-lg px-10 py-5 rounded-2xl transition-all duration-300 shadow-[0_0_50px_rgba(136,189,242,0.25)] hover:shadow-[0_0_80px_rgba(136,189,242,0.45)] overflow-hidden"
              style={{ background: 'linear-gradient(90deg, #88BDF2, #6ba3e0)' }}
            >
              <span className="relative z-10 flex items-center gap-2 font-black">
                <SplitText text="Start Analyzing" className="text-[#0f1923] font-extrabold text-lg" delay={40} />
                <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
            </button>

            <button
              onClick={() => setShowDemo(true)}
              className="group inline-flex items-center gap-2.5 text-storm-100/70 hover:text-white font-semibold text-lg px-6 py-5 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play size={16} className="text-white ml-0.5" />
              </div>
              <ShinyText text="Watch Demo" disabled={false} speed={3} className="text-storm-100/70 group-hover:text-white font-semibold text-lg" />
            </button>
          </motion.div>

          {/* Trust Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex items-center gap-2 text-storm-100/30 text-sm"
          >
            <Shield size={14} />
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <ShinyText text="SOC-2 Compliant" disabled={false} speed={3} color="#6A89A7" shineColor="#ffffff" />
              <span className="text-storm-100/30">·</span>
              <ShinyText text="End-to-End Encrypted" disabled={false} speed={4} color="#6A89A7" shineColor="#ffffff" />
              <span className="text-storm-100/30">·</span>
              <ShinyText text="No data retention" disabled={false} speed={5} color="#6A89A7" shineColor="#ffffff" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-storm-100/20 flex justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-storm-300/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ====== PIPELINE VISUALIZATION ====== */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <span className="text-storm-300 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
              <DecryptedText text="The Pipeline" speed={50} maxIterations={10} animateOn="view" />
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              <ScrollReveal
                baseOpacity={0.1}
                blurStrength={3}
              >
                From Raw Documents to Actionable Intelligence
              </ScrollReveal>
            </h2>
          </motion.div>

          {/* Pipeline Flow */}
          <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-2 md:gap-0">
            <PipelineNode icon={UploadCloud} label="Upload" color="bg-storm-300/10 border-storm-300/30 text-storm-300" delay={0} index={0} />
            <PipelineConnector delay={0.2} />
            <PipelineNode icon={Search} label="Parse" color="bg-emerald-400/10 border-emerald-400/30 text-emerald-400" delay={0.4} index={1} />
            <PipelineConnector delay={0.6} />
            <PipelineNode icon={Database} label="Graph Build" color="bg-purple-400/10 border-purple-400/30 text-purple-400" delay={0.8} index={2} />
            <PipelineConnector delay={1.0} />
            <PipelineNode icon={BrainCircuit} label="Reason" color="bg-amber-400/10 border-amber-400/30 text-amber-400" delay={1.2} index={3} />
            <PipelineConnector delay={1.4} />
            <PipelineNode icon={MessageSquare} label="Answer" color="bg-cyan-400/10 border-cyan-400/30 text-cyan-400" delay={1.6} index={4} />
          </div>
        </div>
      </section>

      {/* ====== FEATURES BENTO GRID ====== */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <span className="text-storm-300 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
              <ShinyText text="Capabilities" disabled={false} speed={3} className="text-storm-300" />
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              <SplitText text="Everything You Need to " className="inline-block" delay={30} />
              <GradientText
                colors={['#88BDF2', '#c084fc', '#88BDF2']}
                animationSpeed={6}
                showBorder={false}
                className="inline-block"
              >
                Understand Documents
              </GradientText>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group relative p-7 rounded-3xl bg-white/[0.03] border border-white/[0.06] ${feat.borderColor} hover:bg-white/[0.06] transition-all duration-500 backdrop-blur-sm overflow-hidden cursor-default text-left`}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                {/* Top-right corner glow */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: `${feat.hex}15` }}
                />

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: `${feat.hex}18`,
                    border: `1px solid ${feat.hex}30`,
                  }}
                >
                  <feat.icon style={{ color: feat.hex }} size={24} />
                </div>
                <h3 className="text-white font-bold text-xl mb-3 relative z-10">
                  <Shuffle
                    text={feat.title}
                    iterations={3}
                    fps={30}
                    direction="forward"
                    textColor="white"
                    active={false} // Will rely on parent hover state? Actually, Shuffle takes active prop, or triggers on hover of itself.
                  />
                </h3>
                <p className="text-storm-100/50 text-sm leading-relaxed relative z-10">{feat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="relative z-10 py-24 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
          <ScrollVelocity texts={['HOW IT WORKS • EvidentAI • PIPELINE • ANALYSIS • ']} />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-20"
          >
            <span className="text-storm-300 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
              <DecryptedText text="How It Works" speed={50} maxIterations={10} animateOn="view" />
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
              <BlurText text="Three Steps to" delay={30} animateBy="words" direction="top" className="inline-block" />
              <span
                style={{
                  background: 'linear-gradient(90deg, #88BDF2, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Total Clarity
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-storm-300/30 via-emerald-400/30 to-purple-400/30 hidden md:block" />

            <div className="space-y-16 md:space-y-24">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`flex items-center gap-8 md:gap-16 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.06] transition-all duration-300">
                      <div className="text-sm font-black tracking-[0.15em] uppercase mb-3" style={{ color: step.accentHex }}>{step.num}</div>
                      <h3 className="text-white text-2xl font-bold mb-3">
                        {idx === 0 && <SplitText text={step.title} className="inline-block" delay={40} />}
                        {idx === 1 && <ShinyText text={step.title} disabled={false} speed={3} className="text-white" />}
                        {idx === 2 && <BlurText text={step.title} delay={30} animateBy="words" direction="top" className="inline-block" />}
                      </h3>
                      <div className="text-storm-100/50 leading-relaxed">
                        {idx === 0 && <BlurText text={step.desc} delay={20} animateBy="words" direction="bottom" className="inline-block" />}
                        {idx === 1 && <DecryptedText text={step.desc} speed={80} maxIterations={10} animateOn="view" />}
                        {idx === 2 && <SplitText text={step.desc} className="inline-block" delay={15} />}
                      </div>
                    </div>
                  </div>

                  {/* Center icon node */}
                  <div className="hidden md:flex flex-shrink-0 w-14 h-14 rounded-2xl bg-[#0f1923] border-2 border-storm-300/30 items-center justify-center z-10 shadow-xl shadow-storm-300/10">
                    <step.icon size={24} style={{ color: step.accentHex }} />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== STATS BAR ====== */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 md:p-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center justify-center gap-1">
                    <CountUp to={typeof stat.value === 'number' ? stat.value : 0} duration={2} />
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-storm-100/40 text-sm font-medium flex justify-center">
                    <DecryptedText text={stat.label} speed={50} maxIterations={10} animateOn="view" className="text-sm font-medium" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== BOTTOM CTA ====== */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Background glow */}
          <div className="absolute inset-0 -top-20 -bottom-20 bg-gradient-to-r from-storm-300/10 via-purple-400/5 to-emerald-400/10 blur-[100px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 flex flex-wrap items-center justify-center gap-4">
              <span>Ready to Decode</span>
              <RotatingText
                texts={['Your Data?', 'Your Documents?', 'Your Emails?', 'The Unstructured?']}
                mainClassName="inline-flex px-4 bg-gradient-to-r from-[#88BDF2] to-[#c084fc] text-black overflow-hidden py-1 justify-center rounded-2xl"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2500}
              />
            </h2>
            <p className="text-storm-100/50 text-lg mb-10 max-w-xl mx-auto">
              <BlurText text="Join thousands of enterprises transforming how they understand unstructured documents." delay={20} animateBy="words" direction="bottom" className="inline-block" />
            </p>
            <button
              onClick={() => setView('login')}
              className="electric-border group relative inline-flex items-center justify-center gap-3 text-[#0f1923] font-extrabold text-xl px-14 py-6 rounded-2xl transition-all duration-300 shadow-[0_0_60px_rgba(136,189,242,0.3)] hover:shadow-[0_0_100px_rgba(136,189,242,0.5)] overflow-hidden"
              style={{ background: 'linear-gradient(90deg, #88BDF2, #6ba3e0)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <ShinyText text="Initialize Workspace" disabled={false} speed={3} className="font-extrabold text-xl" color="#0f1923" shineColor="#ffffff" />
                <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-storm-300 to-storm-500 flex items-center justify-center relative z-10">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="text-white font-bold relative z-10">EvidentAI</span>
            <span className="text-storm-100/30 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-storm-100/40 text-sm">
            <button onClick={() => setFooterModal('privacy')} className="hover:text-storm-100 transition-colors cursor-pointer">Privacy</button>
            <button onClick={() => setFooterModal('terms')} className="hover:text-storm-100 transition-colors cursor-pointer">Terms</button>
            <button onClick={() => setFooterModal('docs')} className="hover:text-storm-100 transition-colors cursor-pointer">Documentation</button>
            <button onClick={() => setFooterModal('contact')} className="hover:text-storm-100 transition-colors cursor-pointer">Contact</button>
          </div>
        </div>
      </footer>

      {/* ====== ONBOARDING MODAL (Get Started) ====== */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowOnboarding(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-2xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <GlareHover className="bg-[#0f1923] border border-white/10 rounded-3xl shadow-2xl w-full relative overflow-hidden">
                {/* Close */}
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-storm-100/60 hover:text-white transition-all z-50"
                >
                  <X size={20} />
                </button>
                <div className="max-h-[90vh] overflow-y-auto px-8 md:px-10 py-24 relative z-10">

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-storm-300 to-storm-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-storm-300/20">
                      <BrainCircuit size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3">Welcome to EvidentAI</h2>
                    <p className="text-storm-100/60">Intelligent Unstructured Document Understanding powered by Multi-Modal AI</p>
                  </div>

                  {/* What it does */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Sparkles size={18} style={{ color: '#88BDF2' }} /> What does EvidentAI do?
                    </h3>
                    <p className="text-storm-100/60 text-sm leading-relaxed">
                      EvidentAI uses advanced multi-modal AI to parse, understand, and connect information from your unstructured documents — including PDFs, Word files, scanned images, charts, and tables. It builds a semantic knowledge graph from your documents so you can ask questions in plain English and get cited, explainable answers.
                    </p>
                  </div>

                  {/* How to upload */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <UploadCloud size={18} style={{ color: '#34d399' }} /> How to Upload Documents
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black" style={{ backgroundColor: '#88BDF218', color: '#88BDF2' }}>1</div>
                        <div>
                          <p className="text-white font-semibold text-sm">Sign in to your workspace</p>
                          <p className="text-storm-100/50 text-xs mt-1">Create an account or sign in to access the dashboard.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black" style={{ backgroundColor: '#34d39918', color: '#34d399' }}>2</div>
                        <div>
                          <p className="text-white font-semibold text-sm">Drag & drop your files</p>
                          <p className="text-storm-100/50 text-xs mt-1">Upload PDFs, DOCX, PNG, or XLSX files into the workspace panel on the left side.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black" style={{ backgroundColor: '#c084fc18', color: '#c084fc' }}>3</div>
                        <div>
                          <p className="text-white font-semibold text-sm">Ask questions & get answers</p>
                          <p className="text-storm-100/50 text-xs mt-1">Use the chat interface to query across all your documents. Get cited answers with source traceability.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supported formats */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-8">
                    <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <FileCheck size={16} style={{ color: '#fbbf24' }} /> Supported Formats
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['PDF', 'DOCX', 'PNG', 'JPG', 'XLSX', 'CSV', 'TXT', 'PPTX'].map(fmt => (
                        <span key={fmt} className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-storm-100/70 text-xs font-mono">{fmt}</span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowOnboarding(false); setView('login'); }}
                    className="electric-border w-full text-[#0f1923] hover:text-[#0f1923] font-bold py-4 rounded-xl transition-all shadow-lg shadow-storm-300/20 hover:shadow-storm-300/40 text-lg flex items-center justify-center gap-2 hover:opacity-90"
                    style={{ background: 'linear-gradient(90deg, #88BDF2, #6A89A7)' }}
                  >
                    Continue to Sign In <ArrowRight size={20} />
                  </button>
                </div>
                <GradualBlur position="top" height="6rem" zIndex={20} />
                <GradualBlur position="bottom" height="6rem" zIndex={20} />
              </GlareHover>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== FOOTER MODALS ====== */}
      <AnimatePresence>
        {footerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setFooterModal(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <GlareHover className="bg-[#0f1923] border border-white/10 rounded-3xl p-8 shadow-2xl w-full">
                {/* Close */}
                <button
                  onClick={() => setFooterModal(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-storm-100/60 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>

                {/* Privacy */}
                {footerModal === 'privacy' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#88BDF218' }}>
                        <Shield size={20} style={{ color: '#88BDF2' }} />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                    </div>
                    <div className="space-y-4 text-storm-100/60 text-sm leading-relaxed">
                      <p><strong className="text-white">Data Protection:</strong> All documents uploaded to EvidentAI are processed with end-to-end encryption. We do not store your documents after processing unless explicitly requested.</p>
                      <p><strong className="text-white">No Third-Party Sharing:</strong> Your data is never shared with third parties, advertisers, or external services. All processing happens within your secure tenant boundary.</p>
                      <p><strong className="text-white">SOC-2 Compliance:</strong> EvidentAI is fully SOC-2 Type II compliant, ensuring enterprise-grade security controls, audit logging, and access management.</p>
                      <p><strong className="text-white">Data Retention:</strong> We follow a zero-retention policy by default. Uploaded documents are purged from our servers immediately after processing. Users may opt-in to persistent storage for workspace continuity.</p>
                      <p><strong className="text-white">User Rights:</strong> You have the right to access, correct, or delete your personal data at any time. Contact us to exercise these rights.</p>
                    </div>
                  </div>
                )}

                {/* Terms */}
                {footerModal === 'terms' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c084fc18' }}>
                        <Scale size={20} style={{ color: '#c084fc' }} />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
                    </div>
                    <div className="space-y-4 text-storm-100/60 text-sm leading-relaxed">
                      <p><strong className="text-white">Acceptance:</strong> By accessing or using EvidentAI, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
                      <p><strong className="text-white">Use License:</strong> EvidentAI grants you a limited, non-exclusive, non-transferable license to use the platform for lawful document analysis purposes.</p>
                      <p><strong className="text-white">Prohibited Uses:</strong> You may not use EvidentAI to process classified government documents, illegal content, or content that violates intellectual property rights of others without authorization.</p>
                      <p><strong className="text-white">Intellectual Property:</strong> You retain full ownership of all documents you upload. EvidentAI does not claim any rights over your content. The platform, its UI, AI models, and branding are owned by EvidentAI.</p>
                      <p><strong className="text-white">Limitation of Liability:</strong> EvidentAI is provided "as-is" for hackathon demonstration purposes. AI-generated outputs should be verified for accuracy before making critical decisions.</p>
                    </div>
                  </div>
                )}

                {/* Documentation */}
                {footerModal === 'docs' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#34d39918' }}>
                        <BookOpen size={20} style={{ color: '#34d399' }} />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Documentation</h2>
                    </div>
                    <div className="space-y-4 text-storm-100/60 text-sm leading-relaxed">
                      <p><strong className="text-white">Getting Started:</strong> Sign in, then drag and drop your documents into the Workspace panel on the left side of the dashboard. Supported formats include PDF, DOCX, PNG, JPG, XLSX, CSV, TXT, and PPTX.</p>
                      <p><strong className="text-white">Document Parsing:</strong> Once uploaded, EvidentAI's multi-modal AI engine automatically detects document type, extracts text, tables, charts, and images, and builds a semantic knowledge graph.</p>
                      <p><strong className="text-white">Asking Questions:</strong> Use the central chat panel to ask questions in natural language. You can ask multi-hop questions that span multiple documents. Answers include citation chips linking to source data.</p>
                      <p><strong className="text-white">Source Viewer:</strong> Click any citation chip in the chat to view the extracted source — tables, paragraphs, or images — in the right-side Source Viewer panel.</p>
                      <p><strong className="text-white">Knowledge Graph:</strong> Switch to the "Knowledge Graph" tab in the right panel to visualize semantic relationships between concepts extracted from your documents.</p>
                      <p><strong className="text-white">Tech Stack:</strong> React + Vite frontend, Tailwind CSS for styling, Framer Motion for animations, and Lucide React for icons. Backend uses multi-modal LLM pipelines.</p>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {footerModal === 'contact' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fbbf2418' }}>
                        <Mail size={20} style={{ color: '#fbbf24' }} />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Contact Us</h2>
                    </div>
                    <div className="space-y-5 text-storm-100/60 text-sm leading-relaxed">
                      <p>Have questions, feedback, or want to collaborate? Reach out to the team behind EvidentAI.</p>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2"><Mail size={16} style={{ color: '#fbbf24' }} /> Emails</h4>
                        <div className="flex flex-col gap-4">
                          {[
                            "ayush.kumarverma2024@vitstudent.ac.in",
                            "aryan.nema2024@vitstudent.ac.in",
                            "aditya.24bai10083@vitbhopal.ac.in",
                            "lakshya.asnani2024@vitstudent.ac.in",
                            "divyansh.saxena2024a@vitstudent.ac.in"
                          ].map((email, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <a href={`mailto:${email}`} className="text-storm-300 hover:text-storm-100 transition-colors font-mono text-sm sm:text-base underline underline-offset-4 break-all">
                                {email}
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(email);
                                  setCopied(email);
                                  setTimeout(() => setCopied(null), 2000);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors text-xs font-medium whitespace-nowrap"
                              >
                                {copied === email ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                {copied === email ? "Copied" : "Copy to Clipboard"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2"><BrainCircuit size={16} style={{ color: '#88BDF2' }} /> Project</h4>
                        <p className="text-storm-100/70">Intelligent Unstructured Document Understanding</p>
                        <p className="text-storm-100/40 text-xs mt-1">Built for Dell Hackathon 2026</p>
                      </div>
                    </div>
                  </div>
                )}
              </GlareHover>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== VIDEO DEMO MODAL ====== */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowDemo(false)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                Press ESC or click to close ✕
              </button>

              {/* Video container */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-storm-300/10 bg-[#0f1923]">
                {/* Aspect ratio container */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>

                  {/* ====== INSTRUCTIONS FOR USER: HOW TO ADD VIDEO ====== */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1923] to-[#1a2a3a] border-2 border-dashed border-storm-300/30 rounded-2xl m-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-storm-300/20 flex items-center justify-center mb-4"
                    >
                      <Play size={24} className="text-storm-300 ml-1" />
                    </motion.div>
                    <h3 className="text-white text-xl font-bold mb-2">How to add your video:</h3>
                    <p className="text-storm-100/70 text-sm max-w-md text-center mb-4">
                      Open <code className="bg-white/10 px-2 py-1 rounded text-storm-300">App.jsx</code>, go to line ~1000, and replace this instruction block with your video embed code:
                    </p>
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-storm-300 border border-storm-300/20">
                      {'<iframe'} <br />
                      {'  className="absolute top-0 left-0 w-full h-full"'} <br />
                      {'  src="YOUR_YOUTUBE_OR_VIMEO_LINK_HERE"'} <br />
                      {'  allowFullScreen'} <br />
                      {'/>'}
                    </div>
                  </div>
                  {/* ==================================================== */}

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Styles for Landing */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
      `}} />
    </div>
  );
};
// 2. LOGIN PAGE
const LegacyLoginPage = ({ setView, isLightMode, setIsLightMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!supabase) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        alert('Check your email for the confirmation link!');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-black">
      {/* Dot Field Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField
          glowColor="#000000"
          gradientFrom="#6A89A7"
          gradientTo="#88BDF2"
          dotRadius={2.0}
          dotSpacing={18}
        />
      </div>

      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#cf9eff]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10 relative"
      >
        {/* Laser Flow falling from above hitting the top center of the card */}
        <div
          className="absolute left-0 w-full pointer-events-none z-[-1]"
          style={{
            height: '100vh',
            bottom: '100%',
            marginBottom: '-2px' // Overlap slightly to perfectly touch the top border
          }}
        >
          <LaserFlow
            color="#cf9eff"
            verticalSizing={8.0}
            horizontalSizing={1.5} // Perfectly matches the width of the card
            verticalBeamOffset={-0.5} // Beam strikes from the top and ends at the bottom edge of this container
            wispSpeed={-20.0} // Particles flow downwards
            fogIntensity={0.05}
          />
        </div>

        {/* Close / Back button */}
        <button
          onClick={() => setView('landing')}
          className="absolute -top-14 left-0 flex items-center gap-2 text-storm-100/50 hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>
        <div className="absolute -top-14 right-0 flex items-center gap-2">
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-storm-100/50 hover:text-white transition-all"
            title="Toggle Theme"
          >
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={() => setView('landing')}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-storm-100/50 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <GlassCard className="p-8" style={{ borderColor: 'rgba(207, 158, 255, 0.4)', boxShadow: '0 25px 50px -12px rgba(207, 158, 255, 0.15)' }}>
          <div className="text-center mb-8">
            <BrainCircuit size={48} className="mx-auto text-storm-300 mb-4" />
            <h2 className="text-3xl font-bold text-white">
              <TextCursor text="Welcome Back" />
            </h2>
            <div className="text-storm-100/70 mt-2">
              <DecryptedText text="Sign in to access your multi-modal workspace." speed={50} maxIterations={10} animateOn="view" />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2"
            >
              <Shield size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-storm-100 mb-1">
                <BlurText text="Email" delay={30} animateBy="letters" />
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-100/50" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-storm-900/50 border border-storm-500/30 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-storm-300 transition-colors"
                  placeholder="analyst@enterprise.com"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-storm-100">
                  <BlurText text="Password" delay={30} animateBy="letters" />
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-100/50" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-storm-900/50 border border-storm-500/30 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-storm-300 transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="electric-border w-full text-[#0f1923] font-bold py-3 rounded-lg mt-6 transition-all shadow-lg hover:shadow-storm-300/25 hover:opacity-90 flex justify-center items-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #6A89A7, #88BDF2)' }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <TextType text={isSignUp ? "Sign Up" : "Sign In"} />} {!loading && <ChevronRight size={18} />}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-storm-300 hover:text-white transition-colors"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

// 3. MAIN DASHBOARD
const LegacyDashboard = ({ setView, session, isLightMode, setIsLightMode }) => {
  const [activeTab, setActiveTab] = useState('source');
  const [activeCitation, setActiveCitation] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isRightPanelMaximized, setIsRightPanelMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [docs, setDocs] = useState([]);

// Load already indexed PDFs on page load
useEffect(() => {
  const fetchSources = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sources`);
      if (res.ok) {
        const data = await res.json();
        if (data.sources && data.sources.length > 0) {
          const restoredDocs = data.sources.map((name, idx) => ({
            id: idx + 1,
            name: name,
            status: 'Parsed',
            icon: <FileText size={18} />
          }));
          setDocs(restoredDocs);
        }
      }
    } catch (err) {
      console.error('Could not fetch sources:', err);
    }
  };
  fetchSources();
}, []);
  const [showProfile, setShowProfile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const userQuery = input;
    // We get the index of the next AI message
    const messageIndex = messages.length + 1;

    setMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
    setInput('');
    setIsProcessing(true);

    // Initial placeholder for AI message
    setMessages(prev => [...prev, { sender: 'ai', text: '', status: 'Connecting to backend...', citations: null }]);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, agentic: false })
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          let currentEvent = null;

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr);
                  if (currentEvent === 'status') {
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[messageIndex] = { ...newMsgs[messageIndex], status: data.message };
                      return newMsgs;
                    });
                  } else if (currentEvent === 'answer') {
                    currentText += data.text;
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[messageIndex] = { ...newMsgs[messageIndex], text: currentText, status: null };
                      return newMsgs;
                    });
                  } else if (currentEvent === 'error') {
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[messageIndex] = { ...newMsgs[messageIndex], text: "Error: " + data.message, status: null };
                      return newMsgs;
                    });
                  } else if (currentEvent === 'done') {
                    if (data.metadata) {
                      if (data.metadata.sources) {
                        const mappedCitations = data.metadata.sources.map(s => ({
                          id: s.marker,
                          label: `[${s.marker}]`,
                          type: "text",
                          title: s.title || s.source || "Extracted Source",
                          snippet: s.snippet
                        }));
                        setMessages(prev => {
                          const newMsgs = [...prev];
                          newMsgs[messageIndex] = { ...newMsgs[messageIndex], citations: mappedCitations };
                          return newMsgs;
                        });
                      }
                      if (data.metadata.contributing_subgraph) {
                        setGraphData(data.metadata.contributing_subgraph);
                      }
                    }
                  }
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[messageIndex] = { ...newMsgs[messageIndex], text: "Failed to connect to backend.", status: null };
        return newMsgs;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCitationData = useMemo(() => {
    if (!activeCitation) return null;
    for (const msg of messages) {
      if (msg.citations) {
        const found = msg.citations.find(c => c.id === activeCitation);
        if (found) return found;
      }
    }
    return null;
  }, [activeCitation, messages]);

  return (
    <div className="h-screen w-full flex flex-col bg-black text-storm-100 p-2 gap-2 font-sans overflow-hidden relative">
      {/* Dot Field Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField
          glowColor="#000000"
          gradientFrom="#6A89A7"
          gradientTo="#88BDF2"
          dotRadius={2.0}
          dotSpacing={18}
        />
      </div>

      {/* TOP NAVBAR */}
      <div className="w-full h-14 bg-black/20 rounded-xl border border-white/10 flex items-center justify-between px-4 shrink-0 relative">


        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-white font-bold hover:text-storm-300 transition-colors z-10 relative"
        >
          <BrainCircuit size={20} className="text-storm-300" />
          <GlitchText text="EvidentAI" speed={0.5} />
          <span className="text-xs bg-storm-300/20 text-storm-300 px-2 py-0.5 rounded-md ml-1 font-semibold border border-storm-300/30">Home</span>
        </button>

        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-storm-300 hover:text-white hover:bg-white/10 transition-colors z-20"
            title="Toggle Theme"
          >
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-storm-300/20 to-emerald-400/20 border border-storm-300/30 flex items-center justify-center text-storm-300 font-bold hover:shadow-[0_0_15px_rgba(136,189,242,0.4)] transition-all"
            >
              A
            </button>

            {/* PROFILE DROPDOWN */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-14 w-64 bg-[#0B1121]/95 backdrop-blur-xl border border-storm-300/20 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <p className="text-white font-bold text-lg">Analyst User</p>
                    <p className="text-storm-100/60 text-xs font-mono mt-1">{session?.user?.email || 'analyst@enterprise.com'}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={async () => {
                        if (supabase) await supabase.auth.signOut();
                        setView('landing');
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X size={16} /> Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MAIN 3-PANEL WORKSPACE */}
      <div className="flex-1 w-full flex gap-2 min-h-0">
        {/* LEFT PANEL: Document Management */}
        <GlassCard className="min-w-[200px] w-1/4 max-w-[50%] h-full min-h-0 flex flex-col rounded-xl overflow-clip resize-x z-20 shrink-0">
          <div className="absolute inset-0 flex flex-col overflow-clip z-10">
            <div className="shrink-0 p-4 border-b border-white/10 bg-black/10 z-10 relative flex items-center">
              <LayoutDashboard className="text-storm-300 mr-2" />
              <div className="text-lg font-bold text-white leading-none mt-1">
                <TrueFocus
                  sentence="Workspace"
                  manualMode={false}
                  blurAmount={3}
                  borderColor="#88BDF2"
                  animationDuration={0.4}
                  pauseBetweenAnimations={1}
                />
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Drag & Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-storm-500/50 rounded-xl p-6 text-center mb-6 hover:bg-white/5 transition-colors cursor-pointer overflow-hidden group"
              >
                {/* ShapeBlur background */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                  <ShapeBlur variation={0} shapeSize={1.2} roundness={0.4} borderSize={0.05} circleSize={0.3} circleEdge={0.5} />
                </div>

                {/* Text content lifted above blur */}
                <div className="relative z-10 pointer-events-none">
                  <UploadCloud className="mx-auto mb-2 text-storm-300" size={32} />
                  <p className="text-sm font-medium">Click or Drag & drop documents</p>
                  <p className="text-xs text-storm-100/60 mt-1">PDF, DOCX, PNG supported</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.docx,.png,.jpg,.xlsx,.csv,.txt,.pptx"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const ext = file.name.split('.').pop().toLowerCase();
                      const icon = ['png', 'jpg', 'jpeg'].includes(ext)
                        ? <FileImage size={18} />
                        : ['xlsx', 'csv'].includes(ext)
                          ? <FileBarChart size={18} />
                          : <FileText size={18} />;

                      const newDoc = { id: Date.now(), name: file.name, status: 'Uploading...', icon };
                      setDocs(prev => [...prev, newDoc]);

                      const formData = new FormData();
                      formData.append('file', file);

                      try {
                        const res = await fetch(`${API_BASE}/api/ingest`, {
                          method: 'POST',
                          body: formData
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'Parsed' } : d));
                        } else {
                          const err = await res.json();
                          setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'Error: ' + err.detail } : d));
                        }
                      } catch (err) {
                        console.error(err);
                        setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'Error' } : d));
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </div>

              <h3 className="text-xs uppercase font-bold text-storm-100/50 tracking-wider mb-3 relative z-10">
                <ScrollFloat
                  text="Ingested Assets"
                  animationDuration={1}
                  stagger={0.05}
                  ease="back.out(2)"
                  scrollStart="center bottom+=50"
                  scrollEnd="bottom bottom-=400"
                />
              </h3>
              <div className="space-y-2">
                {docs.length === 0 ? (
                  <div className="text-center p-4 border border-white/5 rounded-lg bg-white/[0.02]">
                    <p className="text-sm text-storm-100/50">No documents uploaded yet.</p>
                  </div>
                ) : (
                  docs.map(doc => (
                    <SpotlightCard key={doc.id} className="p-3 flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer border border-white/5 bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="text-storm-300">{doc.icon}</div>
                        <div className="truncate w-32 text-sm">{doc.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'Parsed' ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : (
                          <Loader2 size={14} className="animate-spin text-amber-400" />
                        )}
                        <button
                          onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-storm-100/40 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </SpotlightCard>
                  ))
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* CENTER PANEL: Chat & QA */}
        <GlassCard className="flex-1 min-w-[300px] h-full min-h-0 flex flex-col rounded-xl overflow-clip relative z-10">
          <div className="absolute inset-0 flex flex-col overflow-clip z-10">
            <AuroraBackground className="absolute inset-0 z-0 opacity-30 mix-blend-screen pointer-events-none" />

            <div className="shrink-0 p-4 border-b border-white/10 bg-black/20 backdrop-blur-md flex justify-between items-center z-10 relative">
              <div className="text-lg font-bold text-white mt-1">
                <TrueFocus
                  sentence="Multi-Modal Analyst Assistant"
                  manualMode={false}
                  blurAmount={4}
                  borderColor="#cf9eff"
                  animationDuration={0.6}
                  pauseBetweenAnimations={1.5}
                />
              </div>
              <span className="text-xs bg-storm-500/20 text-storm-300 px-2 py-1 rounded-full border border-storm-500/30">Llama-3 Reasoning</span>
            </div>

            <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-6 flex flex-col z-10 relative">
              {messages.length === 0 ? (
                <div className="text-center text-storm-100/40 my-auto">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start a conversation to analyze your documents.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 25 }}
                    key={idx}
                    className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-2xl p-5 backdrop-blur-xl border ${msg.sender === 'user'
                          ? 'bg-gradient-to-br from-storm-500/40 to-storm-500/10 border-storm-300/40 text-white rounded-br-sm shadow-[0_0_20px_rgba(106,137,167,0.2)]'
                          : 'bg-gradient-to-br from-[#121c26]/90 to-[#0a1017]/90 border-storm-500/30 rounded-bl-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
                        }`}
                    >
                      {/* Subtle Inner Glow for AI Message */}
                      {msg.sender === 'ai' && (
                        <div className="absolute inset-0 rounded-2xl rounded-bl-sm pointer-events-none overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#cf9eff]/30 to-transparent" />
                          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-[#cf9eff]/20 to-transparent" />
                        </div>
                      )}

                      <div className={`text-[15px] leading-[1.8] tracking-wide relative z-10 ${msg.sender === 'user' ? 'text-white' : 'text-storm-100/90'}`}>
                        {msg.status ? (
                          <div className="flex items-center gap-2 text-storm-300 text-sm animate-pulse">
                            <div className="w-4 h-4 border-2 border-storm-300 border-t-transparent rounded-full animate-spin" />
                            {msg.status === 'starting_generation' ? 'Thinking...' :
                             msg.status === 'request_received' ? 'Searching knowledge graph...' :
                             msg.status === 'cache_hit' ? 'Cache hit found...' :
                             msg.status === 'cache_miss' ? 'Analyzing documents...' :
                             msg.status}
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                      {msg.citations && (
                        <div className="mt-4 pt-3 border-t border-storm-500/20 flex flex-wrap gap-2 relative z-10">
                          {msg.citations.map(cite => (
                            <button
                              key={cite.id}
                              onClick={() => setActiveCitation(cite.id)}
                              className="text-xs bg-storm-900/80 hover:bg-[#cf9eff]/10 hover:text-[#cf9eff] border border-storm-500/40 px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:border-[#cf9eff]/50 font-medium text-storm-100/80"
                            >
                              <Network size={12} className="opacity-70" /> {cite.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="shrink-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10 z-10 relative">
              <div className="flex items-center w-full bg-white/5 border border-white/20 rounded-xl pr-2 focus-within:border-storm-300 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question across all documents..."
                  className="flex-1 bg-transparent py-3 pl-4 pr-2 text-white placeholder-storm-100/40 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  className="p-2 bg-storm-500 hover:bg-storm-300 hover:text-storm-900 text-white rounded-lg transition-colors shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* RIGHT PANEL: Context Viewer & Graph */}
        {isRightPanelMaximized && (
           <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsRightPanelMaximized(false)} />
        )}
        <div 
          className={isRightPanelMaximized ? "fixed inset-8 md:inset-16 z-50 flex flex-col rounded-2xl overflow-clip shadow-[0_0_100px_rgba(0,0,0,0.9)] border border-storm-300/30 bg-[#0a1017]/95 backdrop-blur-xl transition-all duration-300" : "min-w-[200px] w-1/4 max-w-[50%] h-full min-h-0 flex flex-col rounded-xl overflow-clip resize-x z-20 shrink-0 bg-white/10 backdrop-blur-lg border border-white/10 shadow-2xl transition-all duration-300"} 
          style={{ direction: isRightPanelMaximized ? 'ltr' : 'rtl' }}
        >
          <div className="absolute inset-0 flex flex-col overflow-clip z-10" style={{ direction: 'ltr' }}>
            <div className="flex border-b border-white/10 bg-black/10 shrink-0">
              <button
                onClick={() => setActiveTab('source')}
                className={`flex-1 p-4 text-sm font-semibold transition-colors ${activeTab === 'source' ? 'text-storm-100 border-b-2 border-storm-300 bg-white/5' : 'text-storm-100/50 hover:text-white'}`}
              >
                Source Viewer
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex-1 p-4 text-sm font-semibold transition-colors ${activeTab === 'graph' ? 'text-storm-100 border-b-2 border-storm-300 bg-white/5' : 'text-storm-100/50 hover:text-white'}`}
              >
                Knowledge Graph
              </button>
              <button 
                onClick={() => setIsRightPanelMaximized(!isRightPanelMaximized)}
                className="p-4 text-storm-100/50 hover:text-white transition-colors border-l border-white/10 shrink-0 flex items-center justify-center bg-black/20"
                title={isRightPanelMaximized ? "Minimize" : "Maximize"}
              >
                {isRightPanelMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'source' ? (
                  <motion.div
                    key="source"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {activeCitation ? (
                      activeCitationData ? (
                        <>
                          {activeCitationData.type === 'table' && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2 text-xs text-storm-300 font-bold uppercase tracking-wider">
                                <FileBarChart size={14} /> {activeCitationData.title || "Source Data Table"}
                              </div>
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="border-b border-white/10 text-storm-100/60">
                                    {activeCitationData.headers?.map((h, i) => <th key={i} className="py-2">{h}</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  {activeCitationData.rows?.map((row, i) => (
                                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-storm-500/20' : ''}`}>
                                      {row.map((cell, j) => <td key={j} className={`py-2 ${j > 0 ? 'font-mono text-emerald-400' : ''}`}>{cell}</td>)}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {activeCitationData.type === 'image' && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2 text-xs text-storm-300 font-bold uppercase tracking-wider">
                                <FileImage size={14} /> {activeCitationData.title || "Referenced Image"}
                              </div>
                              <div className="w-full h-32 bg-storm-900 rounded border border-storm-500/30 flex items-center justify-center relative overflow-hidden">
                                {activeCitationData.imageUrl ? (
                                  <img src={activeCitationData.imageUrl} alt="Source" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-xs text-storm-100/40">Image Data Missing</div>
                                )}
                              </div>
                            </div>
                          )}
                          {activeCitationData.type === 'text' && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2 text-xs text-storm-300 font-bold uppercase tracking-wider">
                                <FileText size={14} /> {activeCitationData.title || "Extracted Source"}
                              </div>
                              <div className="text-sm text-white/80 leading-relaxed italic border-l-2 border-storm-500/50 pl-3">
                                "{activeCitationData.snippet}"
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Fallback to mock data for demo purposes if no dynamic data exists */}
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2 text-xs text-storm-300 font-bold uppercase tracking-wider">
                              <FileBarChart size={14} /> Source Data Table
                            </div>
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="border-b border-white/10 text-storm-100/60">
                                  <th className="py-2">Division</th>
                                  <th className="py-2">Q3 Revenue</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-white/5 bg-storm-500/20">
                                  <td className="py-2">Enterprise Cloud</td>
                                  <td className="py-2 font-mono text-emerald-400">$4.2M</td>
                                </tr>
                                <tr>
                                  <td className="py-2">Hardware</td>
                                  <td className="py-2 font-mono">$1.8M</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2 text-xs text-storm-300 font-bold uppercase tracking-wider">
                              <FileImage size={14} /> Referenced Image
                            </div>
                            <div className="w-full h-32 bg-storm-900 rounded border border-storm-500/30 flex items-center justify-center relative overflow-hidden">
                              {/* Mock architecture diagram layout */}
                              <div className="w-8 h-8 bg-storm-300 rounded-sm absolute top-4 left-4" />
                              <div className="w-8 h-8 bg-storm-300 rounded-sm absolute top-4 right-4" />
                              <div className="w-12 h-6 bg-emerald-400/80 rounded absolute bottom-4" />
                              <svg className="absolute w-full h-full opacity-30" viewBox="0 0 100 100">
                                <line x1="25" y1="25" x2="50" y2="75" stroke="#fff" strokeWidth="2" />
                                <line x1="75" y1="25" x2="50" y2="75" stroke="#fff" strokeWidth="2" />
                              </svg>
                            </div>
                          </div>
                        </>
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-storm-100/40 pt-20">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p>Click a citation chip in the chat<br />to view extracted multi-modal sources.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="graph"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex items-center justify-center relative"
                  >
                    {graphData && graphData.nodes?.length > 0 ? (
                      <>
                        {/* Scrolling Text overlay at the top */}
                        <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-40 mix-blend-screen z-0 py-2 border-b border-white/5 bg-black/20">
                          <div className="flex whitespace-nowrap" style={{ animation: 'slideRight 20s linear infinite' }}>
                            <style>
                              {`
                           @keyframes slideRight {
                             0% { transform: translateX(-50%); }
                             100% { transform: translateX(0); }
                           }
                           `}
                            </style>
                            <span className="text-xl font-bold tracking-[0.5em] text-storm-300 pr-10">KNOWLEDGE * GRAPH * ANALYSIS * </span>
                            <span className="text-xl font-bold tracking-[0.5em] text-storm-300 pr-10">KNOWLEDGE * GRAPH * ANALYSIS * </span>
                            <span className="text-xl font-bold tracking-[0.5em] text-storm-300 pr-10">KNOWLEDGE * GRAPH * ANALYSIS * </span>
                          </div>
                        </div>

                      {/* Dynamic Radial Knowledge Graph */}
                      {(() => {
                        const vbSize = isRightPanelMaximized ? 400 : 200;
                        const center = vbSize / 2;
                        const radius = isRightPanelMaximized ? 150 : 65;
                        const maxLen = isRightPanelMaximized ? 40 : 15;

                        return (
                          <svg className="w-full h-full relative z-10" viewBox={`0 0 ${vbSize} ${vbSize}`}>
                            <defs>
                              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#cf9eff" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#cf9eff" stopOpacity="0" />
                              </radialGradient>
                            </defs>

                            {/* 1. Edges (Bottom Layer) */}
                            {graphData.edges?.map((edge, i) => {
                              const srcIndex = graphData.nodes.findIndex(n => n.node_id === edge.source);
                              const tgtIndex = graphData.nodes.findIndex(n => n.node_id === edge.target);
                              const getPos = (idx) => {
                                if (idx === -1) return { x: center, y: center };
                                const angle = (idx / graphData.nodes.length) * 2 * Math.PI;
                                return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
                              };
                              const srcPos = getPos(srcIndex);
                              const tgtPos = getPos(tgtIndex);
                              
                              return (
                                <motion.line 
                                  key={`edge-${i}`}
                                  x1={srcPos.x} y1={srcPos.y} x2={tgtPos.x} y2={tgtPos.y} 
                                  stroke="#cf9eff" strokeWidth={isRightPanelMaximized ? "2" : "1.5"} strokeOpacity="0.5"
                                  initial={{ pathLength: 0, opacity: 0 }} 
                                  animate={{ pathLength: 1, opacity: 1 }} 
                                  transition={{ duration: 1.5, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                                />
                              );
                            })}

                            {/* 2. Nodes (Middle Layer) */}
                            {graphData.nodes?.map((node, i) => {
                              const angle = (i / graphData.nodes.length) * 2 * Math.PI;
                              const x = center + radius * Math.cos(angle);
                              const y = center + radius * Math.sin(angle);
                              const isCenter = i === 0;

                              return (
                                <motion.g 
                                  key={`node-circle-${i}`}
                                  initial={{ scale: 0 }} 
                                  animate={{ scale: 1 }} 
                                  transition={{ type: "spring", stiffness: 200, delay: 0.1 + (i * 0.1) }}
                                >
                                  <circle cx={x} cy={y} r={isCenter ? (isRightPanelMaximized ? "28" : "22") : (isRightPanelMaximized ? "20" : "18")} fill="url(#nodeGlow)" />
                                  <circle cx={x} cy={y} r={isCenter ? (isRightPanelMaximized ? "16" : "12") : (isRightPanelMaximized ? "10" : "8")} fill="#121c26" stroke={isCenter ? "#88BDF2" : "#cf9eff"} strokeWidth={isRightPanelMaximized ? "2" : "1.5"} />
                                </motion.g>
                              );
                            })}

                            {/* 3. Text (Top Layer) */}
                            {graphData.nodes?.map((node, i) => {
                              const angle = (i / graphData.nodes.length) * 2 * Math.PI;
                              const x = center + radius * Math.cos(angle);
                              const y = center + radius * Math.sin(angle);
                              const isCenter = i === 0;
                              const label = node.label || node.node_id || "";
                              const yOffset = isCenter ? (isRightPanelMaximized ? 24 : 18) : (isRightPanelMaximized ? 18 : 14);

                              return (
                                <motion.text 
                                  key={`node-text-${i}`}
                                  x={x} y={y + yOffset} 
                                  fontSize={isRightPanelMaximized ? "6" : "4"} 
                                  fill={isCenter ? "#88BDF2" : "#e2c8ff"} 
                                  textAnchor="middle" dy=".3em" fontWeight="600"
                                  initial={{ opacity: 0 }} 
                                  animate={{ opacity: 1 }} 
                                  transition={{ duration: 0.5, delay: 0.5 + (i * 0.1) }}
                                >
                                  {label.length > maxLen ? label.substring(0, maxLen) + '...' : label}
                                </motion.text>
                              );
                            })}
                          </svg>
                        );
                      })()}
                        <div className="absolute bottom-0 text-xs text-storm-100/50 text-center w-full pb-4 z-20">
                          Semantic relational mapping visualized dynamically.
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-storm-100/40">
                        <Network size={48} className="mb-4 opacity-50" />
                        <p>No knowledge graph generated for this answer.<br />Ask a question to begin analysis.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP WRAPPER ---
export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'dashboard'
  const [session, setSession] = useState(null);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-theme');
      document.documentElement.dataset.theme = 'light';
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.dataset.theme = 'dark';
    }
  }, [isLightMode]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && view === 'login') setView('dashboard');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        setView('dashboard');
      } else if (_event === 'SIGNED_OUT') {
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {view === 'landing' && <LandingPage setView={setView} isLightMode={isLightMode} setIsLightMode={setIsLightMode} />}
      {view === 'login' && <LoginPage setView={setView} isLightMode={isLightMode} setIsLightMode={setIsLightMode} />}
      {view === 'dashboard' && <DashboardWorkspace setView={setView} session={session} isLightMode={isLightMode} setIsLightMode={setIsLightMode} />}
    </div>
  );
}
