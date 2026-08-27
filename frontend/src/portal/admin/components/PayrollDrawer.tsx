import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { X, Edit2, Save, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PayrollDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: any;
  payrollRecord: any;
  onUpdate: () => void;
  onGeneratePayslip: (data: any) => void;
}

export default function PayrollDrawer({ isOpen, onClose, employeeData, payrollRecord, onUpdate, onGeneratePayslip }: PayrollDrawerProps) {
  const [editingStructure, setEditingStructure] = useState(false);
  const [structure, setStructure] = useState<any>({
    annual_ctc: 0,
    basic_salary: 0,
    hra: 0,
    allowances: 0,
    pf_deduction: 0,
    professional_tax: 0,
    tds: 0
  });

  useEffect(() => {
    if (isOpen && employeeData) {
      fetchSalaryStructure();
    }
  }, [isOpen, employeeData]);

  const fetchSalaryStructure = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_structures')
        .select('*')
        .eq('employee_id', employeeData.id)
        .single();
        
      if (data) {
        setStructure(data);
      } else {
        // Init with defaults
        setStructure({
          annual_ctc: 0,
          basic_salary: employeeData.base_salary || 0,
          hra: 0,
          allowances: 0,
          pf_deduction: 0,
          professional_tax: 0,
          tds: 0
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStructure = async () => {
    try {
      // Upsert salary structure
      const { error } = await supabase
        .from('salary_structures')
        .upsert({
          employee_id: employeeData.id,
          annual_ctc: structure.annual_ctc,
          basic_salary: structure.basic_salary,
          hra: structure.hra,
          allowances: structure.allowances,
          pf_deduction: structure.pf_deduction,
          professional_tax: structure.professional_tax,
          tds: structure.tds,
          effective_date: new Date().toISOString().split('T')[0]
        }, { onConflict: 'employee_id' });

      if (error) throw error;
      toast.success('Salary structure updated successfully');
      setEditingStructure(false);
      onUpdate(); // Re-trigger payroll calculation
    } catch (err: any) {
      toast.error(err.message || 'Error saving salary structure');
    }
  };

  const updatePayrollStatus = async (status: string) => {
    if (!payrollRecord?.id) return;
    try {
      const { error } = await supabase
        .from('payroll_records')
        .update({ status, payment_date: status === 'Paid' ? new Date().toISOString() : null })
        .eq('id', payrollRecord.id);
        
      if (error) throw error;
      toast.success(`Payroll marked as ${status}`);
      onUpdate();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  const isConfigured = structure.basic_salary > 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0f172a] shadow-2xl z-50 border-l border-white/10 flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">{employeeData?.full_name}</h2>
            <p className="text-indigo-400 text-sm font-mono">{employeeData?.employee_id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status Banner */}
          {payrollRecord && (
            <div className={`p-4 rounded-xl flex items-center justify-between ${
              payrollRecord.status === 'Paid' ? 'bg-emerald-500/10 border border-emerald-500/20' : 
              payrollRecord.status === 'On Hold' ? 'bg-red-500/10 border border-red-500/20' :
              'bg-orange-500/10 border border-orange-500/20'
            }`}>
              <div>
                <p className="text-sm text-slate-400">Payroll Status</p>
                <p className={`font-bold uppercase tracking-wider ${
                  payrollRecord.status === 'Paid' ? 'text-emerald-400' : 
                  payrollRecord.status === 'On Hold' ? 'text-red-400' : 'text-orange-400'
                }`}>{payrollRecord.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Net Payable</p>
                <p className="text-xl font-black text-white">₹{payrollRecord.net_salary.toLocaleString()}</p>
              </div>
            </div>
          )}

          {!isConfigured && !editingStructure && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3 text-orange-200">
              <AlertCircle className="shrink-0" />
              <div>
                <p className="font-semibold">Salary Not Configured</p>
                <p className="text-sm opacity-80 mt-1">Please configure the salary structure below before processing payroll.</p>
              </div>
            </div>
          )}

          {/* Salary Structure Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" /> Salary Structure
              </h3>
              {!editingStructure ? (
                <button onClick={() => setEditingStructure(true)} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
              ) : (
                <button onClick={handleSaveStructure} className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 font-semibold">
                  <Save size={16} /> Save Changes
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(structure).filter(k => k !== 'id' && k !== 'employee_id' && k !== 'effective_date' && k !== 'created_at' && k !== 'updated_at').map(key => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                    {key.replace(/_/g, ' ')}
                  </label>
                  {editingStructure ? (
                    <input
                      type="number"
                      value={structure[key]}
                      onChange={(e) => setStructure({...structure, [key]: parseFloat(e.target.value) || 0})}
                      className="w-full bg-black/40 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="font-medium text-slate-200">₹{Number(structure[key] || 0).toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Month Breakdown (Only if configured) */}
          {payrollRecord && isConfigured && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white px-1">Current Month Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings Card */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                  <p className="text-sm font-medium text-emerald-400 mb-3 border-b border-emerald-500/20 pb-2">Gross Earnings</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300"><span>Basic</span> <span>₹{payrollRecord.basic_salary}</span></div>
                    <div className="flex justify-between text-slate-300"><span>HRA</span> <span>₹{payrollRecord.hra}</span></div>
                    <div className="flex justify-between text-slate-300"><span>Allowances</span> <span>₹{payrollRecord.allowances}</span></div>
                    <div className="flex justify-between text-slate-300"><span>Bonus</span> <span>₹{payrollRecord.bonus}</span></div>
                    <div className="flex justify-between font-bold text-emerald-400 pt-2 border-t border-emerald-500/20">
                      <span>Total</span> <span>₹{payrollRecord.gross_salary}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Card */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                  <p className="text-sm font-medium text-red-400 mb-3 border-b border-red-500/20 pb-2">Deductions</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300"><span>PF</span> <span>₹{payrollRecord.pf_deduction}</span></div>
                    <div className="flex justify-between text-slate-300"><span>Tax</span> <span>₹{payrollRecord.professional_tax}</span></div>
                    <div className="flex justify-between text-slate-300"><span>LOP ({payrollRecord.lop_days} days)</span> <span>₹{payrollRecord.lop_deduction}</span></div>
                    <div className="flex justify-between font-bold text-red-400 pt-2 border-t border-red-500/20">
                      <span>Total</span> <span>₹{payrollRecord.total_deductions}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Attendance Summary */}
              <div className="bg-white/5 rounded-2xl p-4 text-sm flex justify-between items-center">
                 <div className="text-slate-400 space-y-1">
                    <p>Calendar Days: <span className="text-white">{payrollRecord.calendar_days || 30}</span></p>
                    <p>Paid Weekly Offs: <span className="text-white">{payrollRecord.weekly_off_days || 0}</span></p>
                    <p>Working Days: <span className="text-white">{payrollRecord.working_days}</span></p>
                    <p>Present/Leave: <span className="text-white">{payrollRecord.present_days} / {payrollRecord.paid_leaves}</span></p>
                 </div>
                 <div className="text-right text-slate-400 flex flex-col justify-end">
                    <p>LOP Days</p>
                    <p className="text-2xl font-bold text-red-400">{payrollRecord.lop_days}</p>
                 </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {payrollRecord && isConfigured && !editingStructure && (
          <div className="p-6 border-t border-white/10 bg-black/20 flex flex-wrap gap-3">
            <button 
              onClick={() => onGeneratePayslip({ employee: employeeData, record: payrollRecord })}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition font-medium"
            >
              <Download size={18} /> View Payslip
            </button>
            
            {payrollRecord.status !== 'Paid' && (
              <button 
                onClick={() => updatePayrollStatus('Paid')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition font-medium"
              >
                <CheckCircle2 size={18} /> Mark as Paid
              </button>
            )}

            {payrollRecord.status === 'Processing' && (
              <button 
                onClick={() => updatePayrollStatus('On Hold')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl transition font-medium"
              >
                <AlertCircle size={18} /> Hold Payroll
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
