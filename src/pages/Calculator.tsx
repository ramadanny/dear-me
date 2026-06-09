import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Sparkles, Pizza, Dumbbell, Activity, Heart, RefreshCcw, Info, Share2, Copy, Check, Calendar, Ruler, Scale, Users, PartyPopper } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Calculator() {
  const { currentUser, userData, isGuest, refreshUserData } = useAuth();
  const resultCardRef = useRef<HTMLDivElement>(null);
  
  // Use existing data for initial state if present
  const [gender, setGender] = useState<'L' | 'P'>((userData?.gender as 'L' | 'P') || 'L');
  const [activity, setActivity] = useState<number>(1.2);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [age, setAge] = useState<number | string>(userData?.age || 25);
  const [height, setHeight] = useState<number | string>(userData?.height || 160);
  const [weight, setWeight] = useState<number | string>(userData?.weight || 55);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [bmiResult, setBmiResult] = useState<{
    bmi: string;
    label: string;
    message: string;
    color: string;
    textColor: string;
    icon: React.ElementType;
    details?: {
      imt: string;
      stDeviasi: string;
      zScore: string;
      bbNormalMin: string;
      bbNormalMax: string;
      bmr: string;
      tee: string;
    };
  } | null>(null);

  const calculateBMI = async () => {
    const numAge = Number(age);
    const numHeight = Number(height);
    const numWeight = Number(weight);

    if (!numHeight || !numWeight || !numAge) {
      alert("Isi dulu semua angkanya ya manis! 🥺");
      return;
    }

    const hMeters = numHeight / 100;
    const bmi = numWeight / (hMeters * hMeters);
    let result: any;

    const bmr = gender === 'L' 
      ? (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) + 5
      : (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) - 161;
    const tee = bmr * activity;
    const bbMin = 18.5 * (hMeters * hMeters);
    const bbMax = 24.9 * (hMeters * hMeters);
    const zScoreVal = (bmi - 22) / 3;

    const details = {
      imt: bmi.toFixed(2),
      stDeviasi: zScoreVal > 0 ? "+" + zScoreVal.toFixed(2) + " SD" : zScoreVal.toFixed(2) + " SD",
      zScore: zScoreVal.toFixed(2),
      bbNormalMin: bbMin.toFixed(1) + " kg",
      bbNormalMax: bbMax.toFixed(1) + " kg",
      bmr: Math.round(bmr).toLocaleString() + " kkal",
      tee: Math.round(tee).toLocaleString() + " kkal",
    };

    let extraMessage = "";
    if (numAge < 18) {
      extraMessage = " (Masih pertumbuhan nih, ini cuma estimasi ya!)";
    } else if (numAge >= 60) {
      extraMessage = " (Opa/Oma tetap aktif dan sehat ya!)";
    }

    if (bmi < 18.5) {
      result = {
        bmi: bmi.toFixed(1),
        label: "Kurus Kering",
        message: "Awas ketiup angin! Makan cilok banyakan dikit dong kak, biar ada isinya." + extraMessage,
        color: "bg-blue-300",
        textColor: "text-blue-900",
        icon: Wind,
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      result = {
        bmi: bmi.toFixed(1),
        label: "Ideal Mempesona",
        message: "Cakep! Body goals banget nih. Pertahankan ya cantik/ganteng!" + extraMessage,
        color: "bg-green-300",
        textColor: "text-green-900",
        icon: Sparkles,
      };
    } else if (bmi >= 25 && bmi < 30) {
      result = {
        bmi: bmi.toFixed(1),
        label: "Mode Mengembang",
        message: "Mulai mengembang kayak adonan donat. Kurangin seblaknya ya bund!" + extraMessage,
        color: "bg-yellow-300",
        textColor: "text-yellow-900",
        icon: Pizza,
      };
    } else {
      result = {
        bmi: bmi.toFixed(1),
        label: "Mode Beruang",
        message: "Waduh, udah siap hibernasi nih! Yuk rebahannya dikurangin, mulai jalan sehat." + extraMessage,
        color: "bg-red-400",
        textColor: "text-red-950",
        icon: Dumbbell,
      };
    }

    result.details = details;
    setBmiResult(result);
    await processWithCache(details, numAge, numHeight, numWeight, gender, activity);
  };

  const processWithCache = async (
    details: any,
    numAge: number,
    numHeight: number,
    numWeight: number,
    gender: 'L' | 'P',
    activity: number
  ) => {
    setIsAiLoading(true);
    setAiSuggestion(null);

    let previousHistoryContext = "";
    const isFirstTime = (userData?.submitTotal || 0) === 0;

    // 1. Check cache and get history if logged in
    if (currentUser && !isGuest) {
      try {
        const q = query(
          collection(db, "users", currentUser.uid, "bmi_data"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        // Find exact match for caching
        const matchedDoc = querySnapshot.docs.find(doc => {
          const d = doc.data();
          return d.age === numAge && d.height === numHeight && d.weight === numWeight && d.gender === gender && d.activity === activity;
        });
        
        if (matchedDoc) {
          // Cache hit!
          setAiSuggestion(matchedDoc.data().aiSuggestionText);
          setIsAiLoading(false);
          return;
        }

        // Get past history sorted by date descending manually since we didn't index date
        const historyDocs = querySnapshot.docs
          .map(d => d.data())
          .sort((a, b) => b.date - a.date)
          .slice(0, 2);

        if (historyDocs.length > 0 && !isFirstTime) {
          previousHistoryContext = `\nIni adalah riwayat pengecekan sebelumnya dari user (dari yang terbaru):\n`;
          historyDocs.forEach((h, idx) => {
            previousHistoryContext += `- Riwayat ${idx + 1}: Berat ${h.weight} kg, Tinggi ${h.height} cm, IMT: ${h.imt}\n`;
          });
        }
      } catch (err) {
        console.error("Cache read error:", err);
      }
    }

    // 2. Fetch AI if cache miss
    let aiResponseText = "";
    let activityLabel = "Rebahan Terus (1.2)";
    if (activity === 1.375) activityLabel = "Jarang (1.375)";
    else if (activity === 1.55) activityLabel = "Lumayan (1.55)";
    else if (activity === 1.725) activityLabel = "Sering (1.725)";
    else if (activity === 1.9) activityLabel = "Atlet (1.9)";

    const userName = isGuest ? "Bestie (Guest)" : (userData?.displayName || userData?.username || "Bestie");

    let promptIntro = "";
    if (isFirstTime || (!currentUser) || (isGuest && previousHistoryContext === "")) {
       promptIntro = `Wah halo ${userName}, ini pertama kali kamu ngecek IMT di website ini yaa!`;
    } else {
       promptIntro = `Halo kembali, ${userName}!`;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `${promptIntro}
Saya mengecek Indeks Massa Tubuh (IMT). Berikut data terbaru:
Umur: ${numAge} tahun
Tinggi Badan: ${numHeight} cm
Berat Badan: ${numWeight} kg
Gender: ${gender === 'L' ? 'Laki-laki' : 'Perempuan'}
Aktivitas: ${activityLabel}
---
Hasil:
IMT: ${details.imt}
BMR: ${details.bmr}
TEE (Total Pengeluaran Energi): ${details.tee}
${previousHistoryContext}

Berikan penjelasan yang ringkas namun informatif, tepat, dan sertakan komentar lucu menggemaskan dengan emoji.
Jika ada riwayat sebelumnya, tolong analisa apakah berat badannya naik/turun dan berikan motivasi atau pujian yang relevan.
Bahas juga mengenai kalori (BMR & TEE), gizi, dan saran gaya hidup sehat berdasarkan data terbaru. Gunakan bahasa Indonesia, sapa dengan nama "${userName}" dengan nada bersahabat layaknya bestie, tanpa pendahuluan bertele-tele.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
      });

      aiResponseText = response.text || "Pesan dari AI kosong nih, coba lagi ya!";
      setAiSuggestion(aiResponseText);
    } catch (err) {
      console.error(err);
      aiResponseText = "Maaf kak, gagal memuat saran dari AI. Cek koneksi internetmu ya!";
      setAiSuggestion(aiResponseText);
    } finally {
      setIsAiLoading(false);
    }

    // 3. Save to History if logged in and AI worked
    if (currentUser && !isGuest && !aiResponseText.includes("gagal memuat")) {
      try {
        await addDoc(collection(db, "users", currentUser.uid, "bmi_data"), {
          userId: currentUser.uid,
          date: Date.now(),
          age: numAge,
          height: numHeight,
          weight: numWeight,
          gender: gender,
          activity: activity,
          imt: details.imt,
          stDeviasi: details.stDeviasi,
          zScore: details.zScore,
          bbNormalMin: details.bbNormalMin,
          bbNormalMax: details.bbNormalMax,
          bmr: details.bmr,
          tee: details.tee,
          aiSuggestionText: aiResponseText
        });
        await refreshUserData();
      } catch (err) {
        console.error("Save history error:", err);
      }
    }
  };

  const stripMarkdownText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/^#+\s+/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[*_#`~]/g, '')
      .trim();
  };

  const generateSharingText = (isForWA: boolean) => {
    if (!bmiResult || !bmiResult.details) return "";
    const d = bmiResult.details;
    const pad = (str: string, len: number) => str + ' '.repeat(Math.max(0, len - str.length));

    let text = `Informasi Detail:\n`;
    text += `${pad("IMT", 14)}: ${d.imt}\n`;
    text += `${pad("St. Deviasi", 14)}: ${d.stDeviasi}\n`;
    text += `${pad("Z-Score", 14)}: ${d.zScore}\n`;
    text += `${pad("BB Normal Min", 14)}: ${d.bbNormalMin}\n`;
    text += `${pad("BB Normal Max", 14)}: ${d.bbNormalMax}\n`;
    text += `${pad("BMR", 14)}: ${d.bmr}\n`;
    text += `${pad("TEE", 14)}: ${d.tee}\n`;
    text += "------------------\n";
    text += `Saran AI Gemini:\n`;
    text += stripMarkdownText(aiSuggestion || "");

    if (isForWA) {
      return "```\n" + text + "\n```";
    }
    return text;
  };

  const handleShareWA = async () => {
    const textDesc = generateSharingText(false);
    if (!textDesc || !resultCardRef.current) return;
    
    // We only share the image and short intro text to WA since image captures the card
    const waText = `Hai teman teman, ini hasil cek IMT-ku! ${stripMarkdownText(aiSuggestion || "").slice(0, 100)}...\nYuk cek punyamu di Dear Me App!`;

    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `DearMe-IMT-${new Date().getTime()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Skor IMT Ku',
              text: waText,
              files: [file]
            });
          } catch (error) {
            console.error('Share failed', error);
          }
        } else {
          // Fallback if browser doesn't support file sharing
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = file.name;
          link.href = url;
          link.click();
          
          alert("Gambar disimpan! Buka WhatsApp untuk mengirim foto beserta teks ya.");
          const encodedText = encodeURIComponent(waText + "\n\n(Kirim foto yang juga baru saja didownload!)");
          window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate sharing image', err);
      // Extra fallback just text
      const url = `https://wa.me/?text=${encodeURIComponent(generateSharingText(true))}`;
      window.open(url, '_blank');
    }
  };

  const handleCopy = () => {
    const text = generateSharingText(false);
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const reset = () => {
    setBmiResult(null);
    setShowDetails(false);
    setAiSuggestion(null);
    setIsAiLoading(false);
    setAge(userData?.age || 25);
    setHeight(userData?.height || 160);
    setWeight(userData?.weight || 55);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 py-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="max-w-md w-full bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 text-pink-200 rotate-12 opacity-50 pointer-events-none">
          <Heart size={120} fill="currentColor" />
        </div>

        <div className="text-center mb-8 relative z-10">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-block bg-white p-2 border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4"
          >
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-cover rounded-2xl" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-black">Dear Me</h1>
          <p className="text-black/60 font-medium mt-2">30 Days Self Growth Challenge</p>
        </div>

        <div className="space-y-6 relative z-10 block">
          
          {/* Umur */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-purple-100 border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex justify-between items-center mb-4">
              <label className="font-bold text-lg text-black flex items-center gap-2">Umur <Calendar className="w-5 h-5 text-purple-600" /></label>
              <div className="flex items-baseline bg-white px-2 py-1 border-2 border-black rounded-xl focus-within:ring-2 focus-within:ring-purple-400">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="font-black text-2xl w-16 text-right outline-none bg-transparent"
                />
                <span className="text-sm text-gray-500 ml-1">thn</span>
              </div>
            </div>
            <input 
              type="range" 
              min="2" 
              max="120" 
              value={age === '' ? 25 : age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-4 bg-purple-300 border-2 border-black rounded-lg appearance-none cursor-pointer accent-black"
            />
          </motion.div>

          {/* Tinggi Badan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-orange-100 border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex justify-between items-center mb-4">
              <label className="font-bold text-lg text-black flex items-center gap-2">Tinggi Badan <Ruler className="w-5 h-5 text-orange-600" /></label>
              <div className="flex items-baseline bg-white px-2 py-1 border-2 border-black rounded-xl focus-within:ring-2 focus-within:ring-orange-400">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="font-black text-2xl w-16 text-right outline-none bg-transparent"
                />
                <span className="text-sm text-gray-500 ml-1">cm</span>
              </div>
            </div>
            <input 
              type="range" 
              min="100" 
              max="220" 
              value={height === '' ? 160 : height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-4 bg-orange-300 border-2 border-black rounded-lg appearance-none cursor-pointer accent-black"
            />
          </motion.div>

          {/* Berat Badan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-blue-100 border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex justify-between items-center mb-4">
              <label className="font-bold text-lg text-black flex items-center gap-2">Berat Badan <Scale className="w-5 h-5 text-blue-600" /></label>
              <div className="flex items-baseline bg-white px-2 py-1 border-2 border-black rounded-xl focus-within:ring-2 focus-within:ring-blue-400">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="font-black text-2xl w-16 text-right outline-none bg-transparent"
                />
                <span className="text-sm text-gray-500 ml-1">kg</span>
              </div>
            </div>
            <input 
              type="range" 
              min="30" 
              max="150" 
              value={weight === '' ? 55 : weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-4 bg-blue-300 border-2 border-black rounded-lg appearance-none cursor-pointer accent-black"
            />
          </motion.div>

          {/* Gender */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-green-100 border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center relative z-10"
          >
            <label className="font-bold text-lg text-black flex items-center gap-2">Gender <Users className="w-5 h-5 text-green-600" /></label>
            <div className="flex gap-2">
              <button 
                onClick={() => setGender('L')}
                className={`py-1 px-3 text-sm font-bold border-2 border-black rounded-lg transition-colors ${gender === 'L' ? 'bg-green-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}>Cowok</button>
              <button 
                onClick={() => setGender('P')}
                className={`py-1 px-3 text-sm font-bold border-2 border-black rounded-lg transition-colors ${gender === 'P' ? 'bg-pink-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}>Cewek</button>
            </div>
          </motion.div>
          
          {/* Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-100 border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center relative z-10"
          >
             <label className="font-bold text-lg text-black mr-2 flex items-center gap-2">Aktivitas <Activity className="w-5 h-5 text-yellow-600" /></label>
             <select 
               value={activity} 
               onChange={(e) => setActivity(Number(e.target.value))}
               className="bg-white px-2 py-1 border-2 border-black rounded-lg text-sm font-bold max-w-[150px] outline-none cursor-pointer"
             >
               <option value="1.2">Rebahan Terus (1.2)</option>
               <option value="1.375">Jarang (1.375)</option>
               <option value="1.55">Lumayan (1.55)</option>
               <option value="1.725">Sering (1.725)</option>
               <option value="1.9">Atlet (1.9)</option>
             </select>
          </motion.div>

          {/* Action Button */}
          <AnimatePresence mode="wait">
            {!bmiResult ? (
              <motion.button
                key="calc-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95, y: 2 }}
                onClick={calculateBMI}
                className="w-full bg-pink-400 hover:bg-pink-500 text-black font-black text-xl py-4 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors flex items-center justify-center gap-2"
              >
                Cek Sekarang! <PartyPopper className="w-6 h-6" />
              </motion.button>
            ) : (
              <motion.div
                key="result-card"
                ref={resultCardRef}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`w-full ${bmiResult.color} border-4 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center relative`}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border-4 border-black p-2 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <bmiResult.icon className="w-6 h-6 text-black" />
                </div>
                
                <h2 className="text-sm font-bold uppercase mt-2 opacity-80 text-black">Skor IMT Kamu</h2>
                <div className="text-6xl font-black text-black my-2">{bmiResult.bmi}</div>
                
                <div className="bg-white/50 border-2 border-black rounded-xl p-3 mt-4">
                  <h3 className={`font-black text-xl ${bmiResult.textColor}`}>{bmiResult.label}</h3>
                  <p className="mt-2 font-medium text-black/80 text-sm leading-relaxed">
                    "{bmiResult.message}"
                  </p>
                </div>

                <AnimatePresence>
                  {showDetails && bmiResult.details && (
                    <motion.div 
                      key="details-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="bg-white/80 border-2 border-black rounded-xl p-3 mt-4 text-left space-y-2 text-sm select-text overflow-hidden"
                    >
                      <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">IMT:</span> <span className="font-bold text-black">{bmiResult.details.imt}</span></div>
                      <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">St. Deviasi:</span> <span className="font-bold text-black">{bmiResult.details.stDeviasi}</span></div>
                      <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">Z-Score:</span> <span className="font-bold text-black">{bmiResult.details.zScore}</span></div>
                      <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">BB Normal Min:</span> <span className="font-bold text-black">{bmiResult.details.bbNormalMin}</span></div>
                      <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">BB Normal Max:</span> <span className="font-bold text-black">{bmiResult.details.bbNormalMax}</span></div>
                      <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">BMR:</span> <span className="font-bold text-black">{bmiResult.details.bmr}</span></div>
                      <div className="flex justify-between"><span className="font-medium text-black/70">TEE:</span> <span className="font-bold text-black">{bmiResult.details.tee}</span></div>

                      <div className="mt-4 pt-4 border-t-2 border-dashed border-indigo-200">
                         <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                           <Sparkles size={16} /> Saran AI Gemini
                         </h4>
                         {isAiLoading ? (
                           <div className="flex justify-center items-center py-6">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                           </div>
                         ) : aiSuggestion ? (
                           <div className="text-black/80 text-sm leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar markdown-body">
                             <Markdown>{aiSuggestion}</Markdown>
                           </div>
                         ) : null}
                      </div>

                      {!isAiLoading && aiSuggestion && (
                        <div className="flex gap-2 mt-4 pt-3 border-t border-black/10">
                          <button
                            onClick={handleCopy}
                            className={`flex-1 flex items-center justify-center gap-1.5 font-bold py-2 rounded-lg transition-colors border-2 text-xs ${isCopied ? 'bg-green-100 hover:bg-green-200 text-green-900 border-green-300' : 'bg-gray-100 hover:bg-gray-200 text-black border-black/20'}`}
                          >
                            {isCopied ? <><Check size={14} /> Disalin</> : <><Copy size={14} /> Salin</>}
                          </button>
                          <button
                            onClick={handleShareWA}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 font-bold py-2 rounded-lg transition-colors border-2 border-green-300 text-xs"
                          >
                            <Share2 size={14} /> Bagikan Ke WA
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-4 flex items-center justify-center gap-2 w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold py-3 border-4 border-black rounded-xl transition-colors"
                >
                  <Info size={18} /> {showDetails ? "Tutup Info Detail" : "Informasi Detail"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="mt-3 flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100 text-black font-bold py-3 border-4 border-black rounded-xl transition-colors"
                >
                  <RefreshCcw size={18} /> Coba Lagi Dong
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
