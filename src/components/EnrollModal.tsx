import React, { useState } from 'react';
import {
  X,
  Fingerprint,
  User,
  Mail,
  Phone,
  Building,
  UserCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface EnrollModalProps {
  onClose: () => void;
}

type EnrollStep = 'details' | 'scanning' | 'success';

export function EnrollModal({ onClose }: EnrollModalProps) {
  const [step, setStep] = useState<EnrollStep>('details');

  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    role: 'Student',
    department: '',
  });

  const [biometricId, setBiometricId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setStep('scanning');

    // Temporary biometric simulation.
    // Later this will be replaced by the actual fingerprint sensor.
    setTimeout(async () => {
      const mockBioId = `BIO-${Math.floor(Math.random() * 9000) + 1000}`;

      const { data, error } = await supabase
        .from('people')
        .insert({
          employee_id: formData.employee_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          biometric_id: mockBioId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error enrolling person:', error);

        alert(`Failed to enroll person: ${error.message}`);

        setStep('details');
        return;
      }

      console.log('Person enrolled successfully:', data);

      setBiometricId(mockBioId);
      setStep('success');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#1E40AF] p-2 rounded-lg">
              <UserCircle className="w-6 h-6 text-white" />
            </div>

            <h2 className="text-black font-semibold">
              Enroll New Person
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">

          {/* ========================= */}
          {/* DETAILS STEP */}
          {/* ========================= */}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Employee ID */}
                <div className="md:col-span-2">
                  <label className="block text-black font-medium mb-2">
                    Employee ID *
                  </label>

                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    placeholder="e.g., EMP_002"
                    required
                  />
                </div>

                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-black font-medium mb-2">
                    Full Name *
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Email *
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Phone *
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="+1 234-567-8900"
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Role *
                  </label>

                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] appearance-none"
                      required
                    >
                      <option value="Student">Student</option>
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Department *
                  </label>

                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Information box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">
                  After submitting, you'll be prompted to scan the person's
                  fingerprint using a connected biometric device.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium"
                >
                  Continue to Scan
                </button>

              </div>

            </form>
          )}

          {/* ========================= */}
          {/* SCANNING STEP */}
          {/* ========================= */}

          {step === 'scanning' && (
            <div className="py-12">
              <div className="flex flex-col items-center gap-6">

                <div className="relative">

                  <div className="bg-[#1E40AF] p-8 rounded-full animate-pulse">
                    <Fingerprint className="w-20 h-20 text-white" />
                  </div>

                  <div className="absolute -top-2 -right-2">
                    <Loader2 className="w-10 h-10 text-[#1E40AF] animate-spin" />
                  </div>

                </div>

                <div className="text-center">

                  <h3 className="text-black font-semibold mb-2">
                    Scanning Fingerprint
                  </h3>

                  <p className="text-gray-600">
                    Please place finger on the biometric scanner...
                  </p>

                  <p className="text-gray-900 font-medium mt-4">
                    {formData.name}
                  </p>

                  <p className="text-gray-600">
                    {formData.role} • {formData.department}
                  </p>

                </div>

              </div>
            </div>
          )}

          {/* ========================= */}
          {/* SUCCESS STEP */}
          {/* ========================= */}

          {step === 'success' && (
            <div className="py-12">

              <div className="flex flex-col items-center gap-6">

                <div className="bg-[#1E40AF] p-8 rounded-full">
                  <CheckCircle className="w-20 h-20 text-white" />
                </div>

                <div className="text-center">

                  <h3 className="text-black font-semibold mb-2">
                    Enrollment Successful!
                  </h3>

                  <p className="text-gray-600 mb-6">
                    {formData.name} has been successfully enrolled
                  </p>

                  <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto space-y-3">

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Employee ID:
                      </span>

                      <span className="text-black font-medium">
                        {formData.employee_id}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Biometric ID:
                      </span>

                      <span className="text-black font-medium">
                        {biometricId}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Role:
                      </span>

                      <span className="text-black font-medium">
                        {formData.role}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Department:
                      </span>

                      <span className="text-black font-medium">
                        {formData.department}
                      </span>
                    </div>

                  </div>

                </div>

                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium"
                >
                  Done
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}