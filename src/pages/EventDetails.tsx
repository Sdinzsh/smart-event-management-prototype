import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, MapPin, Users, Tag, ArrowLeft, 
  CheckCircle, XCircle, Edit, Trash2, UserCheck, AlertCircle,
  QrCode, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { QRScanner } from '../components/QRScanner';
import { CalendarIntegration } from '../components/CalendarIntegration';
import { FeedbackForm, FeedbackList } from '../components/FeedbackForm';

const categoryImages: Record<string, string> = {
  academic: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop',
  cultural: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-fffb4837ed67?w=800&h=400&fit=crop',
  technical: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
  workshop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  seminar: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop',
  other: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop'
};

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getEventById, registerForEvent, unregisterFromEvent, isUserRegistered, 
    getEventRegistrations, deleteEvent, markAttendance, markAttendanceByQR,
    getUserRegistrations, getEventAverageRating, getEventFeedbacks
  } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'feedback'>('details');

  const event = getEventById(id || '');
  
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link to="/events" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const registrations = getEventRegistrations(event.id);
  const isRegistered = user ? isUserRegistered(event.id, user.id) : false;
  const isOrganizer = user?.id === event.organizerId;
  const spotsLeft = event.capacity - registrations.length;
  const isFull = spotsLeft <= 0;
  const userRegistration = user ? getUserRegistrations(user.id).find(r => r.eventId === event.id) : null;
  const averageRating = getEventAverageRating(event.id);
  const feedbackCount = getEventFeedbacks(event.id).length;
  const hasAttended = userRegistration?.attended || false;
  const canLeaveFeedback = hasAttended || event.status === 'completed';

  const handleRegister = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const success = registerForEvent(event.id, user.id, user.name, user.email);
    if (success) {
      setRegistrationMessage({ type: 'success', text: 'Successfully registered for this event! Check your QR code below.' });
    } else {
      setRegistrationMessage({ type: 'error', text: 'Failed to register. Event may be full.' });
    }
    setTimeout(() => setRegistrationMessage(null), 5000);
  };

  const handleUnregister = () => {
    if (user) {
      unregisterFromEvent(event.id, user.id);
      setRegistrationMessage({ type: 'success', text: 'Successfully unregistered from this event.' });
      setTimeout(() => setRegistrationMessage(null), 3000);
    }
  };

  const handleDelete = () => {
    deleteEvent(event.id);
    navigate('/events');
  };

  const handleQRScan = (qrCode: string) => {
    const result = markAttendanceByQR(qrCode);
    setScanResult({ 
      type: result.success ? 'success' : 'error', 
      text: result.message 
    });
    setShowQRScanner(false);
    setTimeout(() => setScanResult(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={event.image || categoryImages[event.category] || categoryImages.other}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-gray-700 hover:bg-white transition shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8">
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              event.status === 'upcoming' ? 'bg-green-500 text-white' :
              event.status === 'ongoing' ? 'bg-yellow-500 text-white' :
              event.status === 'completed' ? 'bg-gray-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            {averageRating > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white flex items-center gap-1">
                <Star className="h-3 w-3 fill-white" />
                {averageRating.toFixed(1)} ({feedbackCount})
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {registrationMessage && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            registrationMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {registrationMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {registrationMessage.text}
          </div>
        )}

        {scanResult && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            scanResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {scanResult.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {scanResult.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                    activeTab === 'details' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Event Details
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                    activeTab === 'feedback' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews ({feedbackCount})
                </button>
              </div>

              <div className="p-6 md:p-8">
                {activeTab === 'details' ? (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                  </>
                ) : (
                  <div className="space-y-6">
                    {isAuthenticated && canLeaveFeedback && (
                      <FeedbackForm eventId={event.id} />
                    )}
                    {!canLeaveFeedback && isRegistered && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-600">
                        <p>You can leave a review after attending the event.</p>
                      </div>
                    )}
                    <FeedbackList eventId={event.id} />
                  </div>
                )}
              </div>
            </div>

            {/* User's QR Code (if registered) */}
            {isAuthenticated && isRegistered && userRegistration && (
              <QRCodeDisplay registration={userRegistration} event={event} />
            )}

            {/* Organizer Actions */}
            {isOrganizer && (
              <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizer Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Event
                  </Link>
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <QrCode className="h-4 w-4" />
                    Scan Attendance
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Event
                  </button>
                </div>

                {showDeleteConfirm && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 mb-3">Are you sure you want to delete this event? This action cannot be undone.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Participants List (for organizer) */}
            {isOrganizer && registrations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Registered Participants ({registrations.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {registrations.map(reg => (
                    <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{reg.userName}</p>
                        <p className="text-sm text-gray-500">{reg.userEmail}</p>
                      </div>
                      <button
                        onClick={() => markAttendance(reg.id, !reg.attended)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          reg.attended 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        <UserCheck className="h-4 w-4" />
                        {reg.attended ? 'Attended' : 'Mark Attended'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p className="text-gray-600">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Time</p>
                    <p className="text-gray-600">
                      {event.time}
                      {event.endTime && ` - ${event.endTime}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Venue</p>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Capacity</p>
                    <p className="text-gray-600">
                      {registrations.length} / {event.capacity} registered
                    </p>
                    {!isFull && spotsLeft <= 10 && (
                      <p className="text-orange-600 text-sm">Only {spotsLeft} spots left!</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Organized by</p>
                    <p className="text-gray-600">{event.organizerName}</p>
                  </div>
                </div>
              </div>

              {/* Registration Button */}
              <div className="mt-6 pt-6 border-t">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                  >
                    Login to Register
                  </Link>
                ) : isRegistered ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">You're registered!</span>
                    </div>
                    {event.status === 'upcoming' && (
                      <button
                        onClick={handleUnregister}
                        className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-200 transition"
                      >
                        <XCircle className="h-5 w-5" />
                        Cancel Registration
                      </button>
                    )}
                  </div>
                ) : isFull ? (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Event is full</span>
                  </div>
                ) : event.status !== 'upcoming' && event.status !== 'ongoing' ? (
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Registration closed</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Register Now
                  </button>
                )}
              </div>
            </div>

            {/* Calendar Integration */}
            {(event.status === 'upcoming' || event.status === 'ongoing') && (
              <CalendarIntegration event={event} />
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
