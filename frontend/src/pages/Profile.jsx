import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import { Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', location: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api('/user/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.user);
          setStats(data.stats);
          setEditForm({
            fullName: data.user.fullName || data.user.name || '',
            location: data.user.location?.country || data.user.location || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
        // Sync with global auth state (e.g. navbar name)
        updateUser({
          name: data.user.fullName || data.user.name,
          location: data.user.location
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-[var(--bg-app)] flex flex-col items-center justify-center text-[var(--text-main)] transition-colors duration-300">
        <Loader2 className="animate-spin text-brand-500 w-10 h-10 mb-4" />
        <p className="text-sm text-[var(--text-muted)] font-semibold">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-app)] text-[var(--text-main)] px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[var(--text-main)] mb-2 tracking-tight">My Profile</h1>
          <p className="text-[var(--text-muted)] font-medium">View your architecture stats and manage your personal account settings.</p>
        </div>

        <ProfileCard
          user={profileData || user}
          stats={stats}
          onEdit={() => setIsEditing(true)}
        />

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] w-full max-w-md p-8 shadow-2xl z-10 overflow-hidden text-[var(--text-main)]"
              >
                <button
                  onClick={() => setIsEditing(false)}
                  className="absolute top-5 right-5 p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 rounded-xl transition-all"
                >
                  <X size={16} />
                </button>

                <h3 className="text-xl font-bold text-[var(--text-main)] mb-6">Edit Profile</h3>

                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Full Name</label>
                    <input
                      required
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-[var(--border-main)] rounded-xl text-[var(--text-main)] placeholder-gray-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Country Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g. United States"
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-[var(--border-main)] rounded-xl text-[var(--text-main)] placeholder-gray-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[var(--border-main)]">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-[var(--border-main)] rounded-xl text-[var(--text-main)] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Profile;
