import { useState } from 'react';
import { Shield, Users, Settings, Check, X } from 'lucide-react';
import { Permission, RolePermissions } from '../types';

const PERMISSIONS: Permission[] = [
  { id: 'view_tickets', name: 'View Tickets', description: 'View all support tickets', category: 'Tickets' },
  { id: 'create_tickets', name: 'Create Tickets', description: 'Create new support tickets', category: 'Tickets' },
  { id: 'edit_tickets', name: 'Edit Tickets', description: 'Modify existing tickets', category: 'Tickets' },
  { id: 'delete_tickets', name: 'Delete Tickets', description: 'Delete support tickets', category: 'Tickets' },
  { id: 'assign_tickets', name: 'Assign Tickets', description: 'Assign tickets to agents', category: 'Tickets' },
  { id: 'view_templates', name: 'View Templates', description: 'Access ticket templates', category: 'Templates' },
  { id: 'edit_templates', name: 'Edit Templates', description: 'Modify ticket templates', category: 'Templates' },
  { id: 'view_responses', name: 'View Canned Responses', description: 'Access canned responses', category: 'Responses' },
  { id: 'edit_responses', name: 'Edit Canned Responses', description: 'Modify canned responses', category: 'Responses' },
  { id: 'manage_users', name: 'Manage Users', description: 'Create and manage user accounts', category: 'Users' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Access system analytics', category: 'Analytics' },
  { id: 'system_settings', name: 'System Settings', description: 'Modify system configuration', category: 'System' }
];

const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'administrator',
    permissions: PERMISSIONS.map(p => p.id)
  },
  {
    role: 'support-agent',
    permissions: ['view_tickets', 'create_tickets', 'edit_tickets', 'assign_tickets', 'view_templates', 'edit_templates', 'view_responses', 'edit_responses']
  },
  {
    role: 'customer',
    permissions: ['view_tickets', 'create_tickets']
  }
];

const PermissionsManager = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(DEFAULT_ROLE_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<'administrator' | 'support-agent' | 'customer'>('support-agent');

  const currentRolePerms = rolePermissions.find(rp => rp.role === selectedRole);
  const categories = Array.from(new Set(PERMISSIONS.map(p => p.category)));

  const togglePermission = (permissionId: string) => {
    setRolePermissions(prev => prev.map(rp => {
      if (rp.role === selectedRole) {
        const hasPermission = rp.permissions.includes(permissionId);
        return {
          ...rp,
          permissions: hasPermission 
            ? rp.permissions.filter(p => p !== permissionId)
            : [...rp.permissions, permissionId]
        };
      }
      return rp;
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrator': return <Shield className="w-4 h-4" />;
      case 'support-agent': return <Users className="w-4 h-4" />;
      case 'customer': return <Settings className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Role Permissions</h1>
        <p className="text-gray-300">Manage access control for different user roles</p>
      </div>

      {/* Role Selector */}
      <div className="mb-8">
        <div className="flex gap-4">
          {(['administrator', 'support-agent', 'customer'] as const).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedRole === role 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {getRoleIcon(role)}
              <span className="capitalize">{role.replace('-', ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{category}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {PERMISSIONS.filter(p => p.category === category).map(permission => {
                const hasPermission = currentRolePerms?.permissions.includes(permission.id);
                return (
                  <div
                    key={permission.id}
                    onClick={() => togglePermission(permission.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      hasPermission
                        ? 'bg-green-500/20 border-green-500/50 text-green-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      hasPermission ? 'bg-green-500 border-green-500' : 'border-gray-400'
                    }`}>
                      {hasPermission && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{permission.name}</p>
                      <p className="text-xs opacity-70">{permission.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Save Permissions
        </button>
      </div>
    </div>
  );
};

export default PermissionsManager;