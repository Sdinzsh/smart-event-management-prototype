import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Event, Registration } from '../types';

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, userId: string, userName: string, userEmail: string) => boolean;
  unregisterFromEvent: (eventId: string, userId: string) => void;
  getEventRegistrations: (eventId: string) => Registration[];
  getUserRegistrations: (userId: string) => Registration[];
  isUserRegistered: (eventId: string, userId: string) => boolean;
  markAttendance: (registrationId: string, attended: boolean) => void;
  getEventById: (id: string) => Event | undefined;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Tech Symposium 2024',
    description: 'Join us for the biggest tech event of the year featuring keynote speakers, workshops, and networking opportunities. Learn about the latest trends in AI, blockchain, and cloud computing.',
    date: '2024-12-20',
    time: '09:00',
    venue: 'Main Auditorium, Building A',
    category: 'technical',
    capacity: 500,
    organizerId: 'org1',
    organizerName: 'Tech Club',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Cultural Fest - Harmony 2024',
    description: 'Experience the vibrant cultural diversity of our campus. Music, dance, art exhibitions, and food stalls from around the world.',
    date: '2024-12-25',
    time: '10:00',
    venue: 'Campus Ground',
    category: 'cultural',
    capacity: 2000,
    organizerId: 'org2',
    organizerName: 'Cultural Committee',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Machine Learning Workshop',
    description: 'Hands-on workshop on machine learning fundamentals. Learn to build your first ML model using Python and scikit-learn.',
    date: '2024-12-18',
    time: '14:00',
    venue: 'Computer Lab 301',
    category: 'workshop',
    capacity: 50,
    organizerId: 'org1',
    organizerName: 'AI Club',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Inter-College Basketball Tournament',
    description: 'Annual basketball championship featuring teams from 16 colleges. Come support your team!',
    date: '2024-12-22',
    time: '08:00',
    venue: 'Sports Complex',
    category: 'sports',
    capacity: 1000,
    organizerId: 'org3',
    organizerName: 'Sports Committee',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  }
];

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    const storedRegistrations = localStorage.getItem('registrations');
    
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      setEvents(sampleEvents);
      localStorage.setItem('events', JSON.stringify(sampleEvents));
    }
    
    if (storedRegistrations) {
      setRegistrations(JSON.parse(storedRegistrations));
    }
  }, []);

  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('events', JSON.stringify(newEvents));
  };

  const saveRegistrations = (newRegistrations: Registration[]) => {
    setRegistrations(newRegistrations);
    localStorage.setItem('registrations', JSON.stringify(newRegistrations));
  };

  const addEvent = (event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    saveEvents([...events, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    saveEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
    saveRegistrations(registrations.filter(r => r.eventId !== id));
  };

  const registerForEvent = (eventId: string, userId: string, userName: string, userEmail: string): boolean => {
    const event = events.find(e => e.id === eventId);
    const currentRegistrations = registrations.filter(r => r.eventId === eventId);
    
    if (!event || currentRegistrations.length >= event.capacity) {
      return false;
    }
    
    if (registrations.some(r => r.eventId === eventId && r.userId === userId)) {
      return false;
    }
    
    const newRegistration: Registration = {
      id: crypto.randomUUID(),
      eventId,
      userId,
      userName,
      userEmail,
      registeredAt: new Date().toISOString(),
      attended: false
    };
    
    saveRegistrations([...registrations, newRegistration]);
    return true;
  };

  const unregisterFromEvent = (eventId: string, userId: string) => {
    saveRegistrations(registrations.filter(r => !(r.eventId === eventId && r.userId === userId)));
  };

  const getEventRegistrations = (eventId: string) => {
    return registrations.filter(r => r.eventId === eventId);
  };

  const getUserRegistrations = (userId: string) => {
    return registrations.filter(r => r.userId === userId);
  };

  const isUserRegistered = (eventId: string, userId: string) => {
    return registrations.some(r => r.eventId === eventId && r.userId === userId);
  };

  const markAttendance = (registrationId: string, attended: boolean) => {
    saveRegistrations(registrations.map(r => 
      r.id === registrationId ? { ...r, attended } : r
    ));
  };

  const getEventById = (id: string) => {
    return events.find(e => e.id === id);
  };

  return (
    <EventContext.Provider value={{
      events,
      registrations,
      addEvent,
      updateEvent,
      deleteEvent,
      registerForEvent,
      unregisterFromEvent,
      getEventRegistrations,
      getUserRegistrations,
      isUserRegistered,
      markAttendance,
      getEventById
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
