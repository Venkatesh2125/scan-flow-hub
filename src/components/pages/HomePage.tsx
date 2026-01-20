// HPI 1.7-V
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Upload, Search, FileText, Zap, Shield, Clock, ArrowRight, Terminal, Cpu, Database, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

// --- Types & Interfaces ---
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

// --- Canonical Data Sources ---
// PRESERVED: Original features data
const CANONICAL_FEATURES: Feature[] = [
  {
    icon: FileText,
    title: 'Document Processing',
    description: 'Advanced OCR technology extracts text from scanned documents and images with precision'
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Real-time document analysis and text extraction powered by intelligent algorithms'
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Enterprise-grade security ensures your documents remain private and protected'
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find any document instantly with powerful filtering and search capabilities'
  }
];

// PRESERVED: Original stats data
const CANONICAL_STATS: Stat[] = [
  { value: '99.9%', label: 'OCR Accuracy Rate' },
  { value: '<2s', label: 'Average Processing Time' },
  { value: '50+', label: 'Supported File Formats' }
];

// --- Helper Components ---

const WireframeRoom = () => {
  // A purely decorative SVG component simulating a 3D perspective room
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background pointer-events-none select-none">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
          </pattern>
        </defs>
        
        {/* Perspective Lines - Creating the "Room" depth */}
        <g className="text-gray-300">
          {/* Back Wall */}
          <rect x="300" y="200" width="400" height="200" fill="none" stroke="currentColor" strokeWidth="1" />
          
          {/* Corner Rays */}
          <line x1="0" y1="0" x2="300" y2="200" stroke="currentColor" strokeWidth="1" />
          <line x1="1000" y1="0" x2="700" y2="200" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="600" x2="300" y2="400" stroke="currentColor" strokeWidth="1" />
          <line x1="1000" y1="600" x2="700" y2="400" stroke="currentColor" strokeWidth="1" />

          {/* Floor Grid (Perspective) */}
          {Array.from({ length: 8 }).map((_, i) => (
             <line key={`f-${i}`} x1={0 + (i * 140)} y1={600} x2={300 + (i * 57)} y2={400} stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          ))}
          
          {/* Ceiling Grid (Perspective) */}
          {Array.from({ length: 8 }).map((_, i) => (
             <line key={`c-${i}`} x1={0 + (i * 140)} y1={0} x2={300 + (i * 57)} y2={200} stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          ))}

          {/* Side Walls Grid */}
          {Array.from({ length: 5 }).map((_, i) => (
             <line key={`l-${i}`} x1={0} y1={100 + (i * 100)} x2={300} y2={200 + (i * 50)} stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          ))}
           {Array.from({ length: 5 }).map((_, i) => (
             <line key={`r-${i}`} x1={1000} y1={100 + (i * 100)} x2={700} y2={200 + (i * 50)} stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          ))}
        </g>
      </svg>
    </div>
  );
};

const FloatingBlock = ({ x, y, width, height, delay, depth = 1 }: { x: string; y: string; width: string; height: string; delay: number; depth?: number }) => {
  return (
    <motion.div
      className="absolute bg-primary/90 border border-primary shadow-lg backdrop-blur-sm"
      style={{ 
        left: x, 
        top: y, 
        width, 
        height,
        zIndex: 10 
      }}
      initial={{ opacity: 0, scale: 0, rotateX: 45, rotateY: 45 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: [0, -15, 0],
        rotateX: [45, 35, 45],
        rotateY: [45, 55, 45]
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 },
        rotateX: { duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
        rotateY: { duration: 6 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {/* Technical markings on the block */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/50" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/50" />
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-full h-[1px] bg-white" />
      </div>
    </motion.div>
  );
};

const SectionDivider = () => (
  <div className="w-full h-px bg-gray-200 flex items-center justify-center overflow-hidden">
    <div className="w-full max-w-[120rem] flex justify-between px-4">
      <span className="text-[10px] font-paragraph text-gray-400 tracking-widest uppercase">System.Partition</span>
      <span className="text-[10px] font-paragraph text-gray-400 tracking-widest uppercase">///</span>
    </div>
  </div>
);

const Marquee = ({ text, direction = 1 }: { text: string; direction?: number }) => {
  return (
    <div className="relative flex overflow-hidden py-4 bg-secondary text-secondary-foreground border-y border-gray-800">
      <motion.div
        className="flex whitespace-nowrap font-paragraph text-sm uppercase tracking-widest"
        animate={{ x: direction > 0 ? [0, -1000] : [-1000, 0] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="mx-8 flex items-center gap-4">
            {text} <span className="text-primary">///</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-textprimary font-paragraph selection:bg-primary selection:text-white overflow-clip">
      <Header />

      {/* --- HERO SECTION --- */}
      {/* Replicating the structural layout of the inspiration image: Visual Top, Content Bottom */}
      <section className="relative w-full flex flex-col border-b border-gray-200">
        
        {/* 1. The Visual "Room" (Top Part) */}
        <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden bg-background border-b border-gray-200">
          <WireframeRoom />
          
          {/* Floating Data Blocks - Parallax Elements */}
          <div className="absolute inset-0 perspective-[1000px] pointer-events-none">
            {mounted && (
              <>
                <FloatingBlock x="15%" y="25%" width="120px" height="60px" delay={0.2} />
                <FloatingBlock x="75%" y="15%" width="80px" height="80px" delay={0.4} />
                <FloatingBlock x="45%" y="45%" width="160px" height="40px" delay={0.6} />
                <FloatingBlock x="25%" y="65%" width="90px" height="90px" delay={0.8} />
                <FloatingBlock x="80%" y="55%" width="100px" height="50px" delay={1.0} />
                <FloatingBlock x="60%" y="20%" width="60px" height="60px" delay={1.2} />
              </>
            )}
          </div>

          {/* Overlay Grid Texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-multiply pointer-events-none" />
          
          {/* Hero Badge */}
          <div className="absolute top-8 left-8 md:left-16 z-20">
             <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 text-primary text-xs font-mono uppercase tracking-wider backdrop-blur-sm">
                <span className="w-2 h-2 bg-primary animate-pulse" />
                System Online
             </div>
          </div>
        </div>

        {/* 2. The Content Grid (Bottom Part) - Strictly following the 3-column layout from inspiration */}
        <div className="w-full max-w-[120rem] mx-auto bg-background z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 md:p-16 items-start">
            
            {/* Column 1: Headline */}
            <div className="md:col-span-5">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-heading text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight text-textprimary"
              >
                DOCUMENT<br/>
                INTELLIGENCE<br/>
                PLATFORM
              </motion.h1>
            </div>

            {/* Column 2: Description */}
            <div className="md:col-span-4 md:pt-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Transform scanned documents into searchable digital assets with advanced OCR technology and intelligent processing.
                </p>
                <div className="flex flex-col gap-2 text-sm text-gray-400 font-mono">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <span>Automated Extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <span>Semantic Analysis</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Column 3: CTA */}
            <div className="md:col-span-3 flex flex-col justify-end items-start md:items-end gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="w-full"
              >
                <Link to="/documents" className="group block w-full">
                  <Button 
                    size="lg" 
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-none text-lg font-mono flex items-center justify-between px-6 transition-all duration-300 group-hover:pl-8"
                  >
                    <span>{`{ Start_Engine }`}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="mt-2 flex justify-between text-xs text-gray-400 font-mono uppercase">
                  <span>v2.4.0 Stable</span>
                  <span>Ready</span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      <Marquee text="INTELLIGENT DOCUMENT PROCESSING // NEURAL NETWORKS ACTIVE // SECURE DATA PIPELINE //" />

      {/* --- FEATURES SECTION (Technical Grid) --- */}
      <section className="w-full bg-background py-24 md:py-32 border-b border-gray-200">
        <div className="max-w-[120rem] mx-auto px-8 md:px-16">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-gray-200 pb-8">
            <div className="max-w-2xl">
              <span className="text-primary font-mono text-sm tracking-widest uppercase mb-4 block">/// Core Capabilities</span>
              <h2 className="font-heading text-4xl md:text-6xl text-textprimary">
                SYSTEM MODULES
              </h2>
            </div>
            <div className="hidden md:block text-right font-mono text-xs text-gray-400">
              <p>MODULE_STATUS: ACTIVE</p>
              <p>ALL SYSTEMS NOMINAL</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-gray-200">
            {CANONICAL_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative border-r border-b border-gray-200 p-8 md:p-12 hover:bg-secondary hover:text-secondary-foreground transition-colors duration-500"
              >
                <div className="absolute top-4 right-4 text-xs font-mono opacity-30 group-hover:opacity-100 transition-opacity">
                  0{index + 1}
                </div>
                
                <div className="mb-8 inline-flex p-3 bg-gray-100 group-hover:bg-primary/20 rounded-none transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                
                <h3 className="font-heading text-xl md:text-2xl mb-4 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                
                <p className="font-paragraph text-sm md:text-base text-gray-500 group-hover:text-gray-300 leading-relaxed transition-colors">
                  {feature.description}
                </p>

                <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500 ease-out" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NARRATIVE EXTENSION: PROCESSING PIPELINE --- */}
      {/* New section visualizing the process, using canonical data context */}
      <section className="w-full bg-secondary text-secondary-foreground py-32 overflow-hidden">
        <div className="max-w-[120rem] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Content */}
            <div className="space-y-12">
              <div>
                <span className="text-primary font-mono text-sm tracking-widest uppercase mb-4 block">/// Architecture</span>
                <h2 className="font-heading text-4xl md:text-5xl mb-6">
                  NEURAL PROCESSING<br />PIPELINE
                </h2>
                <p className="text-gray-400 text-lg max-w-xl font-paragraph">
                  Our proprietary engine decomposes documents into semantic layers, analyzing structure, text, and metadata simultaneously.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  { title: 'Ingestion', desc: 'Multi-format raw data acceptance' },
                  { title: 'Analysis', desc: 'AI-driven layout and text recognition' },
                  { title: 'Extraction', desc: 'Structured data output generation' }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-start gap-6 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 border border-gray-700 flex items-center justify-center font-mono text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      0{i + 1}
                    </div>
                    <div>
                      <h4 className="font-heading text-xl mb-1">{step.title}</h4>
                      <p className="text-gray-500 text-sm font-mono">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Visual Representation */}
            <div className="relative h-[600px] w-full bg-gray-900/50 border border-gray-800 p-4">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
              
              {/* Abstract UI Representation using Image Component */}
              <div className="relative w-full h-full overflow-hidden border border-gray-700">
                 <Image 
                    src="https://static.wixstatic.com/media/bf8424_20aae2e84e004b2480cb347089755857~mv2.png?originWidth=960&originHeight=576"
                    alt="Processing Pipeline Visualization"
                    className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
                 />
                 
                 {/* Overlay UI Elements */}
                 <div className="absolute top-8 right-8 w-64 bg-black/80 backdrop-blur border border-primary/50 p-4 font-mono text-xs text-primary">
                    <div className="flex justify-between mb-2">
                        <span>STATUS</span>
                        <span className="animate-pulse">PROCESSING</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1 mb-2">
                        <motion.div 
                            className="h-full bg-primary"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <div className="space-y-1 text-gray-400">
                        <p>{`> Analyzing layout...`}</p>
                        <p>{`> Identifying entities...`}</p>
                        <p>{`> Exporting JSON...`}</p>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STATS SECTION (Dashboard Style) --- */}
      <section className="w-full bg-background py-24 border-b border-gray-200">
        <div className="max-w-[120rem] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
            {CANONICAL_STATS.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background p-12 flex flex-col items-center text-center group hover:bg-gray-50 transition-colors"
              >
                <div className="mb-6 p-4 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  {index === 0 && <Terminal className="w-8 h-8 text-primary" />}
                  {index === 1 && <Clock className="w-8 h-8 text-primary" />}
                  {index === 2 && <Database className="w-8 h-8 text-primary" />}
                </div>
                <div className="font-heading text-6xl md:text-7xl font-bold text-textprimary mb-4 tracking-tighter">
                  {stat.value}
                </div>
                <div className="font-mono text-sm text-gray-500 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION (Terminal Style) --- */}
      <section className="w-full bg-secondary py-32 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" width="100%" height="100%">
                <defs>
                    <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>
        </div>

        <div className="max-w-4xl mx-auto px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-gray-800 bg-black/50 backdrop-blur-xl p-12 md:p-20"
          >
            <div className="inline-block mb-8 px-4 py-1 border border-primary text-primary font-mono text-xs uppercase tracking-widest">
              System Ready
            </div>
            
            <h2 className="font-heading text-4xl md:text-6xl text-white mb-8 leading-tight">
              INITIALIZE<br/>TRANSFORMATION
            </h2>
            
            <p className="font-paragraph text-gray-400 text-lg mb-12 max-w-xl mx-auto">
              Deploy our intelligent OCR engine to your workflow. Secure, fast, and precise.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/documents">
                <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-mono text-base rounded-none border border-transparent hover:border-white/20 transition-all">
                  {`{ Upload_Files }`}
                </Button>
              </Link>
              <Link to="/documents">
                <Button variant="outline" className="h-14 px-8 border-gray-700 text-white hover:bg-white hover:text-black font-mono text-base rounded-none bg-transparent transition-all">
                  {`> View_Documentation`}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}