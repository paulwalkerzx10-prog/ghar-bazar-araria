import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { User, LogOut, MapPin, Phone, Mail, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useNavStore } from '../store/navStore.ts';

export default function Profile() {
  const { user, loading, login, logout, token, loginError } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', addresses: [] as string[] });
  const [error, setError] = useState('');
  const setHasUnsavedChanges = useNavStore(state => state.setHasUnsavedChanges);

  useEffect(() => {
    // Determine if form has changes
    if (editing && profile) {
      const hasChanges = 
        form.name !== (profile.name || '') ||
        form.phone !== (profile.phone || '') ||
        JSON.stringify(form.addresses) !== JSON.stringify(profile.addresses || []);
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [form, editing, profile, setHasUnsavedChanges]);

  useEffect(() => {
    if (token) {
      getDoc(doc(db, 'customers', user!.uid))
        .then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            const savedAddrs = Array.isArray(data.addresses) ? data.addresses : [];
            const addrs = savedAddrs.length > 0 ? savedAddrs : (data.address ? [data.address] : []);
            setForm({ 
              name: data.name || '', 
              phone: data.phone || '', 
              address: data.address || '',
              addresses: addrs
            });
          }
        })
        .catch(err => console.error(err));
    }
  }, [token]);

  const handleSave = async () => {
    setError('');
    if (form.phone && form.phone.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    
    // Ensure the default address is valid and exists in addresses if possible
    let finalAddress = form.address;
    const validAddresses = form.addresses.filter(a => a.trim() !== '');
    
    for (const addr of validAddresses) {
      if (addr.length < 10) {
        setError("Address is too short. Please provide a complete address (min 10 characters).");
        return;
      }
    }

    if (!validAddresses.includes(finalAddress) && validAddresses.length > 0) {
      finalAddress = validAddresses[0];
    } else if (validAddresses.length === 0) {
      finalAddress = '';
    }

    const payload = { ...form, address: finalAddress, addresses: validAddresses };
    
    try {
      await setDoc(doc(db, 'customers', user!.uid), payload, { merge: true });
      const docSnap = await getDoc(doc(db, 'customers', user!.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          addresses: Array.isArray(data.addresses) ? data.addresses : (data.address ? [data.address] : [])
        });
        setEditing(false);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setAsDefault = async (addr: string) => {
    if (editing) {
      setForm({ ...form, address: addr });
    } else {
      setForm({ ...form, address: addr });
      try {
        await updateDoc(doc(db, 'customers', user!.uid), { address: addr });
        setProfile({ ...profile, address: addr });
      } catch (err) {}
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Profile</h2>
          <p className="text-gray-500 mb-8 text-sm">Sign in with your Google account to manage your profile and orders.</p>
          
          {loginError && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 text-left">
              {loginError}
            </div>
          )}

          <button 
            onClick={login}
            className="w-full bg-green-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-green-700 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <button onClick={logout} className="text-gray-400 hover:text-gray-600 p-2 flex items-center text-sm font-medium">
          <LogOut size={16} className="mr-1" /> Logout
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center gap-4">
        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} alt="Avatar" className="w-16 h-16 rounded-full" />
        <div>
          <h2 className="font-bold text-gray-900">{user.displayName || profile?.name || 'User'}</h2>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Mail size={14} className="mr-1" /> {user.email}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">Delivery Details</h3>
          <button 
            onClick={() => {
              if (editing) handleSave();
              else setEditing(true);
            }} 
            className={editing ? "bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-red-700 transition-colors" : "text-green-600 text-sm font-bold"}
          >
            {editing ? 'Save Changes' : 'Edit'}
          </button>
        </div>
        {error && <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            {editing ? (
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            ) : (
              <p className="text-sm text-gray-900">{profile?.name || 'Not set'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center"><Phone size={14} className="mr-1"/> Phone Number</label>
            {editing ? (
              <input 
                type="tel" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                placeholder="10-digit mobile number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            ) : (
              <p className="text-sm text-gray-900">{profile?.phone || 'Not set'}</p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-medium text-gray-500 flex items-center"><MapPin size={14} className="mr-1"/> Saved Addresses</label>
              {editing && form.addresses.length < 3 && (
                <button 
                  onClick={() => setForm({ ...form, addresses: [...form.addresses, ''] })}
                  className="text-xs text-green-600 font-bold flex items-center hover:underline"
                >
                  <Plus size={12} className="mr-1"/> Add New
                </button>
              )}
            </div>
            
            {form.addresses.length === 0 && !editing ? (
              <p className="text-sm text-gray-900">Not set</p>
            ) : (
              <div className="space-y-3">
                {form.addresses.map((addr, index) => {
                  const isActive = addr === form.address && addr.trim() !== '';
                  return (
                    <div key={index} className={`flex items-start gap-2 p-3 rounded-xl border ${isActive ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                      <button 
                        onClick={() => addr.trim() !== '' && setAsDefault(addr)}
                        className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {isActive ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                      <div className="flex-1">
                        {editing ? (
                          <textarea 
                            value={addr} 
                            onChange={e => {
                              const newAddrs = [...form.addresses];
                              newAddrs[index] = e.target.value;
                              setForm({...form, addresses: newAddrs});
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 leading-relaxed cursor-pointer" onClick={() => setAsDefault(addr)}>
                            {addr || 'Empty address'}
                          </p>
                        )}
                      </div>
                      {editing && (
                        <button 
                          onClick={() => {
                            const newAddrs = form.addresses.filter((_, i) => i !== index);
                            setForm({...form, addresses: newAddrs});
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
