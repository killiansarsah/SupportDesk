import { useState } from 'react';
import { Lock, Plus, Trash2, User } from 'lucide-react';
import { InternalNote } from '../types';

interface InternalNotesProps {
  ticketId: string;
}

const MOCK_NOTES: InternalNote[] = [
  {
    id: '1',
    ticketId: 'ticket-1',
    userId: 'agent-1',
    userName: 'Sarah Johnson',
    content: 'Checked with tech team - QR scanner at Station 3 needs calibration. Scheduled for 2 PM maintenance.',
    timestamp: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    ticketId: 'ticket-1',
    userId: 'agent-2',
    userName: 'Mike Chen',
    content: 'Customer confirmed payment receipt #PAY-2024-001. Finance team verified. Approved for QR generation.',
    timestamp: '2024-01-15T15:45:00Z'
  }
];

const InternalNotes: React.FC<InternalNotesProps> = ({ ticketId }) => {
  const [notes, setNotes] = useState<InternalNote[]>(MOCK_NOTES.filter(n => n.ticketId === ticketId));
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: InternalNote = {
      id: Date.now().toString(),
      ticketId,
      userId: 'current-user',
      userName: 'Current Agent',
      content: newNote,
      timestamp: new Date().toISOString()
    };

    setNotes(prev => [...prev, note]);
    setNewNote('');
    setIsAdding(false);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Internal Notes</h3>
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
            Agent Only
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Add New Note */}
      {isAdding && (
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add internal note (visible to agents only)..."
            className="w-full h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              Save Note
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map(note => (
          <div key={note.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{note.userName}</p>
                  <p className="text-xs text-gray-400">{formatTime(note.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-line">{note.content}</p>
          </div>
        ))}
      </div>

      {notes.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No internal notes yet. Add the first note to start collaborating with your team.</p>
        </div>
      )}
    </div>
  );
};

export default InternalNotes;