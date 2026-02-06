import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { 
  Calendar, Users, PlusCircle, Clock, MapPin, 
  CheckCircle, ArrowRight, BarChart3, CalendarCheck
} from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const { events, getUserRegistrations, getEventRegistrations } = useEvents();

  const isOrganizer = user?.role === 'organizer';
  
  // For organizers: events they created
  const myOrganizedEvents = events.filter(e => e.organizerId === user?.id);
  
  // For participants: events they registered for
  const myRegistrations = user ? getUserRegistrations(user.id) : [];
  const registeredEvents = myRegistrations.map(reg => {
    const event = events.find(e => e.id === reg.eventId);
    return { registration: reg, event };
  }).filter(item => item.event);

  // Stats
  const upcomingOrganizedEvents = myOrganizedEvents.filter(e => e.status === 'upcoming').length;
  const totalRegistrationsForMyEvents = myOrganizedEvents.reduce((acc, event) => {
    return acc + getEventRegistrations(event.id).length;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-white/80">
            {isOrganizer 
              ? "Manage your events and track registrations from your dashboard."
              : "View your registered events and discover new opportunities."}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
            <Users className="h-4 w-4" />
            <span className="capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Stats Cards */}
        {isOrganizer ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">{myOrganizedEvents.length}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Events</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingOrganizedEvents}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CalendarCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900">{totalRegistrationsForMyEvents}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Registered Events</p>
                  <p className="text-3xl font-bold text-gray-900">{registeredEvents.length}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available Events</p>
                  <p className="text-3xl font-bold text-gray-900">{events.filter(e => e.status === 'upcoming').length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {isOrganizer && (
            <Link
              to="/create-event"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition flex items-center gap-4 group"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-xl">
                <PlusCircle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  Create New Event
                </h3>
                <p className="text-sm text-gray-500">Start organizing your next campus event</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition" />
            </Link>
          )}
          
          <Link
            to="/events"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition flex items-center gap-4 group"
          >
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                Browse All Events
              </h3>
              <p className="text-sm text-gray-500">Discover upcoming campus activities</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition" />
          </Link>
        </div>

        {/* Content Section */}
        {isOrganizer ? (
          // Organizer: My Events
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
              <p className="text-sm text-gray-500">Events you've organized</p>
            </div>
            
            {myOrganizedEvents.length > 0 ? (
              <div className="divide-y">
                {myOrganizedEvents.map(event => {
                  const regCount = getEventRegistrations(event.id).length;
                  return (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="p-6 flex items-center gap-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                            event.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' :
                            event.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(event.date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {regCount} / {event.capacity}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-500 mb-4">Create your first event to get started</p>
                <Link
                  to="/create-event"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Event
                </Link>
              </div>
            )}
          </div>
        ) : (
          // Participant: My Registrations
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">My Registered Events</h2>
              <p className="text-sm text-gray-500">Events you've signed up for</p>
            </div>
            
            {registeredEvents.length > 0 ? (
              <div className="divide-y">
                {registeredEvents.map(({ registration, event }) => (
                  <Link
                    key={registration.id}
                    to={`/events/${event!.id}`}
                    className="p-6 flex items-center gap-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{event!.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          event!.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                          event!.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' :
                          event!.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {event!.status}
                        </span>
                        {registration.attended && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            Attended
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event!.date), 'MMM d, yyyy')} at {event!.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event!.venue}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                <p className="text-gray-500 mb-4">Browse events and register to get started</p>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <Calendar className="h-4 w-4" />
                  Browse Events
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
