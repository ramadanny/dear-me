import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, getDocs, where, deleteDoc, doc } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Calendar, X, Info, Sparkles, Copy, Check, Share2, AlertTriangle, CheckCircle2, Skull, Frown, PartyPopper, Trash2, Calculator as CalcIcon, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import html2canvas from 'html2canvas';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { currentUser, isGuest } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser || isGuest) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "users", currentUser.uid, "bmi_data"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dateFormatted: new Date(doc.data().date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        })).sort((a: any, b: any) => a.date - b.date);
        setHistory(data);
      } catch (err) {
        console.error("Dashboard fetch err:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser, isGuest, navigate]);

  useEffect(() => {
    if (selectedHistory) {
      document.body.classList.add('has-active-popup');
    } else {
      document.body.classList.remove('has-active-popup');
    }
  }, [selectedHistory]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleCopy = async () => {
    if (!selectedHistory?.aiSuggestionText) return;
    try {
      await navigator.clipboard.writeText(selectedHistory.aiSuggestionText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShareWA = () => {
    if (!selectedHistory?.aiSuggestionText) return;
    const text = encodeURIComponent(`Cek saran AI buat kesehatan saya nih!\n\n${selectedHistory.aiSuggestionText}\n\nDibuat di Dear Me App`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareChartWA = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      const text = `Hai teman teman, ini adalah grafik IMT ku dari Dear Me App. Yuk pantau kesehatanmu juga bareng aku!\n\nDibuat di Dear Me App`;
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `DearMe-Chart-${new Date().getTime()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Grafik IMT Ku',
              text: text,
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
          const encodedText = encodeURIComponent(text);
          window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate sharing image', err);
    }
  };

  const handleDownloadChart = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2 // High resolution
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `DearMe-Chart-${new Date().getTime()}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Failed to download chart', err);
    }
  };

  const handleDeleteHistory = async () => {
    if (!selectedHistory || !currentUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "bmi_data", selectedHistory.id));
      setHistory(prev => prev.filter(h => h.id !== selectedHistory.id));
      setSelectedHistory(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete history", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getBMIStatus = (bmiStr: string) => {
    const bmi = parseFloat(bmiStr);
    if (bmi < 18.5) return { 
      label: 'Kurus Kering', 
      color: 'bg-yellow-300', 
      icon: Frown,
      textColor: 'text-yellow-900',
      message: 'Kamu perlu tambah asupan gizi nih. Jangan lupa ngemil yang sehat!'
    };
    if (bmi >= 18.5 && bmi <= 24.9) return { 
      label: 'Normal Ideal', 
      color: 'bg-green-300', 
      icon: PartyPopper,
      textColor: 'text-green-900',
      message: 'Pertahankan! Gaya hidupmu udah jagoan banget.'
    };
    if (bmi >= 25 && bmi <= 29.9) return { 
      label: 'Kelebihan BB', 
      color: 'bg-orange-300', 
      icon: AlertTriangle,
      textColor: 'text-orange-900',
      message: 'Mulai kurangi gorengan dan manis-manis ya. Yuk bisa yuk!'
    };
    return { 
      label: 'Obesitas', 
      color: 'bg-red-400', 
      icon: Skull,
      textColor: 'text-red-900',
      message: 'Warning! Ini udah bahaya. Segera konsultasi ke dokter atau ahli gizi ya.'
    };
  };

  const chartData = history.map(h => ({
    name: h.dateFormatted,
    IMT: parseFloat(h.imt)
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
          <LayoutDashboardIcon /> Dasbor Pertumbuhanmu
        </h1>
        <p className="text-black/60 font-medium">Pantau terus progres IMT harian kamu disini!</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8"
      >
        <h3 className="font-black text-xl mb-6">Grafik IMT</h3>
        {history.length > 0 ? (
          <>
            <div ref={chartRef} className="relative h-[300px] w-full bg-white p-2 border-2 border-transparent" style={{ minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="IMT" stroke="#c084fc" strokeWidth={4} dot={{ stroke: '#000', strokeWidth: 2, r: 4, fill: '#fff' }} />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontFamily: 'Inter', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: 'Inter', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '2px solid black', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-black/10">
              <button
                onClick={handleDownloadChart}
                className="flex-1 flex items-center justify-center gap-2 bg-pink-200 hover:bg-pink-300 border-2 border-black rounded-xl py-2 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors active:translate-y-1 active:shadow-none"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={handleShareChartWA}
                className="flex-1 flex items-center justify-center gap-2 bg-green-200 hover:bg-green-300 border-2 border-black rounded-xl py-2 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors active:translate-y-1 active:shadow-none"
              >
                <Share2 size={16} /> Bagikan Ke WA
              </button>
            </div>
          </>
        ) : (
           <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-black/20">
             <p className="text-black/50 font-bold">Belum ada data grafik nih. Cek IMT kamu di menu Calculator!</p>
           </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <h3 className="font-black text-xl mb-4">Riwayat Pengecekan</h3>
        <div className="grid gap-4">
          {history.length > 0 ? history.map((item) => (
             <motion.div 
               whileHover={{ scale: 1.01 }}
               key={item.id} 
               onClick={() => setSelectedHistory(item)}
               className="bg-purple-50 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-purple-100 transition-colors"
             >
               <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-2 font-bold text-black/70 text-sm">
                   <Calendar className="w-4 h-4" /> {item.dateFormatted}
                 </div>
                 <div className="font-black bg-white px-2 py-1 border-2 border-black rounded-md text-sm">
                   IMT: {item.imt}
                 </div>
               </div>
               <p className="text-sm font-medium line-clamp-2 mt-2 text-black/80">
                 {item.aiSuggestionText.replace(/[*#`_]/g, '')}
               </p>
             </motion.div>
          )) : (
             <div className="text-center py-6">
                <p className="text-black/50 font-medium">Masih kosong melompong.</p>
             </div>
          )}
        </div>
      </motion.div>
      
      {history.length === 0 && (
        <div className="mt-8 flex justify-center pb-8">
          <button onClick={() => navigate('/calculator')} className="bg-indigo-300 hover:bg-indigo-400 text-black font-bold py-3 px-8 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center gap-2 text-lg">
            <CalcIcon className="w-6 h-6" /> Mulai Kalkulasi IMT
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black rounded-3xl p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full max-h-[90vh] overflow-y-auto relative custom-scrollbar"
            >
              <button 
                onClick={() => {
                  setSelectedHistory(null);
                  setShowDeleteConfirm(false);
                }}
                className="absolute top-4 right-4 bg-red-400 hover:bg-red-500 text-black p-2 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none z-10"
              >
                <X size={20} />
              </button>

              <div className="text-center mt-2 mb-4">
                <h2 className="text-sm font-bold uppercase opacity-80 text-black">Data Tanggal</h2>
                <div className="text-xl font-black text-black">{selectedHistory.dateFormatted}</div>
              </div>

              <div className={`w-full ${getBMIStatus(selectedHistory.imt).color} border-4 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center relative`}>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border-4 border-black p-2 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {(() => {
                    const StatusIcon = getBMIStatus(selectedHistory.imt).icon;
                    return <StatusIcon className="w-6 h-6 text-black" />;
                  })()}
                </div>
                
                <h2 className="text-sm font-bold uppercase mt-2 opacity-80 text-black">Skor IMT Waktu Itu</h2>
                <div className="text-6xl font-black text-black my-2">{selectedHistory.imt}</div>
                
                <div className="bg-white/50 border-2 border-black rounded-xl p-3 mt-4">
                  <h3 className={`font-black text-xl ${getBMIStatus(selectedHistory.imt).textColor}`}>{getBMIStatus(selectedHistory.imt).label}</h3>
                  <p className="mt-2 font-medium text-black/80 text-sm leading-relaxed">
                    "{getBMIStatus(selectedHistory.imt).message}"
                  </p>
                </div>
              </div>

              <div className="bg-white/80 border-2 border-black rounded-xl p-3 mt-4 text-left space-y-2 text-sm select-text">
                <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">IMT:</span> <span className="font-bold text-black">{selectedHistory.imt}</span></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">St. Deviasi:</span> <span className="font-bold text-black">{selectedHistory.stDeviasi}</span></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">Z-Score:</span> <span className="font-bold text-black">{selectedHistory.zScore}</span></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">BB Normal Min:</span> <span className="font-bold text-black">{selectedHistory.bbNormalMin}</span></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">BB Normal Max:</span> <span className="font-bold text-black">{selectedHistory.bbNormalMax}</span></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span className="font-medium text-black/70">BMR:</span> <span className="font-bold text-black">{selectedHistory.bmr}</span></div>
                <div className="flex justify-between"><span className="font-medium text-black/70">TEE:</span> <span className="font-bold text-black">{selectedHistory.tee}</span></div>

                <div className="mt-4 pt-4 border-t-2 border-dashed border-indigo-200">
                  <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                    <Sparkles size={16} /> Saran AI Gemini
                  </h4>
                  <div className="text-black/80 text-sm leading-relaxed pr-2 markdown-body">
                    <Markdown>{selectedHistory.aiSuggestionText}</Markdown>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-black/10">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 flex items-center justify-center gap-1.5 font-bold py-2 rounded-lg transition-colors border-2 text-xs ${isCopied ? 'bg-green-100 hover:bg-green-200 text-green-900 border-green-300' : 'bg-gray-100 hover:bg-gray-200 text-black border-black/20'}`}
                  >
                    {isCopied ? <><Check size={14} /> Disalin</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button
                    onClick={handleShareWA}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 font-bold py-2 rounded-lg transition-colors border-2 border-green-300 text-xs"
                  >
                    <Share2 size={14} /> Bagikan Ke WA
                  </button>
                </div>

                {showDeleteConfirm ? (
                  <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 rounded-xl">
                    <p className="text-red-900 font-bold text-sm text-center mb-2">Hapus riwayat ini secara permanen?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold"
                        disabled={isDeleting}
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDeleteHistory}
                        className="flex-1 py-1.5 bg-red-500 text-white border-2 border-black rounded-lg text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-900 font-bold border-2 border-red-300 rounded-lg transition-colors text-xs"
                  >
                    <Trash2 size={14} /> Hapus Riwayat
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LayoutDashboardIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
