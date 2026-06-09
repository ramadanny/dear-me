import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Edit2, Check, X, KeyRound, Save, Camera } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../services/firebase';

export default function Profile() {
  const { userData, currentUser, logout, isGuest, refreshUserData } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Initialize form when entering edit mode
  useEffect(() => {
    if (isEditing && userData) {
      setDisplayName(userData.displayName || userData.username || '');
      setAge(userData.age?.toString() || '');
      setHeight(userData.height?.toString() || '');
      setWeight(userData.weight?.toString() || '');
      setGender(userData.gender || '');
      setPhotoURL(userData.photoURL || '');
    }
  }, [isEditing, userData]);

  if (!currentUser || isGuest) {
    return <div className="p-8 text-center font-bold">Harap login terlebih dahulu!</div>;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to highly compressed JPEG to fit in Firestore safely
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPhotoURL(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setGlobalMessage(null);
    try {
      const updates: any = {};
      
      if (displayName.trim()) updates.displayName = displayName.trim();
      if (age) updates.age = parseInt(age, 10);
      if (height) updates.height = parseInt(height, 10);
      if (weight) updates.weight = parseInt(weight, 10);
      if (gender) updates.gender = gender;
      if (photoURL) updates.photoURL = photoURL;

      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, updates, { merge: true });
      
      await refreshUserData();
      setIsEditing(false);
      setGlobalMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      
      setTimeout(() => setGlobalMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setGlobalMessage({ type: 'error', text: 'Gagal memperbarui profil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      setGlobalMessage({ type: 'error', text: 'Harap isi kata sandi lama dan baru.' });
      return;
    }
    
    setLoading(true);
    setGlobalMessage(null);
    try {
      // Re-authenticate first to allow changing password
      if (currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        await updatePassword(currentUser, newPassword);
        setIsUpdatingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setGlobalMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
        
        setTimeout(() => setGlobalMessage(null), 3000);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setGlobalMessage({ type: 'error', text: 'Kata sandi lama salah.' });
      } else if (error.code === 'auth/weak-password') {
        setGlobalMessage({ type: 'error', text: 'Kata sandi baru terlalu lemah.' });
      } else {
        setGlobalMessage({ type: 'error', text: 'Gagal memperbarui kata sandi.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full text-center relative"
            >
              <h3 className="text-xl font-black mb-2">Yakin mau keluar?</h3>
              <p className="text-black/60 font-medium mb-6">Kamu harus login lagi nanti untuk masuk.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded-xl font-bold transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 py-2 bg-red-400 hover:bg-red-500 text-white border-2 border-black rounded-xl font-bold transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  Ya, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {globalMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 border-2 border-black rounded-xl font-bold text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${globalMessage.type === 'success' ? 'bg-green-300' : 'bg-red-300'}`}
        >
          {globalMessage.text}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-200 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-3xl font-black overflow-hidden group">
          {photoURL ? (
            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            userData?.displayName ? userData.displayName[0].toUpperCase() : (userData?.username ? userData.username[0].toUpperCase() : 'U')
          )}
          
          {isEditing && (
            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
        
        <div className="mt-12 mb-6 text-center">
          <h2 className="text-2xl font-black">{userData?.displayName || userData?.username || "Gak Punya Nama"}</h2>
          <p className="text-black/60 font-bold">@{userData?.username}</p>
          <p className="text-xs font-medium text-black/40 mt-1">{currentUser.email}</p>
        </div>

        <AnimatePresence mode="wait">
          {!isEditing && !isUpdatingPassword ? (
            <motion.div 
              key="view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-gray-50 border-2 border-black rounded-xl text-left p-4 space-y-3 mb-6 font-medium">
                <div className="flex justify-between border-b pb-2 border-black/10">
                  <span className="text-black/60">Umur</span>
                  <span className="font-bold">{userData?.age || '-'} Tahun</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-black/10">
                  <span className="text-black/60">Tinggi Badan</span>
                  <span className="font-bold">{userData?.height || '-'} cm</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-black/10">
                  <span className="text-black/60">Berat Badan</span>
                  <span className="font-bold">{userData?.weight || '-'} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60">Gender</span>
                  <span className="font-bold">{userData?.gender === 'L' ? 'Cowok' : (userData?.gender === 'P' ? 'Cewek' : '-')}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl py-3 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <Edit2 size={18} /> Edit Profil
                </button>
                <button 
                  onClick={() => setIsUpdatingPassword(true)}
                  className="flex-1 bg-purple-300 hover:bg-purple-400 border-2 border-black rounded-xl py-3 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <KeyRound size={18} /> Kata Sandi
                </button>
              </div>

              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-red-200 hover:bg-red-300 border-2 border-black rounded-xl py-3 text-red-900 font-bold flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                <LogOut size={18} /> Keluar Akun
              </button>
            </motion.div>
          ) : isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block font-bold mb-1 ml-1 text-sm">Nama Tampilan</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full border-2 border-black rounded-xl py-2 px-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-bold mb-1 ml-1 text-sm">Umur</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full border-2 border-black rounded-xl py-2 px-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-bold mb-1 ml-1 text-sm">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full border-2 border-black rounded-xl py-2 px-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Pilih</option>
                    <option value="L">Cowok</option>
                    <option value="P">Cewek</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-bold mb-1 ml-1 text-sm">TB (cm)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className="w-full border-2 border-black rounded-xl py-2 px-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-bold mb-1 ml-1 text-sm">BB (kg)</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full border-2 border-black rounded-xl py-2 px-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded-xl py-3 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50"
                >
                  <X size={18} /> Batal
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 bg-green-300 hover:bg-green-400 border-2 border-black rounded-xl py-3 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50"
                >
                  <Save size={18} /> Simpan
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block font-bold mb-1 ml-1 text-sm">Kata Sandi Lama</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full border-2 border-black rounded-xl py-2 px-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 ml-1 text-sm">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border-2 border-black rounded-xl py-2 px-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => {
                    setIsUpdatingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded-xl py-3 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50"
                >
                  <X size={18} /> Batal
                </button>
                <button 
                  onClick={handleSavePassword}
                  disabled={loading}
                  className="flex-1 bg-green-300 hover:bg-green-400 border-2 border-black rounded-xl py-3 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50"
                >
                  <Save size={18} /> Simpan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
