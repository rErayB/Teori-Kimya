import React from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { AppNotification } from '../../types';
import { repository } from '../../services/storage';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNavigate: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    repository.markAllNotificationsRead();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mt-12 rounded-2xl bg-[#0B1B2E] border border-cyan-500/30 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh] text-slate-100 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#102A43]/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Bildirim Merkezi</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Tümünü okundu yap"
                className="p-1 rounded-lg text-cyan-300 hover:bg-slate-800 text-xs flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="text-[11px]">Okundu</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Henüz yeni bir bildirim yok.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.linkTab) {
                    onNavigate(notif.linkTab);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-[#102A43]/30 border-slate-800 text-slate-300'
                    : 'bg-[#163A5F]/50 border-cyan-500/30 text-white shadow-md shadow-cyan-950/20'
                } hover:border-cyan-400/50`}
              >
                <div className="flex items-start gap-2.5">
                  {getIcon(notif.type)}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-white truncate">{notif.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.date).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
