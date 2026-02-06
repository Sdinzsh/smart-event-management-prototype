import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Event, Registration, Feedback, Notification } from '../types';

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  feedbacks: Feedback[];
  notifications: Notification[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, userId: string, userName: string, userEmail: string) => boolean;
  unregisterFromEvent: (eventId: string, userId: string) => void;
  getEventRegistrations: (eventId: string) => Registration[];
  getUserRegistrations: (userId: string) => Registration[];
  isUserRegistered: (eventId: string, userId: string) => boolean;
  markAttendance: (registrationId: string, attended: boolean) => void;
  markAttendanceByQR: (qrCode: string) => { success: boolean; message: string; registration?: Registration };
  getEventById: (id: string) => Event | undefined;
  getRegistrationByQR: (qrCode: string) => Registration | undefined;
  // Feedback
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
  getEventFeedbacks: (eventId: string) => Feedback[];
  getUserFeedbackForEvent: (eventId: string, userId: string) => Feedback | undefined;
  getEventAverageRating: (eventId: string) => number;
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  getUserNotifications: (userId: string) => Notification[];
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  getUnreadNotificationCount: (userId: string) => number;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Tech Symposium 2024',
    description: 'Join us for the biggest tech event of the year featuring keynote speakers, workshops, and networking opportunities. Learn about the latest trends in AI, blockchain, and cloud computing.',
    date: '2024-12-20',
    time: '09:00',
    endTime: '17:00',
    venue: 'Main Auditorium, Building A',
    category: 'technical',
    capacity: 500,
    organizerId: 'org1',
    organizerName: 'Tech Club',
    organizerEmail: 'tech@campus.edu',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Cultural Fest - Harmony 2024',
    description: 'Experience the vibrant cultural diversity of our campus. Music, dance, art exhibitions, and food stalls from around the world.',
    date: '2024-12-25',
    time: '10:00',
    endTime: '22:00',
    venue: 'Campus Ground',
    category: 'cultural',
    capacity: 2000,
    organizerId: 'org2',
    organizerName: 'Cultural Committee',
    organizerEmail: 'cultural@campus.edu',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Machine Learning Workshop',
    description: 'Hands-on workshop on machine learning fundamentals. Learn to build your first ML model using Python and scikit-learn.',
    date: '2024-12-18',
    time: '14:00',
    endTime: '18:00',
    venue: 'Computer Lab 301',
    category: 'workshop',
    capacity: 50,
    organizerId: 'org1',
    organizerName: 'AI Club',
    organizerEmail: 'ai@campus.edu',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Inter-College Basketball Tournament',
    description: 'Annual basketball championship featuring teams from 16 colleges. Come support your team!',
    date: '2024-12-22',
    time: '08:00',
    endTime: '20:00',
    venue: 'Sports Complex',
    category: 'sports',
    capacity: 1000,
    organizerId: 'org3',
    organizerName: 'Sports Committee',
    organizerEmail: 'sports@campus.edu',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  }
];

const generateQRCode = (eventId: string, registrationId: string): string => {
  return `SCE-${eventId}-${registrationId}-${Date.now()}`;
};

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    const storedRegistrations = localStorage.getItem('registrations');
    const storedFeedbacks = localStorage.getItem('feedbacks');
    const storedNotifications = localStorage.getItem('notifications');
    
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      setEvents(sampleEvents);
      localStorage.setItem('events', JSON.stringify(sampleEvents));
    }
    
    if (storedRegistrations) {
      setRegistrations(JSON.parse(storedRegistrations));
    }
    
    if (storedFeedbacks) {
      setFeedbacks(JSON.parse(storedFeedbacks));
    }
    
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  // Use functional updates to avoid stale closures
  const saveEvents = useCallback((updater: Event[] | ((prev: Event[]) => Event[])) => {
    setEvents(prev => {
      const newEvents = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('events', JSON.stringify(newEvents));
      return newEvents;
    });
  }, []);

  const saveRegistrations = useCallback((updater: Registration[] | ((prev: Registration[]) => Registration[])) => {
    setRegistrations(prev => {
      const newRegistrations = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('registrations', JSON.stringify(newRegistrations));
      return newRegistrations;
    });
  }, []);

  const saveFeedbacks = useCallback((updater: Feedback[] | ((prev: Feedback[]) => Feedback[])) => {
    setFeedbacks(prev => {
      const newFeedbacks = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('feedbacks', JSON.stringify(newFeedbacks));
      return newFeedbacks;
    });
  }, []);

  const saveNotifications = useCallback((updater: Notification[] | ((prev: Notification[]) => Notification[])) => {
    setNotifications(prev => {
      const newNotifications = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      return newNotifications;
    });
  }, []);

  const addEvent = useCallback((event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    saveEvents(prev => [...prev, newEvent]);
  }, [saveEvents]);

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents(currentEvents => {
      const event = currentEvents.find(e => e.id === id);
      const newEvents = currentEvents.map(e => e.id === id ? { ...e, ...updates } : e);
      localStorage.setItem('events', JSON.stringify(newEvents));
      
      // Notify registered users about the update
      if (event) {
        setRegistrations(currentRegs => {
          const eventRegs = currentRegs.filter(r => r.eventId === id);
          if (eventRegs.length > 0) {
            const newNotifications = eventRegs.map(reg => ({
              id: crypto.randomUUID(),
              userId: reg.userId,
              type: (updates.status === 'cancelled' ? 'cancellation' : 'update') as 'cancellation' | 'update',
              title: updates.status === 'cancelled' ? 'Event Cancelled' : 'Event Updated',
              message: updates.status === 'cancelled' 
                ? `The event "${event.title}" has been cancelled.`
                : `The event "${event.title}" has been updated. Please check the new details.`,
              eventId: id,
              read: false,
              createdAt: new Date().toISOString()
            }));
            saveNotifications(prev => [...prev, ...newNotifications]);
          }
          return currentRegs;
        });
      }
      
      return newEvents;
    });
  }, [saveNotifications]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(currentEvents => {
      const event = currentEvents.find(e => e.id === id);
      
      if (event) {
        setRegistrations(currentRegs => {
          const eventRegs = currentRegs.filter(r => r.eventId === id);
          if (eventRegs.length > 0) {
            const newNotifications = eventRegs.map(reg => ({
              id: crypto.randomUUID(),
              userId: reg.userId,
              type: 'cancellation' as const,
              title: 'Event Deleted',
              message: `The event "${event.title}" has been deleted.`,
              eventId: id,
              read: false,
              createdAt: new Date().toISOString()
            }));
            saveNotifications(prev => [...prev, ...newNotifications]);
          }
          
          const newRegs = currentRegs.filter(r => r.eventId !== id);
          localStorage.setItem('registrations', JSON.stringify(newRegs));
          return newRegs;
        });
        
        saveFeedbacks(prev => prev.filter(f => f.eventId !== id));
      }
      
      const newEvents = currentEvents.filter(e => e.id !== id);
      localStorage.setItem('events', JSON.stringify(newEvents));
      return newEvents;
    });
  }, [saveNotifications, saveFeedbacks]);

  const registerForEvent = useCallback((eventId: string, userId: string, userName: string, userEmail: string): boolean => {
    let success = false;
    
    setEvents(currentEvents => {
      const event = currentEvents.find(e => e.id === eventId);
      
      setRegistrations(currentRegs => {
        const currentRegistrations = currentRegs.filter(r => r.eventId === eventId);
        
        if (!event || currentRegistrations.length >= event.capacity) {
          success = false;
          return currentRegs;
        }
        
        if (currentRegs.some(r => r.eventId === eventId && r.userId === userId)) {
          success = false;
          return currentRegs;
        }
        
        const registrationId = crypto.randomUUID();
        const qrCode = generateQRCode(eventId, registrationId);
        
        const newRegistration: Registration = {
          id: registrationId,
          eventId,
          userId,
          userName,
          userEmail,
          registeredAt: new Date().toISOString(),
          attended: false,
          qrCode
        };
        
        // Add notification for registration confirmation
        const notification: Notification = {
          id: crypto.randomUUID(),
          userId,
          type: 'registration',
          title: 'Registration Confirmed',
          message: `You have successfully registered for "${event.title}". Your QR code for attendance is ready.`,
          eventId,
          read: false,
          createdAt: new Date().toISOString()
        };
        saveNotifications(prev => [...prev, notification]);
        
        const newRegs = [...currentRegs, newRegistration];
        localStorage.setItem('registrations', JSON.stringify(newRegs));
        success = true;
        return newRegs;
      });
      
      return currentEvents;
    });
    
    return success;
  }, [saveNotifications]);

  const unregisterFromEvent = useCallback((eventId: string, userId: string) => {
    setEvents(currentEvents => {
      const event = currentEvents.find(e => e.id === eventId);
      
      saveRegistrations(prev => prev.filter(r => !(r.eventId === eventId && r.userId === userId)));
      
      if (event) {
        const notification: Notification = {
          id: crypto.randomUUID(),
          userId,
          type: 'update',
          title: 'Registration Cancelled',
          message: `Your registration for "${event.title}" has been cancelled.`,
          eventId,
          read: false,
          createdAt: new Date().toISOString()
        };
        saveNotifications(prev => [...prev, notification]);
      }
      
      return currentEvents;
    });
  }, [saveRegistrations, saveNotifications]);

  const getEventRegistrations = useCallback((eventId: string) => {
    return registrations.filter(r => r.eventId === eventId);
  }, [registrations]);

  const getUserRegistrations = useCallback((userId: string) => {
    return registrations.filter(r => r.userId === userId);
  }, [registrations]);

  const isUserRegistered = useCallback((eventId: string, userId: string) => {
    return registrations.some(r => r.eventId === eventId && r.userId === userId);
  }, [registrations]);

  const markAttendance = useCallback((registrationId: string, attended: boolean) => {
    saveRegistrations(prev => prev.map(r => 
      r.id === registrationId ? { ...r, attended, attendedAt: attended ? new Date().toISOString() : undefined } : r
    ));
  }, [saveRegistrations]);

  const markAttendanceByQR = useCallback((qrCode: string): { success: boolean; message: string; registration?: Registration } => {
    let result: { success: boolean; message: string; registration?: Registration } = { 
      success: false, 
      message: 'Processing...' 
    };
    
    setRegistrations(currentRegs => {
      const registration = currentRegs.find(r => r.qrCode === qrCode);
      
      if (!registration) {
        result = { success: false, message: 'Invalid QR code. Registration not found.' };
        return currentRegs;
      }
      
      if (registration.attended) {
        result = { success: false, message: 'Attendance already marked for this registration.', registration };
        return currentRegs;
      }
      
      setEvents(currentEvents => {
        const event = currentEvents.find(e => e.id === registration.eventId);
        if (!event) {
          result = { success: false, message: 'Event not found.' };
          return currentEvents;
        }
        
        // Notify user about attendance
        const notification: Notification = {
          id: crypto.randomUUID(),
          userId: registration.userId,
          type: 'update',
          title: 'Attendance Marked',
          message: `Your attendance for "${event.title}" has been recorded.`,
          eventId: event.id,
          read: false,
          createdAt: new Date().toISOString()
        };
        saveNotifications(prev => [...prev, notification]);
        
        const updatedRegistration = { ...registration, attended: true, attendedAt: new Date().toISOString() };
        result = { success: true, message: `Attendance marked for ${registration.userName}`, registration: updatedRegistration };
        
        return currentEvents;
      });
      
      if (result.success) {
        const newRegs = currentRegs.map(r => 
          r.id === registration.id ? { ...r, attended: true, attendedAt: new Date().toISOString() } : r
        );
        localStorage.setItem('registrations', JSON.stringify(newRegs));
        return newRegs;
      }
      
      return currentRegs;
    });
    
    return result;
  }, [saveNotifications]);

  const getEventById = useCallback((id: string) => {
    return events.find(e => e.id === id);
  }, [events]);

  const getRegistrationByQR = useCallback((qrCode: string) => {
    return registrations.find(r => r.qrCode === qrCode);
  }, [registrations]);

  // Feedback functions
  const addFeedback = useCallback((feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    saveFeedbacks(prev => [...prev, newFeedback]);
    
    // Notify organizer about feedback
    setEvents(currentEvents => {
      const event = currentEvents.find(e => e.id === feedback.eventId);
      if (event) {
        const notification: Notification = {
          id: crypto.randomUUID(),
          userId: event.organizerId,
          type: 'feedback',
          title: 'New Feedback Received',
          message: `${feedback.userName} left a ${feedback.rating}-star review for "${event.title}".`,
          eventId: event.id,
          read: false,
          createdAt: new Date().toISOString()
        };
        saveNotifications(prev => [...prev, notification]);
      }
      return currentEvents;
    });
  }, [saveFeedbacks, saveNotifications]);

  const getEventFeedbacks = useCallback((eventId: string) => {
    return feedbacks.filter(f => f.eventId === eventId);
  }, [feedbacks]);

  const getUserFeedbackForEvent = useCallback((eventId: string, userId: string) => {
    return feedbacks.find(f => f.eventId === eventId && f.userId === userId);
  }, [feedbacks]);

  const getEventAverageRating = useCallback((eventId: string) => {
    const eventFeedbacks = feedbacks.filter(f => f.eventId === eventId);
    if (eventFeedbacks.length === 0) return 0;
    const sum = eventFeedbacks.reduce((acc, f) => acc + f.rating, 0);
    return sum / eventFeedbacks.length;
  }, [feedbacks]);

  // Notification functions
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    saveNotifications(prev => [...prev, newNotification]);
  }, [saveNotifications]);

  const getUserNotifications = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  const markNotificationRead = useCallback((notificationId: string) => {
    saveNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, [saveNotifications]);

  const markAllNotificationsRead = useCallback((userId: string) => {
    saveNotifications(prev => prev.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    ));
  }, [saveNotifications]);

  const getUnreadNotificationCount = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }, [notifications]);

  return (
    <EventContext.Provider value={{
      events,
      registrations,
      feedbacks,
      notifications,
      addEvent,
      updateEvent,
      deleteEvent,
      registerForEvent,
      unregisterFromEvent,
      getEventRegistrations,
      getUserRegistrations,
      isUserRegistered,
      markAttendance,
      markAttendanceByQR,
      getEventById,
      getRegistrationByQR,
      addFeedback,
      getEventFeedbacks,
      getUserFeedbackForEvent,
      getEventAverageRating,
      addNotification,
      getUserNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      getUnreadNotificationCount
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
