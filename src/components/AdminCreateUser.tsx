import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

const roleOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'support-agent', label: 'Support Agent' },
  { value: 'administrator', label: 'Administrator' }
];

const AdminCreateUser: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'administrator'|'support-agent'|'customer'>('customer');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Get token from local storage (mock token used by backend)
      const token = localStorage.getItem('auth_token') || '';

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ email, name, phone, role, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed');
      setMessage('User created successfully');
      setEmail(''); setName(''); setPhone(''); setPassword(''); setRole('customer');
    } catch (err) {
      const error = err as Error;
      setMessage(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white/30 dark:bg-dark-900/30 backdrop-blur-md border border-white/20 dark:border-dark-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Create User</h3>
      {message && <div className="mb-3 text-sm text-gray-700 dark:text-gray-300">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full px-3 py-2 bg-white/30 dark:bg-dark-800/30 backdrop-blur-md border border-white/20 dark:border-dark-700 rounded text-gray-900 dark:text-white" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="w-full px-3 py-2 bg-white/30 dark:bg-dark-800/30 backdrop-blur-md border border-white/20 dark:border-dark-700 rounded text-gray-900 dark:text-white" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        <input className="w-full px-3 py-2 bg-white/30 dark:bg-dark-800/30 backdrop-blur-md border border-white/20 dark:border-dark-700 rounded text-gray-900 dark:text-white" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <CustomSelect
          value={role}
          onChange={(selectedRole) => setRole(selectedRole as 'administrator' | 'support-agent' | 'customer')}
          options={roleOptions}
          placeholder="Select role"
          className="w-full"
        />
        <input className="w-full px-3 py-2 bg-white/30 dark:bg-dark-800/30 backdrop-blur-md border border-white/20 dark:border-dark-700 rounded text-gray-900 dark:text-white" placeholder="Password (optional)" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex items-center justify-end">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateUser;
