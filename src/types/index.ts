export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'organizer' | 'participant';
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: 'academic' | 'cultural' | 'sports' | 'technical' | 'workshop' | 'seminar' | 'other';
  capacity: number;
  organizerId: string;
  organizerName: string;
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  attended: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
