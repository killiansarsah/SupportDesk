import { useState } from 'react';
import { MessageSquare, Plus, Edit, Trash2, Copy, Globe } from 'lucide-react';
import { CannedResponse, Language } from '../types';

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭' }
];

const MOCK_RESPONSES: CannedResponse[] = [
  {
    id: '1',
    title: 'QR Code Troubleshooting',
    content: 'Thank you for reporting the QR code issue. Please try the following steps:\n1. Clean the QR code surface\n2. Ensure proper lighting\n3. Hold scanner 6 inches away\n4. Contact tech support if issue persists',
    category: 'Technical',
    language: 'en',
    isActive: true
  },
  {
    id: '2',
    title: 'Payment Confirmation',
    content: 'Your payment has been verified successfully. Your QR code name tag will be printed shortly. Please wait at the registration desk.',
    category: 'Payment',
    language: 'en',
    isActive: true
  },
  {
    id: '3',
    title: 'Meal Access Denied',
    content: 'Access denied: You have already received this meal. Each participant is allowed one meal per session. Please contact staff for assistance.',
    category: 'Meals',
    language: 'en',
    isActive: true
  },
  {
    id: '4',
    title: 'Registration Welcome',
    content: 'Welcome to the event! Please provide your full name, address, and payment receipt number to complete your registration. Once verified, we will print your QR code name tag.',
    category: 'Registration',
    language: 'en',
    isActive: true
  },
  {
    id: '5',
    title: 'Payment Declined',
    content: 'We were unable to verify your payment. Please check your receipt number and try again. If the issue persists, please contact our finance team for assistance.',
    category: 'Payment',
    language: 'en',
    isActive: true
  },
  {
    id: '6',
    title: 'Lost Name Tag Replacement',
    content: 'No problem! We can print a replacement name tag for you. Please provide a valid ID for verification, and we will generate a new QR code immediately.',
    category: 'Registration',
    language: 'en',
    isActive: true
  },
  {
    id: '7',
    title: 'Meal Times Information',
    content: 'Meal service times:\n• Breakfast: 7:00 AM - 9:00 AM\n• Lunch: 12:00 PM - 2:00 PM\n• Dinner: 6:00 PM - 8:00 PM\nPlease present your QR code name tag at any meal station during these times.',
    category: 'Meals',
    language: 'en',
    isActive: true
  },
  {
    id: '8',
    title: 'System Maintenance Notice',
    content: 'Our registration system is currently undergoing maintenance. We are processing registrations manually and will update the system once service is restored. Thank you for your patience.',
    category: 'Technical',
    language: 'en',
    isActive: true
  },
  {
    id: '9',
    title: 'Akwaaba - Registration (Twi)',
    content: 'Akwaaba! Yɛfrɛ wo sɛ wo mfa wo din, wo fie address ne wo payment receipt number nkyerɛ yɛn na yɛawie wo registration no. Sɛ yɛhwɛ a ɛyɛ nokware a, yɛbɛtintim wo QR code name tag no ama wo.',
    category: 'Registration',
    language: 'tw',
    isActive: true
  },
  {
    id: '10',
    title: 'Bienvenido - Registro (Spanish)',
    content: '¡Bienvenido al evento! Por favor proporcione su nombre completo, dirección y número de recibo de pago para completar su registro. Una vez verificado, imprimiremos su etiqueta con código QR.',
    category: 'Registration',
    language: 'es',
    isActive: true
  }
];

const CannedResponses = () => {
  const [responses, setResponses] = useState<CannedResponse[]>(MOCK_RESPONSES);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const categories = ['All', 'Registration', 'Payment', 'Technical', 'Meals'];
  
  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || response.category === selectedCategory;
    const matchesLanguage = response.language === selectedLanguage;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleCopyResponse = (response: CannedResponse) => {
    navigator.clipboard.writeText(response.content);
    console.log('Copied response:', response.title);
  };

  const handleDelete = (responseId: string) => {
    setResponses(prev => prev.filter(r => r.id !== responseId));
  };

  const handleEdit = (response: CannedResponse) => {
    setEditingResponse(response);
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedResponse: CannedResponse) => {
    setResponses(prev => prev.map(r => r.id === updatedResponse.id ? updatedResponse : r));
    setIsEditing(false);
    setEditingResponse(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Canned Responses</h1>
          <p className="text-gray-300">Quick reply templates for common support scenarios</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Response
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search responses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category} className="bg-gray-800">
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-gray-800">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Responses Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredResponses.map(response => (
          <div key={response.id} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{response.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                    {response.category}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                    <Globe className="w-3 h-3" />
                    {LANGUAGES.find(l => l.code === response.language)?.flag} {LANGUAGES.find(l => l.code === response.language)?.name}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(response)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(response.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 text-sm whitespace-pre-line line-clamp-6">
                {response.content}
              </p>
            </div>

            <button
              onClick={() => handleCopyResponse(response)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Response
            </button>
          </div>
        ))}
      </div>

      {filteredResponses.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No responses found matching your criteria.</p>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Edit Canned Response</h3>
            <EditResponseForm 
              response={editingResponse}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface EditResponseFormProps {
  response: CannedResponse;
  onSave: (response: CannedResponse) => void;
  onCancel: () => void;
}

const EditResponseForm: React.FC<EditResponseFormProps> = ({ response, onSave, onCancel }) => {
  const [title, setTitle] = useState(response.title);
  const [content, setContent] = useState(response.content);
  const [category, setCategory] = useState(response.category);
  const [language, setLanguage] = useState(response.language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...response,
      title,
      content,
      category,
      language
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Response title"
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {['Registration', 'Payment', 'Technical', 'Meals'].map(cat => (
            <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
          ))}
        </select>
        
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-gray-800">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Response content"
        rows={6}
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        required
      />
      
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CannedResponses;