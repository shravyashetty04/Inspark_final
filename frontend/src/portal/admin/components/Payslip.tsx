import { format } from 'date-fns';
import { Download, Printer, X } from 'lucide-react';
import React from 'react';

interface PayslipProps {
  payrollData: any;
  onClose: () => void;
}

export default function Payslip({ payrollData, onClose }: PayslipProps) {
  if (!payrollData) return null;

  const { employee, record } = payrollData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl print:shadow-none print:max-h-none print:w-full print:m-0 print:rounded-none">
        {/* Actions - Hidden when printing */}
        <div className="sticky top-0 bg-slate-100 p-4 border-b flex justify-between items-center print:hidden z-10">
          <h2 className="text-xl font-bold text-slate-800">Payslip Preview</h2>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <Printer size={18} /> Print
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div className="p-8 sm:p-12 print:p-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-black text-indigo-700 tracking-tight mb-1">INSPARK</h1>
              <p className="text-sm text-slate-500">Inspark Technologies Private Limited</p>
              <p className="text-sm text-slate-500">123 Tech Park, Innovation Hub, Bangalore 560001</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">Payslip</h2>
              <p className="text-slate-600 font-medium">For the month of {format(new Date(`${record.payroll_month}-01`), 'MMMM yyyy')}</p>
            </div>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
            <div className="space-y-3">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Employee Name:</span>
                <span className="font-semibold">{employee.full_name}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-semibold">{employee.employee_id}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Designation:</span>
                <span className="font-semibold capitalize">{employee.role}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Calendar Days:</span>
                <span className="font-semibold">{record.calendar_days || 30}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Paid Weekly Offs:</span>
                <span className="font-semibold">{record.weekly_off_days || 0}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Paid Govt Holidays:</span>
                <span className="font-semibold">{record.holiday_days || 0}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Working Days:</span>
                <span className="font-semibold">{record.working_days}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Present / Paid Leaves:</span>
                <span className="font-semibold">{record.present_days} / {record.paid_leaves}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Loss of Pay (LOP) Days:</span>
                <span className="font-semibold text-red-600">{record.lop_days}</span>
              </div>
            </div>
          </div>

          {/* Salary Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-0 mb-8 border border-slate-200 rounded-lg overflow-hidden">
            {/* Earnings */}
            <div>
              <div className="bg-slate-100 p-3 font-bold border-b border-slate-200 text-slate-700">Earnings</div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Basic Salary</span>
                  <span>₹{record.basic_salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>House Rent Allowance (HRA)</span>
                  <span>₹{record.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Special Allowances</span>
                  <span>₹{record.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bonus / Incentives</span>
                  <span>₹{record.bonus.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 flex justify-between font-bold border-t border-slate-200">
                <span>Gross Earnings</span>
                <span className="text-emerald-600">₹{record.gross_salary.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border-t md:border-t-0 md:border-l border-slate-200">
              <div className="bg-slate-100 p-3 font-bold border-b border-slate-200 text-slate-700">Deductions</div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Provident Fund (PF)</span>
                  <span>₹{record.pf_deduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Professional Tax</span>
                  <span>₹{record.professional_tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TDS</span>
                  <span>₹{record.tds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Loss of Pay (LOP) Deduction</span>
                  <span>₹{record.lop_deduction.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 flex justify-between font-bold border-t border-slate-200">
                <span>Total Deductions</span>
                <span className="text-red-600">₹{record.total_deductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Salary & Signature */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 md:p-6 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-900 mb-1">Net Salary Payable</p>
              <p className="text-xs text-indigo-700/70">Amount transferred to registered bank account</p>
            </div>
            <div className="text-3xl font-black text-indigo-700">
              ₹{record.net_salary.toLocaleString()}
            </div>
          </div>

          <div className="flex justify-between items-end pt-12">
            <div>
              <p className="text-xs text-slate-400">Status: <strong className={record.status === 'Paid' ? 'text-emerald-500' : 'text-orange-500'}>{record.status}</strong></p>
              {record.payment_date && <p className="text-xs text-slate-400 mt-1">Payment Date: {format(new Date(record.payment_date), 'dd MMM yyyy')}</p>}
            </div>
            <div className="text-center">
              <div className="border-b border-slate-300 w-48 mb-2"></div>
              <p className="text-sm font-semibold text-slate-600">Authorised Signatory</p>
            </div>
          </div>
          
          <div className="mt-12 text-center text-xs text-slate-400 border-t pt-4">
            This is a computer generated document and does not require a physical signature.
          </div>
        </div>
      </div>
    </div>
  );
}
