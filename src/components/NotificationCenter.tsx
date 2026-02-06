import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Calendar, MessageSquare, AlertTriangle, UserCheck } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { 
    getUserNotifications, 
    getUnreadNotificationCount, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useEvents();

  if (!user) return null;

  const notifications = getUserNotifications(user.id);
  const unreadCount = getUnreadNotificationCount(user.id);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'update':
        return <Bell className="h-5 w-5 text-indigo-500" />;
      case 'cancellation':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'feedback':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/90 hover:text-white transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead(user.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition ${
                        !notification.read ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => markNotificationRead(notification.id)}
                                className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4 text-gray-400" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            {notification.eventId && (
                              <Link
                                to={`/events/${notification.eventId}`}
                                onClick={() => {
                                  markNotificationRead(notification.id);
                                  setIsOpen(false);
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-700"
                              >
                                View Event →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
