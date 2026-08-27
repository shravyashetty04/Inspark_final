import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';

export default function Holidays() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    is_active: true
  });

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('government_holidays')
        .select('*')
        .eq('year', selectedYear)
        .order('date', { ascending: true });

      if (error) throw error;
      setHolidays(data || []);
    } catch (error) {
      console.error('Error fetching holidays', error);
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateObj = new Date(formData.date);
      const year = dateObj.getFullYear();
      
      const payload = {
        name: formData.name,
        date: formData.date,
        year: year,
        description: formData.description,
        is_active: formData.is_active
      };

      if (editingId) {
        const { error } = await supabase
          .from('government_holidays')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Holiday updated successfully!');
      } else {
        const { error } = await supabase
          .from('government_holidays')
          .insert([payload]);
        if (error) throw error;
        toast.success('Holiday added successfully!');
      }

      setIsModalOpen(false);
      fetchHolidays();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error saving holiday');
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', date: '', description: '', is_active: true });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (holiday: any) => {
    setFormData({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || '',
      is_active: holiday.is_active
    });
    setEditingId(holiday.id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('government_holidays')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success('Holiday status updated');
      fetchHolidays();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const deleteHoliday = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      const { error } = await supabase
        .from('government_holidays')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Holiday deleted');
      fetchHolidays();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete holiday');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-indigo-400" /> Government Holidays
        </h1>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year} className="bg-[#11133c]">{year}</option>
            })}
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl transition shadow-lg"
          >
            <Plus size={18} /> Add Holiday
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8 text-slate-400">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p>No holidays configured for {selectedYear}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm font-medium text-slate-400">
                  <th className="p-4">Date</th>
                  <th className="p-4">Holiday Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 whitespace-nowrap text-white font-medium">
                      {format(new Date(holiday.date), 'dd MMM yyyy (EEEE)')}
                    </td>
                    <td className="p-4 font-semibold text-indigo-400">
                      {holiday.name}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate" title={holiday.description}>
                      {holiday.description || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleStatus(holiday.id, holiday.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          holiday.is_active 
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                            : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                        }`}
                      >
                        {holiday.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {holiday.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(holiday)}
                          className="text-slate-400 hover:text-indigo-400 transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteHoliday(holiday.id)}
                          className="text-slate-400 hover:text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#11133c] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <h3 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Government Holiday' : 'Add Government Holiday'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Holiday Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Independence Day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 min-h-[80px]"
                  placeholder="Optional context"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                  Holiday is Active
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition shadow-lg"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
