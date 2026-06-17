import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, Trophy, Star } from 'lucide-react';
import api from '../../services/api';

const BadgeBoard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState({});

  useEffect(() => {
    // Load badges
    api.get('/gamification/badges')
      .then(res => {
        if (res.data.success) {
          setBadges(res.data.badges);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleClaimBadge = async (badgeId, badgeName) => {
    setClaiming({ ...claiming, [badgeId]: true });
    try {
      const res = await api.post('/gamification/badges/claim', { badgeId });
      if (res.data.success) {
        alert(`🎉 Chúc mừng em đã nhận thành công huy hiệu "${badgeName}"!`);
        refreshProfile();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đổi huy hiệu!');
    }
    setClaiming({ ...claiming, [badgeId]: false });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 font-bold">
      
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black font-comic">Cửa Hàng Huy Hiệu 🏆</h2>
        <p className="text-slate-500 font-bold text-sm">Sử dụng số xu em tích lũy được từ việc học để đổi lấy các huy hiệu lấp lánh nhé!</p>
      </div>

      {/* Badges Grid list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {badges.map(badge => {
          // Check if user owns this badge
          const isOwned = profile?.badges?.some(b => b.badge?._id === badge._id || b.badge === badge._id);
          const canAfford = profile?.coins >= badge.coinCost;
          const meetsXp = profile?.xp >= badge.xpRequired;

          return (
            <div 
              key={badge._id} 
              className={`card-playful p-6 flex flex-col justify-between items-center text-center gap-6 bg-white dark:bg-slate-800 ${
                isOwned ? 'border-forest-400 bg-forest-50/10' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl animate-pulse">{badge.icon || '🏅'}</span>
                <h3 className="text-xl font-black mt-2">{badge.name}</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-[200px]">{badge.description}</p>
              </div>

              {/* Requirement boxes */}
              <div className="flex flex-col gap-1 w-full text-xs font-semibold border-t pt-4 border-slate-50 dark:border-slate-700/50">
                {badge.xpRequired > 0 && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Yêu cầu XP:</span>
                    <span className={meetsXp ? 'text-forest-600' : 'text-coral-500'}>
                      {profile?.xp} / {badge.xpRequired} XP
                    </span>
                  </div>
                )}
                {badge.coinCost > 0 && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Giá đổi xu:</span>
                    <span className={canAfford ? 'text-amber-600' : 'text-coral-500'}>
                      {badge.coinCost} Xu
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isOwned ? (
                <span className="w-full py-3 bg-forest-100 text-forest-700 rounded-2xl text-sm font-black border border-forest-400">
                  Đã Sở Hữu 🎉
                </span>
              ) : (
                <button
                  onClick={() => handleClaimBadge(badge._id, badge.name)}
                  disabled={claiming[badge._id] || !canAfford || !meetsXp}
                  className={`w-full py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
                    canAfford && meetsXp
                      ? 'bg-sunny-500 hover:bg-sunny-600 text-white shadow-[0_4px_0_0_#d97706] hover:scale-102 active:translate-y-0.5 active:shadow-none'
                      : 'bg-slate-100 dark:bg-slate-750 text-slate-400 cursor-not-allowed border'
                  }`}
                >
                  <span>{claiming[badge._id] ? 'Đang đổi...' : 'Đổi Huy Hiệu'}</span>
                </button>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default BadgeBoard;
