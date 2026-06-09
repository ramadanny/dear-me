import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Target, Box, Star, CheckCircle, ArrowRight, Heart, Puzzle, Users, Zap, BookHeart, CloudRain, Compass, Lightbulb, Calendar, TrendingUp, Bot, Smile, Palette, Layers, Map, ShoppingBag, Book, Sun, Moon } from 'lucide-react';
import { useRef } from 'react';

// Cute decorative floating shapes
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[5%] opacity-40 mix-blend-multiply"
      >
        <Sparkles size={48} className="text-pink-500" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[25%] right-[10%] opacity-40 mix-blend-multiply"
      >
        <Sun size={56} className="text-yellow-500" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[40%] left-[8%] opacity-40 mix-blend-multiply"
      >
        <Heart size={56} className="text-red-400" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[20%] right-[5%] opacity-40 mix-blend-multiply"
      >
        <Moon size={48} className="text-indigo-400" />
      </motion.div>
    </div>
  );
}

export default function Docs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative" ref={containerRef}>
      <FloatingShapes />
      
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="text-center mb-24 relative z-10"
      >
        <div className="mb-10 rounded-[2.5rem] overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white max-w-4xl mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <img 
            src="/cover.png" 
            alt="Dear Me Cover" 
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="inline-flex items-center justify-center space-x-2 bg-[#ffc3d9] border-2 border-black rounded-full px-5 py-2 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
          <Sparkles className="w-5 h-5 text-black" />
          <span className="text-sm font-black tracking-wide uppercase">Dokumentasi</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
          Dear Me <br/> 
          <span className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text drop-shadow-sm border-black">
            30 Days Self Growth Challenge
          </span>
        </h1>
        <p className="text-xl md:text-2xl font-bold text-black/70 max-w-3xl mx-auto leading-relaxed px-4">
          Media edukasi interaktif gemesin yang dirancang buat bantu kamu ngebangun habit sehat dan cintain diri sendiri pelan-pelan.
        </p>
      </motion.div>

      {/* MAIN CONTENT BENTO GRID */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* ROW 1: OVERVIEW & MASALAH */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Overview */}
          <motion.section 
            id="overview"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="md:col-span-3 bg-[#e8f4f8] border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all scroll-mt-32"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-sky-300 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-12">
                <BookHeart className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-3xl font-black">Cerita Kita</h3>
            </div>
            <p className="text-lg leading-relaxed text-black/80 font-bold">
              "Dear Me" itu lebih dari sekedar web. Ini adalah tempat aman buat para remaja yang lagi pusing cari jati diri. Lewat tantangan 30 hari yang fun, kita diajak bareng-bareng buat ngebangun self-awareness, peduli mental health, dan pastinya <span className="text-pink-600 bg-pink-100 px-2 py-0.5 rounded-lg border border-black">#SelfLove</span>.
            </p>
          </motion.section>

          {/* Latar Belakang / Masalah */}
          <motion.section 
            id="latar-belakang"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="md:col-span-2 bg-[#fff1cc] border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-center scroll-mt-32"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-amber-300 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-12">
                <Target className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-3xl font-black">Mengapa Kita Disini</h3>
            </div>
            <ul className="space-y-4 font-bold text-black/80">
              <li className="flex items-start gap-3">
                <CloudRain className="w-8 h-8 shrink-0 text-blue-500" />
                <span>Insecure merajalela karena standar sosmed yang nggak realistis.</span>
              </li>
              <li className="flex items-start gap-3">
                <Compass className="w-8 h-8 shrink-0 text-amber-600" />
                <span>Fase cari jati diri sering bikin mental health drop.</span>
              </li>
              <li className="flex items-start gap-3">
                <Lightbulb className="w-8 h-8 shrink-0 text-yellow-500" />
                <span>Butuh inovasi edukasi yang asik, bukan ceramah.!</span>
              </li>
            </ul>
          </motion.section>
        </div>

        {/* ROW 2: KONSEP GAMEPLAY (FULL WIDTH) */}
        <motion.section 
          id="konsep"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="bg-[#ffe4e6] border-4 border-black rounded-[2rem] p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all scroll-mt-32"
        >
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-pink-400 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Box className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-3xl font-black">Cara Mainnya</h3>
              </div>
              
              <ul className="space-y-6">
                <li className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 transition-transform hover:rotate-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-black text-white font-black flex items-center justify-center">1</span>
                    <strong className="text-xl flex items-center gap-2">Tantangan Harian <Calendar className="w-5 h-5 text-pink-500" /></strong>
                  </div>
                  <p className="font-bold text-black/70 ml-11">Buka 1 kartu misi per hari. Isinya aktivitas gampang kayak "Minum air 2 liter" atau "Tulis 3 hal yang lo syukuri hari ini".</p>
                </li>
                <li className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1 transition-transform hover:rotate-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-black text-white font-black flex items-center justify-center">2</span>
                    <strong className="text-xl flex items-center gap-2">Lacak Kemajuan <TrendingUp className="w-5 h-5 text-green-500" /></strong>
                  </div>
                  <p className="font-bold text-black/70 ml-11">Abis selesai, catat di board atau dashboard digital kita pake stiker/poin yang lucu-lucu.</p>
                </li>
                <li className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 transition-transform hover:rotate-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-black text-white font-black flex items-center justify-center">3</span>
                    <strong className="text-xl flex items-center gap-2">Kartu Refleksi <Sparkles className="w-5 h-5 text-amber-500" /></strong>
                  </div>
                  <p className="font-bold text-black/70 ml-11">Dapet surprise kartu spesial yang isinya cerita inspiratif, reminder buat sayang diri, dan booster motivasi.</p>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-pink-300 transform rotate-3 rounded-[2rem] border-4 border-black"></div>
              <img 
                src="/board-game.png" 
                alt="Dear Me Board Game Concept"
                className="relative z-10 w-full h-auto object-cover rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>
        </motion.section>

        {/* ROW 3: FITUR & KOMPONEN */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Fitur Utama */}
          <motion.section 
            id="fitur"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-[#e9d5ff] border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all scroll-mt-32"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-purple-400 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-3xl font-black">Superpowers</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4">
                <div className="mt-1"><Bot className="w-8 h-8 text-indigo-500" /></div>
                <div>
                  <h4 className="font-black text-xl">Sinkronisasi Otomatis Digital</h4>
                  <p className="text-black/70 font-bold mt-1">Scan QR, masuk dashboard web, track progress harian + cek body mass index (BMI) di mana aja.</p>
                </div>
              </div>
              <hr className="border-black/20" />
              <div className="flex gap-4">
                <div className="mt-1"><Smile className="w-8 h-8 text-pink-500" /></div>
                <div>
                  <h4 className="font-black text-xl">Suasana Bercerita</h4>
                  <p className="text-black/70 font-bold mt-1">Ditemenin karakter "Linda" yang sama relatenya sama kehidupan kita. Nggak kaku!</p>
                </div>
              </div>
              <hr className="border-black/20" />
              <div className="flex gap-4">
                <div className="mt-1"><Palette className="w-8 h-8 text-amber-500" /></div>
                <div>
                  <h4 className="font-black text-xl">Estetika & Ketenangan</h4>
                  <p className="text-black/70 font-bold mt-1">Warna pastel yang ramah mata bikin ngerjain habit tracking jadi lebih rileks dan fun.</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Komponen */}
          <motion.section 
            id="komponen"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-[#dcfce7] border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col scroll-mt-32"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-green-400 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Puzzle className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-3xl font-black">Isi Starter Kit</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-white border-4 border-black rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform">
                <Layers className="w-10 h-10 mb-3 text-pink-500" />
                <span className="font-black">80 Kartu Edukatif</span>
              </div>
              <div className="bg-white border-4 border-black rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform">
                <Map className="w-10 h-10 mb-3 text-emerald-500" />
                <span className="font-black">Permainan Papan</span>
              </div>
              <div className="bg-white border-4 border-black rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform">
                <ShoppingBag className="w-10 h-10 mb-3 text-orange-500" />
                <span className="font-black">Permainan Papan</span>
              </div>
              <div className="bg-white border-4 border-black rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform">
                <Book className="w-10 h-10 mb-3 text-blue-500" />
                <span className="font-black">Buku Panduan</span>
              </div>
            </div>
          </motion.section>
        </div>

      </div>

      {/* CALL TO ACTION */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex justify-center mt-20 pb-16 relative z-10"
      >
        <Link
          to="/login"
          className="group relative bg-[#c4b5fd] text-black font-black text-2xl py-6 px-12 border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 overflow-hidden"
        >
          <span className="relative z-10">Mulai Perjalananmu</span>
          <ArrowRight className="w-8 h-8 relative z-10 group-hover:translate-x-2 transition-transform" />
          
          <div className="absolute inset-0 w-[200%] h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
        </Link>
      </motion.div>
    </div>
  );
}
