import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiUsers, FiTrash2, FiMail, FiShoppingBag, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data.users);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const handleRoleUpdate = async (id) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role: selectedRole });
            toast.success('Role updated');
            setEditingRole(null);
            fetchUsers();
        } catch {
            toast.error('Failed to update role');
        }
    };

    if (loading) return <div className="text-white/40 text-sm animate-pulse">Loading users…</div>;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
                <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20">
                    <FiUsers className="text-blue-400 text-2xl" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Users</h1>
                <span className="ml-auto text-[10px] tracking-[0.2em] uppercase text-white/30 bg-white/5 px-3 sm:px-4 py-1.5 rounded-full border border-white/5">
                    {users.length} total
                </span>
            </div>

            <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead className="border-b border-white/5">
                            <tr>
                                {['Name', 'Email', 'Role', 'Verified', 'Orders', 'Actions'].map((h) => (
                                    <th key={h} className="text-left px-3 sm:px-5 py-3 sm:py-3.5 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] sm:text-xs font-bold flex-shrink-0">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-medium text-white/80 text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <div className="flex items-center gap-1.5 text-white/50 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none">
                                            <FiMail className="text-white/20 flex-shrink-0" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        {editingRole === user.id ? (
                                            <div className="flex items-center gap-1">
                                                <select
                                                    value={selectedRole}
                                                    onChange={(e) => setSelectedRole(e.target.value)}
                                                    className="bg-[#0e1629] border border-white/10 rounded-xl px-2 py-1 text-xs text-white outline-none"
                                                >
                                                    <option value="BUYER">BUYER</option>
                                                    <option value="SELLER">SELLER</option>
                                                </select>
                                                <button onClick={() => handleRoleUpdate(user.id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                                                    <FiCheck className="text-xs" />
                                                </button>
                                                <button onClick={() => setEditingRole(null)} className="p-1 text-red-400 hover:text-red-300">
                                                    <FiX className="text-xs" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`text-[8px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${user.role === 'SELLER' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <span className={`text-[8px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${user.isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                                            {user.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] sm:text-xs">
                                            <FiShoppingBag className="text-white/20" />
                                            {user._count?.orders || 0}
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button
                                                onClick={() => { setEditingRole(user.id); setSelectedRole(user.role); }}
                                                className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-200"
                                            >
                                                <FiEdit2 className="text-xs sm:text-sm" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
                                            >
                                                <FiTrash2 className="text-xs sm:text-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="text-center py-12 sm:py-16 text-white/20 text-sm tracking-wider">No users found.</div>
                )}
            </div>
        </div>
    );
};

export default Users;