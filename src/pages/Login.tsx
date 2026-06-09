import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsGuest, currentUser, isGuest } = useAuth();
  const navigate = useNavigate();

  // Register Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'L'|'P'|''>('');

  useEffect(() => {
    if (currentUser) {
      if (isGuest) {
        navigate('/calculator');
      } else {
        navigate('/users/dashboard');
      }
    }
  }, [currentUser, isGuest, navigate]);

  if (currentUser) {
    return null;
  }

  const handleGuest = async () => {
    await loginAsGuest();
    navigate('/calculator');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Nama pengguna dan kata sandi wajib diisi');
      setLoading(false);
      return;
    }

    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@dearme.app`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/users/dashboard');
      } else {
        if (password !== confirmPassword) {
          setError('Password tidak cocok');
          setLoading(false);
          return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user doc
        await setDoc(doc(db, 'users', user.uid), {
          username,
          displayName: displayName || username,
          age: age ? Number(age) : 25,
          height: height ? Number(height) : 160,
          weight: weight ? Number(weight) : 55,
          gender: gender || 'L',
          submitTotal: 0,
          dateFirstLogin: Date.now(),
          dateLastLogin: Date.now()
        });

        navigate('/users/dashboard');
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Nama pengguna atau kata sandi salah');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Nama pengguna sudah digunakan');
      } else {
        setError(err.message || 'Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 py-8">
       <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-auto mb-4 p-1 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain [image-rendering:pixelated]" />
          </div>
          <h2 className="text-2xl font-black">{isLogin ? 'Selamat Datang Kembali!' : 'Daftar Yuk!'}</h2>
          <p className="text-black/60 font-medium">Dear Me: 30 Days Self Growth Challenge</p>
        </div>

        {error && (
          <div className="bg-red-200 border-2 border-red-900 text-red-900 px-4 py-2 rounded-xl mb-4 font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4 pt-2"
              >
                <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ease: "easeOut", duration: 0.5, delay: 0.1 }}>
                  <label className="block font-bold mb-1 text-sm">Display Name (Opsional)</label>
                  <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300" placeholder="Nama panggilan kamu" />
                </motion.div>
                <div className="flex gap-2">
                  <motion.div className="flex-1" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}>
                    <label className="block font-bold mb-1 text-sm">Umur</label>
                    <input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300" placeholder="25" />
                  </motion.div>
                  <motion.div className="flex-1" initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}>
                    <label className="block font-bold mb-1 text-sm">Tinggi (cm)</label>
                    <input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300" placeholder="160" />
                  </motion.div>
                </div>
                <div className="flex gap-2">
                  <motion.div className="flex-1" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}>
                     <label className="block font-bold mb-1 text-sm">Berat (kg)</label>
                     <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300" placeholder="55" />
                  </motion.div>
                  <motion.div className="flex-1" initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}>
                     <label className="block font-bold mb-1 text-sm">Gender</label>
                     <select value={gender} onChange={e=>setGender(e.target.value as any)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300 bg-white">
                       <option value="">Pilih</option>
                       <option value="L">Cowok</option>
                       <option value="P">Cewek</option>
                     </select>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}>
              <label className="block font-bold mb-1 text-sm">Nama Pengguna <span className="text-red-500">*</span></label>
              <input type="text" required value={username} onChange={e=>setUsername(e.target.value)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300" placeholder="Nama Kamu" />
            </motion.div>
  
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}>
              <label className="block font-bold mb-1 text-sm">Kata Sandi <span className="text-red-500">*</span></label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300" placeholder="Min. 6 karakter" />
            </motion.div>
  
            {!isLogin && (
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}>
                <label className="block font-bold mb-1 text-sm">Konfirmasi Kata Sandi <span className="text-red-500">*</span></label>
                <input type="password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full border-2 border-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-pink-300" placeholder="Min. 6 karakter" />
              </motion.div>
            )}
  
            <motion.button 
              initial={{ opacity: 0, y: 15 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            type="submit" 
            disabled={loading}
            className="w-full bg-pink-400 hover:bg-pink-500 text-black font-black text-lg py-3 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors mt-6 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Masuk' : 'Daftar')}
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm font-bold text-indigo-800 hover:underline"
          >
            {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-black/10 text-center">
          <p className="text-sm font-medium text-black/60 mb-3">Atau cuma mau coba-coba?</p>
          <button 
            onClick={handleGuest}
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm py-3 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors flex items-center justify-center gap-2"
          >
             Masuk sebagai Tamu
          </button>
        </div>
      </motion.div>
    </div>
  );
}
