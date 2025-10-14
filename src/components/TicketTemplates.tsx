import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { TicketTemplate } from '../types';
import CustomSelect from './CustomSelect';
import TemplateService from '../services/templateService';

const MOCK_TEMPLATES: TicketTemplate[] = [
  {
    id: '1',
    name: 'QR Code Not Scanning',
    category: 'Technical',
    title: 'QR Code Scanner Issue',
    description: 'Participant QR code is not scanning properly at meal station. Please check:\n1. QR code print quality\n2. Scanner functionality\n3. Lighting conditions\n4. Code damage',
    priority: 'high',
    assignedTo: 'tech-team',
    isActive: true
  },
  {
    id: '2',
    name: 'Payment Verification Failed',
    category: 'Payment',
    title: 'Payment Receipt Verification Issue',
    description: 'Unable to verify payment receipt. Please provide:\n1. Receipt number\n2. Payment amount\n3. Payment date\n4. Payment method used',
    priority: 'medium',
    assignedTo: 'finance-team',
    isActive: true
  },
  {
    id: '3',
    name: 'Printer Malfunction',
    category: 'Technical',
    title: 'Name Tag Printer Not Working',
    description: 'QR code name tag printer is experiencing issues:\n1. Check power connection\n2. Verify sticker paper supply\n3. Clear any paper jams\n4. Restart printer if necessary\n5. Contact IT if problem persists',
    priority: 'urgent',
    assignedTo: 'tech-team',
    isActive: true
  },
  {
    id: '4',
    name: 'Duplicate Meal Claim',
    category: 'Meals',
    title: 'Participant Already Received Meal',
    description: 'System shows participant has already claimed this meal session:\n1. Verify participant identity\n2. Check meal session timing\n3. Review scan history\n4. Use manual override if legitimate exception',
    priority: 'medium',
    assignedTo: 'catering-team',
    isActive: true
  },
  {
    id: '5',
    name: 'Lost Name Tag',
    category: 'Registration',
    title: 'Participant Lost QR Code Name Tag',
    description: 'Participant has lost their QR code name tag:\n1. Verify participant identity with ID\n2. Check registration status in system\n3. Confirm payment approval\n4. Generate and print replacement QR code\n5. Log replacement in system',
    priority: 'medium',
    assignedTo: 'registration-team',
    isActive: true
  },
  {
    id: '6',
    name: 'System Offline',
    category: 'Technical',
    title: 'Registration System Connection Lost',
    description: 'Registration system is offline or experiencing connectivity issues:\n1. Check internet connection\n2. Verify server status\n3. Switch to offline mode if available\n4. Document offline registrations for later sync\n5. Contact IT support immediately',
    priority: 'urgent',
    assignedTo: 'tech-team',
    isActive: true
  }
];

const TicketTemplates = () => {
  const [templates, setTemplates] = useState<TicketTemplate[]>(MOCK_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<TicketTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load templates from server on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await TemplateService.getInstance().getTemplates();
      if (response.success) {
        setTemplates(response.data || MOCK_TEMPLATES);
      } else {
        // If API fails, use mock templates
        setTemplates(MOCK_TEMPLATES);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to mock templates if API fails
      setTemplates(MOCK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: TicketTemplate) => {
    console.log('Using template:', template.name);
    // This would integrate with ticket creation
  };

  const handleEdit = (template: TicketTemplate) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleNewTemplate = () => {
    setIsCreating(true);
  };

  const handleSaveEdit = async (updatedTemplate: TicketTemplate) => {
    try {
      const response = await TemplateService.getInstance().updateTemplate(updatedTemplate.id, {
        name: updatedTemplate.name,
        category: updatedTemplate.category,
        title: updatedTemplate.title,
        description: updatedTemplate.description,
        priority: updatedTemplate.priority,
        assignedTo: updatedTemplate.assignedTo
      });
      
      if (response.success) {
        setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
        setIsEditing(false);
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      // For now, update locally even if API fails
      setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
      setIsEditing(false);
      setEditingTemplate(null);
    }
  };

  const handleSaveNew = async (newTemplate: Omit<TicketTemplate, 'id'>) => {
    try {
      console.log('🔧 Creating template with payload:', newTemplate);
      const response = await TemplateService.getInstance().createTemplate(newTemplate);
      
      if (response.success && response.data) {
        setTemplates(prev => [...prev, response.data!]);
      } else {
        // Fallback to local creation if API fails
        const templateWithId = {
          ...newTemplate,
          id: Date.now().toString(),
          isActive: true
        };
        setTemplates(prev => [...prev, templateWithId]);
      }
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating template:', error);
      // Fallback to local creation
      const templateWithId = {
        ...newTemplate,
        id: Date.now().toString(),
        isActive: true
      };
      setTemplates(prev => [...prev, templateWithId]);
      setIsCreating(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      const response = await TemplateService.getInstance().deleteTemplate(templateId);
      
      if (response.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      // For now, delete locally even if API fails
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ticket Templates</h1>
        </div>
        <button 
          onClick={handleNewTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-full shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
          style={{ backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Create Template</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-gray-300 mt-4">Loading templates...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
          <div key={template.id} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                    {template.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    template.priority === 'urgent' ? 'bg-red-500/20 text-red-300' :
                    template.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    template.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {template.priority}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-white mb-2">Title:</p>
              <p className="text-gray-300 text-sm">{template.title}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-white mb-2">Description:</p>
              <p className="text-gray-300 text-sm line-clamp-4 whitespace-pre-line">
                {template.description}
              </p>
            </div>

            <button
              onClick={() => handleUseTemplate(template)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Use Template
            </button>
          </div>
        ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="text-center py-12">
          <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No templates created yet. Create your first template to get started.</p>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Edit Ticket Template</h3>
            <EditTemplateForm 
              template={editingTemplate}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}

      {/* Create New Template Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create New Ticket Template</h3>
            <CreateTemplateForm 
              onSave={handleSaveNew}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface EditTemplateFormProps {
  template: TicketTemplate;
  onSave: (template: TicketTemplate) => void;
  onCancel: () => void;
}

const EditTemplateForm: React.FC<EditTemplateFormProps> = ({ template, onSave, onCancel }) => {
  const [name, setName] = useState(template.name);
  const [title, setTitle] = useState(template.title);
  const [description, setDescription] = useState(template.description);
  const [category, setCategory] = useState(template.category);
  const [priority, setPriority] = useState(template.priority);
  const [assignedTo, setAssignedTo] = useState(template.assignedTo || '');

  const categoryOptions = ['Technical', 'Payment', 'Registration', 'Meals'].map(cat => ({
    value: cat,
    label: cat
  }));

  const priorityOptions = ['low', 'medium', 'high', 'urgent'].map(level => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1)
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...template,
      name,
      title,
      description,
      category,
      priority,
      assignedTo
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template name"
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ticket title"
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomSelect
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="Category"
        />

        <CustomSelect
          value={priority}
          onChange={(value) => setPriority(value as TicketTemplate['priority'])}
          options={priorityOptions}
          placeholder="Priority"
        />
        
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assigned to"
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Template description"
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

interface CreateTemplateFormProps {
  onSave: (template: Omit<TicketTemplate, 'id'>) => void;
  onCancel: () => void;
}

const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TicketTemplate['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState('');

  const categoryOptions = ['Technical', 'Payment', 'Registration', 'Meals'].map(cat => ({
    value: cat,
    label: cat
  }));

  const priorityOptions = ['low', 'medium', 'high', 'urgent'].map(level => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1)
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      title,
      description,
      category,
      priority,
      assignedTo,
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template name"
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ticket title"
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomSelect
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="Category"
        />

        <CustomSelect
          value={priority}
          onChange={(value) => setPriority(value as TicketTemplate['priority'])}
          options={priorityOptions}
          placeholder="Priority"
        />
        
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assigned to"
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Template description"
        rows={6}
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        required
      />
      
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Create Template
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

export default TicketTemplates;