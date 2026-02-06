export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'organizer' | 'participant';
  createdAt: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    eventReminders: boolean;
    registrationConfirmations: boolean;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  category: 'academic' | 'cultural' | 'sports' | 'technical' | 'workshop' | 'seminar' | 'other';
  capacity: number;
  organizerId: string;
  organizerName: string;
  organizerEmail?: string;
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  qrCode?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  attended: boolean;
  attendedAt?: string;
  qrCode: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'registration' | 'reminder' | 'update' | 'cancellation' | 'feedback';
  title: string;
  message: string;
  eventId?: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
