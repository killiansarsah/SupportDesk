import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Plus, Edit, Trash2, MessageSquare, FileText, X } from 'lucide-react';
import Toast from './Toast';
import CustomSelect from './CustomSelect';

interface Template {
  id: string;
  name: string;
  content: string;
  type: 'ticket' | 'response';
  category?: string;
}

interface TemplateManagerProps {
  onTemplateSelect?: (template: Template) => void;
  type?: 'ticket' | 'response' | 'both';
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ 
  onTemplateSelect, 
  type = 'both' 
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', type: 'ticket' as 'ticket' | 'response', category: '' });
  const [templates, setTemplates] = useState<Template[]>([
    // Ticket Templates
    {
      id: '1',
      name: 'Password Reset Request',
      type: 'ticket',
      category: 'Account',
      content: `Title: Password Reset Request - [Customer Name]

Description:
Customer is unable to access their account and requires a password reset.

Customer Details:
- Email: [customer-email]
- Account ID: [account-id]
- Last Login: [last-login-date]

Steps to Resolve:
1. Verify customer identity
2. Send password reset link
3. Confirm successful login
4. Update security settings if needed

Priority: Medium
Category: Account Support`
    },
    {
      id: '2',
      name: 'Technical Issue Report',
      type: 'ticket',
      category: 'Technical',
      content: `Title: Technical Issue - [Brief Description]

Description:
Customer experiencing technical difficulties with [specific feature/service].

Issue Details:
- Browser/Device: [browser-device-info]
- Error Message: [error-message]
- Steps to Reproduce: [reproduction-steps]
- Screenshots: [attached-if-available]

Troubleshooting Steps:
1. Clear browser cache and cookies
2. Try different browser/device
3. Check network connectivity
4. Verify account permissions

Priority: High
Category: Technical Support`
    },
    {
      id: '3',
      name: 'Billing Inquiry',
      type: 'ticket',
      category: 'Billing',
      content: `Title: Billing Inquiry - [Customer Name]

Description:
Customer has questions regarding their billing statement or charges.

Billing Details:
- Account Number: [account-number]
- Invoice Number: [invoice-number]
- Billing Period: [billing-period]
- Amount in Question: [amount]

Investigation Required:
1. Review billing history
2. Verify charges and services
3. Check for any discounts or promotions
4. Provide detailed explanation

Priority: Medium
Category: Billing Support`
    },
    // Response Templates
    {
      id: '4',
      name: 'Welcome & Acknowledgment',
      type: 'response',
      category: 'General',
      content: `Hello [Customer Name],

Thank you for contacting our support team. I've received your request and I'm here to help you resolve this issue.

I understand that you're experiencing [brief issue description]. I'll investigate this matter thoroughly and provide you with a solution as quickly as possible.

Expected response time: Within 2-4 hours during business hours.

If you have any additional information that might help me resolve this faster, please don't hesitate to share it.

Best regards,
[Agent Name]
Customer Support Team`
    },
    {
      id: '5',
      name: 'Password Reset Instructions',
      type: 'response',
      category: 'Account',
      content: `Hello [Customer Name],

I've processed your password reset request. Here are the steps to reset your password:

1. Check your email inbox for a password reset link
2. Click on the "Reset Password" button in the email
3. Create a new strong password (minimum 8 characters with uppercase, lowercase, numbers, and symbols)
4. Confirm your new password
5. Log in with your new credentials

Security Tips:
- Use a unique password that you haven't used before
- Consider using a password manager
- Enable two-factor authentication for added security

If you don't receive the email within 10 minutes, please check your spam folder or let me know.

Best regards,
[Agent Name]
Customer Support Team`
    },
    {
      id: '6',
      name: 'Technical Issue Resolution',
      type: 'response',
      category: 'Technical',
      content: `Hello [Customer Name],

Thank you for providing the details about the technical issue you're experiencing. I've identified the problem and here's the solution:

Issue: [Brief description of the issue]
Root Cause: [Explanation of what caused the issue]

Solution Steps:
1. [Step 1 with clear instructions]
2. [Step 2 with clear instructions]
3. [Step 3 with clear instructions]
4. [Step 4 with clear instructions]

If these steps don't resolve the issue, please try the following alternative:
- [Alternative solution]

I'll follow up with you in 24 hours to ensure everything is working properly. Please don't hesitate to reach out if you need any clarification or if the issue persists.

Best regards,
[Agent Name]
Customer Support Team`
    },
    {
      id: '7',
      name: 'Billing Explanation',
      type: 'response',
      category: 'Billing',
      content: `Hello [Customer Name],

Thank you for your billing inquiry. I've reviewed your account and here's a detailed breakdown of your charges:

Invoice #[Invoice Number] - [Billing Period]

Charges Breakdown:
- Base Service: $[amount] ([service description])
- Additional Features: $[amount] ([feature description])
- Taxes & Fees: $[amount]
- Total: $[total amount]

Payment Information:
- Payment Method: [payment method]
- Next Billing Date: [next billing date]

If you have any questions about specific charges or would like to discuss your billing plan, I'm happy to help. We also offer various payment options and billing cycles to better suit your needs.

Best regards,
[Agent Name]
Customer Support Team`
    },
    {
      id: '8',
      name: 'Issue Escalation',
      type: 'response',
      category: 'General',
      content: `Hello [Customer Name],

Thank you for your patience as we work to resolve your issue. After thorough investigation, I've determined that your case requires specialized attention from our technical team.

What happens next:
1. I'm escalating your case to our Level 2 support team
2. A senior technician will be assigned to your case within 2 hours
3. You'll receive a direct contact from them with their findings
4. I'll continue to monitor your case to ensure resolution

Case Details:
- Ticket ID: [Ticket ID]
- Escalation Reason: [Brief reason]
- Priority Level: High

Your case is now our top priority, and we're committed to resolving this as quickly as possible. I apologize for any inconvenience this may have caused.

Best regards,
[Agent Name]
Customer Support Team`
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal]);

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      content: template.content,
      type: template.type,
      category: template.category || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      setToastMessage('Template deleted successfully');
      setShowToast(true);
    }
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      setToastMessage('Please fill in all required fields');
      setShowToast(true);
      return;
    }
    
    if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id
          ? { ...t, name: newTemplate.name, content: newTemplate.content, type: newTemplate.type, category: newTemplate.category || undefined }
          : t
      ));
      setToastMessage('Template updated successfully!');
      setEditingTemplate(null);
    } else {
      const template: Template = {
        id: Date.now().toString(),
        name: newTemplate.name,
        content: newTemplate.content,
        type: newTemplate.type,
        category: newTemplate.category || undefined
      };
      setTemplates([...templates, template]);
      setToastMessage('Template created successfully!');
    }
    
    setShowToast(true);
    setShowAddModal(false);
    setNewTemplate({ name: '', content: '', type: 'ticket', category: '' });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesType = type === 'both' || template.type === type;
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesCategory && matchesSearch;
  });

  const categories = [
    'all',
    ...Array.from(
      new Set(templates.map(t => t.category).filter((category): category is string => !!category))
    )
  ];
  const categoryOptions = categories.map(category => ({
    value: category,
    label: category === 'all' ? 'All Categories' : category
  }));

  const copyToClipboard = async (content: string, templateName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setToastMessage(`Template "${templateName}" copied to clipboard`);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy template:', err);
      setToastMessage('Failed to copy template');
      setShowToast(true);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    copyToClipboard(template.content, template.name);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
          {type === 'ticket' && <FileText className="w-5 h-5" />}
          {type === 'response' && <MessageSquare className="w-5 h-5" />}
          {type === 'both' && <FileText className="w-5 h-5" />}
          <span className="truncate">
            {type === 'ticket' ? 'Ticket Templates' : 
             type === 'response' ? 'Canned Responses' : 
             'Templates & Responses'}
          </span>
        </h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg border border-blue-400/30 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
        />
        <div className="w-full sm:w-56">
          <CustomSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors break-words"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white flex items-center gap-2 flex-wrap">
                  {template.type === 'ticket' ? 
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" /> : 
                    <MessageSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                  }
                  <span className="break-words">{template.name}</span>
                </h4>
                {template.category && (
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded mt-1 inline-block">
                    {template.category}
                  </span>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditTemplate(template)}
                  className="text-white/60 hover:text-white/80 p-1 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-white/70 text-sm bg-black/20 rounded p-3 max-h-32 overflow-y-auto overflow-x-hidden">
              <pre className="whitespace-pre-wrap font-mono text-xs break-words">
                {template.content.substring(0, 200)}
                {template.content.length > 200 && '...'}
              </pre>
            </div>
            
            <button
              onClick={() => handleTemplateSelect(template)}
              className="w-full mt-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg border border-blue-400/30 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Template</span>
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-white/60">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No templates found matching your criteria.</p>
        </div>
      )}
      
      {/* Add Template Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100000]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 w-full max-w-lg max-h-[70vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Create New Template</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Template Name *</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Enter template name"
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                <CustomSelect
                  value={newTemplate.type}
                  onChange={(value) => setNewTemplate({ ...newTemplate, type: value as 'ticket' | 'response' })}
                  options={[
                    { value: 'ticket', label: 'Ticket Template' },
                    { value: 'response', label: 'Response Template' }
                  ]}
                  placeholder="Select Type"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  placeholder="e.g., Account, Technical, Billing"
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Enter template content..."
                  rows={6}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 resize-none"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTemplate}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default TemplateManager;