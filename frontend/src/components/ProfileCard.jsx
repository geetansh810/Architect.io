import { CalendarDays, Mail, MapPin, Layers, FolderKanban, Clock, Edit2, Crown } from 'lucide-react';

const PLAN_BADGES = {
  free: { label: 'Free Plan', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
  pro: { label: 'Pro Plan', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-lg shadow-amber-500/5' },
  team: { label: 'Team Plan', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-lg shadow-indigo-500/5' },
};

export function ProfileCard({ user, stats, onEdit }) {
  const plan = PLAN_BADGES[user?.plan || 'free'];
  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] overflow-hidden backdrop-blur-xl transition-colors duration-300">
      {/* Cover Header Accent */}
      <div className="h-32 bg-gradient-to-r from-indigo-950 via-purple-950 to-violet-950/60 relative" />

      {/* Card Content */}
      <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row gap-8 items-start -mt-14">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 border-4 border-[var(--bg-app)] flex items-center justify-center text-white text-3xl font-black shadow-2xl transition-colors duration-300">
            {initials}
          </div>
          {user?.role === 'Admin' && (
            <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1.5 rounded-xl shadow-lg border border-amber-400">
              <Crown size={14} fill="currentColor" />
            </div>
          )}
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 w-full mt-14 md:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
                {user?.fullName || user?.name || 'Anonymous User'}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${plan.color}`}>
                  {plan.label}
                </span>
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">@{user?.username || user?.email?.split('@')[0] || 'architect'}</p>
            </div>

            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-[var(--border-main)] rounded-xl text-[var(--text-main)] transition-all w-fit"
            >
              <Edit2 size={12} />
              Edit Profile
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--text-muted)] mb-8 pb-8 border-b border-[var(--border-main)]">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[var(--text-muted)] opacity-70 shrink-0" />
              <span className="text-[var(--text-main)]">{user?.email || 'No email associated'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-[var(--text-muted)] opacity-70 shrink-0" />
              <span className="text-[var(--text-main)]">{user?.location?.country || user?.location || 'Unknown Location'}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays size={16} className="text-[var(--text-muted)] opacity-70 shrink-0" />
              <span className="text-[var(--text-main)]">Joined {formatDate(user?.createdAt || user?.created_at)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-[var(--text-muted)] opacity-70 shrink-0" />
              <span className="text-[var(--text-main)]">Last active {formatRelativeTime(user?.lastActive || user?.updatedAt || user?.updated_at)}</span>
            </div>
          </div>

          {/* Stats Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Architecture Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[var(--bg-app)] border border-[var(--border-main)] p-4 rounded-2xl flex flex-col items-center text-center transition-colors duration-300">
                <FolderKanban size={20} className="text-indigo-500 mb-2" />
                <span className="text-xl font-bold text-[var(--text-main)] mb-0.5">{stats?.projectCount || 0}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Projects</span>
              </div>
              <div className="bg-[var(--bg-app)] border border-[var(--border-main)] p-4 rounded-2xl flex flex-col items-center text-center transition-colors duration-300">
                <Layers size={20} className="text-violet-500 mb-2" />
                <span className="text-xl font-bold text-[var(--text-main)] mb-0.5">{stats?.architectureCount || 0}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Designs</span>
              </div>
              <div className="bg-[var(--bg-app)] border border-[var(--border-main)] p-4 rounded-2xl flex flex-col items-center text-center transition-colors duration-300">
                <Layers size={20} className="text-emerald-500 mb-2" />
                <span className="text-xl font-bold text-[var(--text-main)] mb-0.5">{stats?.totalNodes || 0}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Total Nodes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatRelativeTime(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default ProfileCard;
