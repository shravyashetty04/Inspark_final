import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Phone, Home, MapPin, Upload, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
    emergencyContact: '',
    permanentAddress: '',
    currentAddress: '',
  });
  
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validation
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Invalid file format. Please upload PDF, JPG, or PNG.');
        return;
      }
      
      if (selectedFile.size > 3 * 1024 * 1024) {
        toast.error('File size must be less than 3MB (Vercel Limit).');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please upload an ID Proof document.');
      return;
    }

    setLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: formData.fullName,
              email: formData.email,
              dob: formData.dob,
              emergency_contact: formData.emergencyContact,
              permanent_address: formData.permanentAddress,
              current_address: formData.currentAddress,
              id_proof_base64: reader.result,
              id_proof_name: file.name,
              id_proof_type: file.type
            })
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Registration failed');
          }

          toast.success(result.message || 'Registration successful! Check your email for login credentials.', { duration: 6000 });
          navigate('/portal/login');
        } catch (err: any) {
          toast.error(err.message || 'An unexpected error occurred.');
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        toast.error("Failed to read file.");
        setLoading(false);
      };

    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0E2B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#7C3AED] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#9333EA] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo.png" alt="InSpark" className="h-16 rounded-2xl mx-auto shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Employee Onboarding</h1>
          <p className="text-slate-400">Complete your profile to join the portal</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    placeholder="john@insparktech.in"
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Emergency Contact</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="tel"
                    name="emergencyContact"
                    required
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Permanent Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Permanent Address</label>
                <div className="relative">
                  <Home className="absolute left-4 top-4 text-slate-400" size={20} />
                  <textarea
                    name="permanentAddress"
                    required
                    rows={3}
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 resize-none"
                    placeholder="Enter your permanent home address..."
                  ></textarea>
                </div>
              </div>

              {/* Current Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Current Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={20} />
                  <textarea
                    name="currentAddress"
                    required
                    rows={3}
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 resize-none"
                    placeholder="Enter your current residential address..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">ID Proof Document</label>
              <p className="text-xs text-slate-500 mb-2">Upload Aadhar, PAN, or Passport (PDF, JPG, PNG - Max 5MB)</p>
              
              <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-black/10">
                <input 
                  type="file" 
                  id="idProof"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                  <div className={`p-4 rounded-full ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {file ? <ShieldCheck size={28} /> : <Upload size={28} />}
                  </div>
                  <div className="text-sm text-slate-300">
                    {file ? (
                      <span className="font-medium text-emerald-400">{file.name}</span>
                    ) : (
                      <span>Drag & drop or <span className="text-indigo-400 font-medium">browse</span> to upload</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Registration...' : 'Submit Onboarding Form'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Already registered?{' '}
            <Link to="/portal/login" className="text-[#e879f9] hover:underline font-medium">
              Go to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
