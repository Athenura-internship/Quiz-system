import React from 'react';

const Terms = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Terms & Conditions</h1>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 prose prose-slate max-w-none">
          <p className="lead text-lg text-slate-600 mb-8">
            Please read these Terms and Conditions carefully before using the Athenura platform. By accessing or using our services, you agree to be bound by these terms.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 mb-4">
            By registering for an account, accessing the dashboard, or participating in any assessments hosted on the Athenura platform, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Privacy & Data Collection</h2>
          <p className="text-slate-600 mb-4">
            We collect personal information such as your name, email address, and unique identifier to facilitate the assessment process. We do not sell your personal data to third parties. Performance metrics and scores may be shared with your program administrators.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. User Obligations</h2>
          <p className="text-slate-600 mb-4">
            You agree to provide true, accurate, current, and complete information about yourself during registration. You are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Intellectual Property</h2>
          <p className="text-slate-600 mb-4">
            All content included on the platform, such as text, graphics, logos, images, and software, is the property of Athenura or its content suppliers and protected by international copyright laws.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="text-slate-600 mb-4">
            Athenura shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
