import { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';

interface FeedbackFormProps {
  eventId: string;
  onSubmit?: () => void;
}

export function FeedbackForm({ eventId, onSubmit }: FeedbackFormProps) {
  const { user } = useAuth();
  const { addFeedback, getUserFeedbackForEvent, getEventById } = useEvents();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const existingFeedback = user ? getUserFeedbackForEvent(eventId, user.id) : undefined;
  const event = getEventById(eventId);

  if (existingFeedback) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-2 text-green-700 mb-3">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">Your Feedback</span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= existingFeedback.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-gray-600">({existingFeedback.rating}/5)</span>
        </div>
        <p className="text-gray-700">{existingFeedback.comment}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
          <Star className="h-6 w-6 text-green-600 fill-green-600" />
        </div>
        <h3 className="font-semibold text-green-700 mb-1">Thank you for your feedback!</h3>
        <p className="text-green-600 text-sm">Your review helps improve future events.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setIsSubmitting(true);
    try {
      addFeedback({
        eventId,
        userId: user.id,
        userName: user.name,
        rating,
        comment
      });
      setSubmitted(true);
      onSubmit?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Rate this Event</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">Your Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-gray-600 font-medium">{rating}/5</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Your Review (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder={`What did you think about ${event?.title || 'this event'}?`}
          />
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}

interface FeedbackListProps {
  eventId: string;
}

export function FeedbackList({ eventId }: FeedbackListProps) {
  const { getEventFeedbacks, getEventAverageRating } = useEvents();
  const feedbacks = getEventFeedbacks(eventId);
  const averageRating = getEventAverageRating(eventId);

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
            <p className="text-sm text-gray-600">{feedbacks.length === 1 ? 'Review' : 'Reviews'}</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{feedback.userName}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= feedback.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
            </div>
            {feedback.comment && (
              <p className="text-gray-600 mt-2">{feedback.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
