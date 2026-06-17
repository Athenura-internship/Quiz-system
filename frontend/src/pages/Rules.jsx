import React from 'react';

const Rules = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Platform Rules</h1>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 prose prose-slate max-w-none">
          <p className="lead text-lg text-slate-600 mb-8">
            Welcome to Athenura. To ensure a fair and competitive environment for all interns, we strictly enforce the following rules and guidelines during assessments.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Academic Integrity</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>All work submitted must be your own original work.</li>
            <li>You may not receive assistance from any other person during an active assessment.</li>
            <li>Using unauthorized third-party tools, browser extensions, or search engines during proctored quizzes is prohibited.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Assessment Conduct</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>Ensure you have a stable internet connection before beginning.</li>
            <li>Once an assessment has started, the timer cannot be paused.</li>
            <li>Leaving the browser tab or window may be logged and reported to the system administrator.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Badges and Scoring</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>Points are awarded based on correctness and completion time.</li>
            <li>Badges are awarded automatically upon the finalization of a contest by an admin.</li>
            <li>Disputed scores must be reported within 24 hours of the contest concluding.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Account Sharing</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>Your intern account and Unique ID are strictly personal.</li>
            <li>Sharing login credentials will result in immediate disqualification from the program.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Rules;
