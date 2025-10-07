import { useState } from 'react';
import { Star, ThumbsUp, Send } from 'lucide-react';

interface Survey {
  rating: number;
  feedback: string;
  timestamp: string;
  ticketId: string;
}

export default function CustomerSatisfaction() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
  const survey: Survey = {
      rating,
      feedback,
      timestamp: new Date().toISOString(),
      ticketId: 'TICKET-001'
    };
    
  const surveys: Survey[] = JSON.parse(localStorage.getItem('csat-surveys') || '[]');
    surveys.push(survey);
    localStorage.setItem('csat-surveys', JSON.stringify(surveys));
    
    setSubmitted(true);
  };

  const getSurveyStats = () => {
  const surveys: Survey[] = JSON.parse(localStorage.getItem('csat-surveys') || '[]');
    const total = surveys.length;
  const avgRating = total > 0 ? (surveys.reduce((sum: number, s: Survey) => sum + s.rating, 0) / total).toFixed(1) : '0';
  const satisfied = surveys.filter((s: Survey) => s.rating >= 4).length;
    
    return { total, avgRating, satisfied, satisfactionRate: total > 0 ? Math.round((satisfied / total) * 100) : 0 };
  };

  const stats = getSurveyStats();

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <ThumbsUp className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-300">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Customer Satisfaction</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-gray-400 text-sm">Total Surveys</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
          <p className="text-gray-400 text-sm">Average Rating</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-2xl font-bold text-white">{stats.satisfactionRate}%</p>
          <p className="text-gray-400 text-sm">Satisfaction Rate</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-2xl font-bold text-white">{stats.satisfied}</p>
          <p className="text-gray-400 text-sm">Satisfied Customers</p>
        </div>
      </div>

      {/* Survey Form */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6">Rate Your Experience</h2>
        
        <div className="mb-6">
          <p className="text-white mb-4">How satisfied are you with our support?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-white mb-2">Additional Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about your experience..."
            rows={4}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          Submit Feedback
        </button>
      </div>
    </div>
  );
}