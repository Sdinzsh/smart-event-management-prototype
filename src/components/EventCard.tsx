import { Link } from 'react-router-dom';
import { Event } from '../types';
import { Calendar, Clock, MapPin, Users, Tag, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useEvents } from '../context/EventContext';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
}

const categoryColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700',
  cultural: 'bg-pink-100 text-pink-700',
  sports: 'bg-green-100 text-green-700',
  technical: 'bg-purple-100 text-purple-700',
  workshop: 'bg-orange-100 text-orange-700',
  seminar: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700'
};

const statusColors: Record<string, string> = {
  upcoming: 'bg-emerald-100 text-emerald-700',
  ongoing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700'
};

const categoryImages: Record<string, string> = {
  academic: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop',
  cultural: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-fffb4837ed67?w=400&h=250&fit=crop',
  technical: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop',
  workshop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
  seminar: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=250&fit=crop',
  other: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=250&fit=crop'
};

export function EventCard({ event }: EventCardProps) {
  const { getEventRegistrations, getEventAverageRating, getEventFeedbacks } = useEvents();
  const registrationCount = getEventRegistrations(event.id).length;
  const spotsLeft = event.capacity - registrationCount;
  const averageRating = getEventAverageRating(event.id);
  const feedbackCount = getEventFeedbacks(event.id).length;

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image || categoryImages[event.category] || categoryImages.other}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=250&fit=crop';
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[event.category]}`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
          {averageRating > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-700">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({feedbackCount})</span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>{event.time}{event.endTime && ` - ${event.endTime}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-500" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <span>{registrationCount} / {event.capacity} registered</span>
              {spotsLeft <= 10 && spotsLeft > 0 && (
                <span className="text-orange-500 text-xs font-medium">({spotsLeft} spots left!)</span>
              )}
              {spotsLeft <= 0 && (
                <span className="text-red-500 text-xs font-medium">(Full)</span>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">By {event.organizerName}</span>
            </div>
            <span className="text-indigo-600 text-sm font-medium group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
