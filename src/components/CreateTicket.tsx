import React, { useState } from 'react';
import { ArrowLeft, Paperclip, X, Upload } from 'lucide-react';
import { User } from '../types';
import TicketService from '../services/ticketService';

interface CreateTicketProps {
  user: User;
  onBack: () => void;
  onTicketCreated: () => void;
}

const CreateTicket: React.FC<CreateTicketProps> = ({ user, onBack, onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const categories = [
    'Account',
    'Billing',
    'Technical',
    'General',
    'Bug Report',
    'Feature Request',
  ];

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketService = TicketService.getInstance();
      
      const ticketData = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        customerId: user.id,
      };
      
      const newTicket = await ticketService.createTicket(ticketData);

      for (const file of attachments) {
        await ticketService.addAttachment(newTicket.id, file, user.id);
      }

      onTicketCreated();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Support Ticket</h1>
          <p className="text-gray-300">Describe your issue and we'll help you resolve it</p>
        </div>
      </div>

      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 dark:bg-dark-900 border border-white/20 dark:border-dark-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of your issue"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 dark:bg-dark-900 border border-white/20 dark:border-dark-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" className="bg-gray-800 text-white">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800 text-white">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 dark:bg-dark-900 border border-white/20 dark:border-dark-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low" className="bg-gray-800 text-white">Low</option>
                <option value="medium" className="bg-gray-800 text-white">Medium</option>
                <option value="high" className="bg-gray-800 text-white">High</option>
                <option value="urgent" className="bg-gray-800 text-white">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 dark:bg-dark-900 border border-white/20 dark:border-dark-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Please provide detailed information about your issue..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Attachments
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-400 bg-blue-500/10' : 'border-white/20 bg-white/5'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">
                Drag and drop files here, or{' '}
                <label className="text-blue-400 hover:text-blue-300 cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-white text-sm">{file.name}</p>
                        <p className="text-gray-400 text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-6 mt-8 mb-20">
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200 min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;