import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { IndianRupee, Calculator, Download, User, Calendar, Search, Filter, AlertCircle, FileText, CheckCircle2, MoreHorizontal, Settings } from 'lucide-react';
import { format, getDaysInMonth, eachDayOfInterval, isSaturday, isSunday } from 'date-fns';
import toast from 'react-hot-toast';
import PayrollDrawer from './components/PayrollDrawer';
import Payslip from './components/Payslip';

export default function Payroll() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Drawer/Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [payslipData, setPayslipData] = useState<any>(null);

  // Settings State
  const [companySettings, setCompanySettings] = useState<any>({ saturday_policy: 'weekly_off', sunday_policy: 'weekly_off' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all approved employees
      const { data: emps, error: empError } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('is_approved', true)
        .order('full_name');

      if (empError) throw empError;
      setEmployees(emps || []);

      // 2. Fetch existing payroll records for selected month
      const { data: records, error: recError } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('payroll_month', selectedMonth);

      if (recError) throw recError;
      setPayrollRecords(records || []);

      // 3. Fetch Company Settings
      const { data: settings } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (settings) {
        setCompanySettings(settings);
      }

    } catch (err) {
      console.error('Error fetching payroll', err);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    setProcessing(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const dateForMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const calendarDays = getDaysInMonth(dateForMonth);
      const startDate = format(dateForMonth, 'yyyy-MM-dd');
      const endDate = format(new Date(parseInt(year), parseInt(month) - 1, calendarDays), 'yyyy-MM-dd');

      const allDaysInMonth = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
      let weeklyOffCount = 0;
      allDaysInMonth.forEach(day => {
        if (isSaturday(day) && companySettings.saturday_policy === 'weekly_off') weeklyOffCount++;
        if (isSunday(day) && companySettings.sunday_policy === 'weekly_off') weeklyOffCount++;
      });
      
      const expectedWorkingDays = calendarDays - weeklyOffCount;

      const newRecords = [];

      for (const emp of employees) {
        // Fetch Salary Structure
        const { data: structure } = await supabase
          .from('salary_structures')
          .select('*')
          .eq('employee_id', emp.id)
          .single();

        if (!structure || structure.basic_salary === 0) {
          continue; // Skip if salary not configured
        }

        // Fetch Attendance
        const { count: presentCount } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('employee_id', emp.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('status', 'present');

        // Fetch Approved Leaves
        const { data: leaves } = await supabase
          .from('leave_requests')
          .select('days')
          .eq('employee_id', emp.id)
          .eq('status', 'approved')
          .gte('start_date', startDate)
          .lte('end_date', endDate);

        const paidLeaves = leaves?.reduce((sum, l) => sum + l.days, 0) || 0;
        const presentDays = presentCount || 0;
        
        // Include weekly offs as "paid" days automatically
        const totalEffectiveDays = presentDays + paidLeaves + weeklyOffCount;
        
        // Calculate LOP (Loss of Pay) based on calendar days, ensuring it never goes below 0
        const lopDays = Math.max(0, calendarDays - totalEffectiveDays);
        
        // Calculate Earnings
        const grossSalary = structure.basic_salary + structure.hra + structure.allowances;
        // Daily rate based on exact calendar days in the month
        const dailyRate = grossSalary / calendarDays;
        const lopDeduction = lopDays * dailyRate;
        
        // Calculate Deductions
        const totalDeductions = structure.pf_deduction + structure.professional_tax + structure.tds + lopDeduction;
        const netSalary = Math.max(0, grossSalary - totalDeductions);

        const record = {
          employee_id: emp.id,
          payroll_month: selectedMonth,
          calendar_days: calendarDays,
          weekly_off_days: weeklyOffCount,
          working_days: expectedWorkingDays,
          present_days: presentDays,
          paid_leaves: paidLeaves,
          lop_days: lopDays,
          basic_salary: structure.basic_salary,
          hra: structure.hra,
          allowances: structure.allowances,
          bonus: structure.other_earnings || 0,
          gross_salary: Math.round(grossSalary),
          pf_deduction: structure.pf_deduction,
          professional_tax: structure.professional_tax,
          tds: structure.tds,
          lop_deduction: Math.round(lopDeduction),
          total_deductions: Math.round(totalDeductions),
          net_salary: Math.round(netSalary),
          status: 'Processing'
        };

        newRecords.push(record);
      }

      // Upsert records to database
      if (newRecords.length > 0) {
        const { error } = await supabase
          .from('payroll_records')
          .upsert(newRecords, { onConflict: 'employee_id, payroll_month' });
        
        if (error) throw error;
        toast.success(`Successfully processed payroll for ${newRecords.length} employees!`);
        fetchPayrollData();
      } else {
        toast.error('No configurable salaries found. Please configure salary structures first.');
      }
      
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // If companySettings.id is missing, we just insert.
      // But we fetched it so it should have an id. If not, don't pass id so it inserts.
      const payload: any = {
        saturday_policy: companySettings.saturday_policy,
        sunday_policy: companySettings.sunday_policy,
        updated_at: new Date().toISOString()
      };
      if (companySettings.id) {
        payload.id = companySettings.id;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      setCompanySettings(data);
      toast.success('Company weekend settings updated!');
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Error saving settings', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleViewEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    setIsDrawerOpen(true);
  };

  // Combine Employee Data with Payroll Records for the Table
  const tableData = useMemo(() => {
    let data = employees.map(emp => {
      const record = payrollRecords.find(r => r.employee_id === emp.id);
      return { emp, record };
    });

    if (searchQuery) {
      data = data.filter(d => 
        d.emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.emp.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Not Configured') {
        data = data.filter(d => !d.record);
      } else {
        data = data.filter(d => d.record?.status === statusFilter);
      }
    }

    return data;
  }, [employees, payrollRecords, searchQuery, statusFilter]);

  // Calculate Summaries
  const summary = useMemo(() => {
    return payrollRecords.reduce((acc, curr) => {
      acc.gross += curr.gross_salary || 0;
      acc.deductions += curr.total_deductions || 0;
      acc.net += curr.net_salary || 0;
      if (curr.status !== 'Paid') acc.pending += curr.net_salary || 0;
      return acc;
    }, { gross: 0, deductions: 0, net: 0, pending: 0 });
  }, [payrollRecords]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Payroll & Salary Engine</h1>
          <p className="text-[#cbd5e1] text-sm">Manage monthly payroll, salary calculations and payslips</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
            <Calendar size={18} className="text-[#e879f9]" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-white focus:ring-0 cursor-pointer"
            />
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            <Settings size={20} />
            <span className="hidden md:inline">Settings</span>
          </button>
          <button
            onClick={processPayroll}
            disabled={processing || employees.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
          >
            <Calculator size={18} />
            {processing ? 'Processing...' : 'Process Payroll'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Employees', value: employees.length, icon: User, color: 'text-blue-400' },
          { label: 'Gross Payroll', value: `₹${summary.gross.toLocaleString()}`, icon: IndianRupee, color: 'text-indigo-400' },
          { label: 'Total Deductions', value: `₹${summary.deductions.toLocaleString()}`, icon: AlertCircle, color: 'text-red-400' },
          { label: 'Net Payable', value: `₹${summary.net.toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Pending Payroll', value: `₹${summary.pending.toLocaleString()}`, icon: Calculator, color: 'text-orange-400' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/10 transition backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-xl font-bold text-white truncate">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search employee by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-2.5 pl-12 pr-4 text-white focus:outline-none focus:ring-0 placeholder-slate-500 text-sm"
          />
        </div>
        <div className="w-px bg-white/10 hidden sm:block"></div>
        <div className="flex items-center gap-2 px-2">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-200 border-none focus:outline-none focus:ring-0 text-sm cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="All" className="bg-slate-900">All Status</option>
            <option value="Processing" className="bg-slate-900">Processing</option>
            <option value="Pending" className="bg-slate-900">Pending</option>
            <option value="On Hold" className="bg-slate-900">On Hold</option>
            <option value="Paid" className="bg-slate-900">Paid</option>
            <option value="Not Configured" className="bg-slate-900">Not Configured</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-[#cbd5e1] text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold whitespace-nowrap">Employee</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Gross Salary</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">W.D</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Present</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">LOP</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Deductions</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Net Salary</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Status</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={9} className="p-12 text-center text-slate-400">Loading payroll data...</td></tr>
              ) : tableData.length === 0 ? (
                <tr><td colSpan={9} className="p-12 text-center text-slate-400">No records found matching filters.</td></tr>
              ) : (
                tableData.map(({ emp, record }) => (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors text-white">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                          {emp.full_name?.charAt(0) || <User size={16} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 whitespace-nowrap">{emp.full_name}</div>
                          <div className="text-xs text-indigo-300 font-mono">{emp.employee_id || 'ID Pending'}</div>
                        </div>
                      </div>
                    </td>
                    
                    {!record ? (
                      <td colSpan={6} className="p-4 text-center">
                        <span className="text-orange-300 text-sm italic opacity-80 flex items-center justify-center gap-2">
                          <AlertCircle size={14} /> Salary Not Configured
                        </span>
                      </td>
                    ) : (
                      <>
                        <td className="p-4 text-right font-medium text-slate-300">
                          ₹{record.gross_salary?.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm font-semibold">{record.working_days}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                            {record.present_days === 0 && record.paid_leaves === 0 ? '-' : record.present_days + record.paid_leaves}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full font-bold text-xs ${record.lop_days > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                            {record.lop_days}
                          </span>
                        </td>
                        <td className="p-4 text-right text-red-400 font-medium text-sm">
                          -₹{record.total_deductions?.toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            ₹{record.net_salary?.toLocaleString()}
                          </div>
                        </td>
                      </>
                    )}

                    <td className="p-4 text-center">
                      {!record ? (
                        <span className="text-xs text-slate-500">-</span>
                      ) : (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          record.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 
                          record.status === 'On Hold' ? 'bg-red-500/20 text-red-400' : 
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleViewEmployee(emp)}
                        className="px-4 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-semibold whitespace-nowrap"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <PayrollDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        employeeData={selectedEmployee}
        payrollRecord={payrollRecords.find(r => r.employee_id === selectedEmployee?.id)}
        onUpdate={fetchPayrollData}
        onGeneratePayslip={(data) => setPayslipData(data)}
      />

      {/* Payslip Modal */}
      {payslipData && (
        <Payslip 
          payrollData={payslipData}
          onClose={() => setPayslipData(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#11133c] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <h3 className="text-xl font-bold text-white mb-6">Payroll Settings</h3>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Saturday Policy</label>
                <select
                  value={companySettings.saturday_policy}
                  onChange={(e) => setCompanySettings({...companySettings, saturday_policy: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="weekly_off" className="bg-[#11133c]">Paid Weekly Off</option>
                  <option value="working_day" className="bg-[#11133c]">Working Day</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">If set to 'Paid Weekly Off', Saturdays are automatically counted as paid days.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Sunday Policy</label>
                <select
                  value={companySettings.sunday_policy}
                  onChange={(e) => setCompanySettings({...companySettings, sunday_policy: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="weekly_off" className="bg-[#11133c]">Paid Weekly Off</option>
                  <option value="working_day" className="bg-[#11133c]">Working Day</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">If set to 'Paid Weekly Off', Sundays are automatically counted as paid days.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition shadow-lg disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
