import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard';
import DomainReport from './pages/DomainReport';
import InternDashboard from './pages/InternDashboard';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Rules from './pages/Rules';
import Terms from './pages/Terms';

import ProfilePage from './components/Profile';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/Adminloginpage';
import QuizPage from './pages/QuizPage';
import CreateContest from './pages/CreateContest';
import MainLayout from './layout/MainLayout';
import PublicLayout from './layout/PublicLayout';
import NotFound from './pages/NotFound';
import ReviewQuiz from './pages/ReviewQuiz';
import AllContests from './pages/AllContests';
import ReviewQuestion from './pages/ReviewQuestion';
import AllInterns from './pages/AllInterns';
import UploadInterns from './pages/UploadInterns';
import ContestResults from './pages/ContestResults';

import Register from './pages/Register';

import MyQuizzes from './pages/MyQuizzes';
import UpcomingQuiz from './pages/UpcomingQuiz';
import InternLeaderboard from './pages/InternLeaderboard';
import QuizLeaderboard from './pages/QuizLeaderboard';


import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <div className="app-container">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/rules' element={<Rules />} />
          <Route path='/terms' element={<Terms />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/admin-login' element={<AdminLoginPage />} />
          <Route path='/register' element={<Register />} />
        </Route>

        {/* Dashboard routes protected by token */}
        <Route element={<ProtectedRoute />}>
          <Route path='/quiz/:id' element={<QuizPage />} />
          
          <Route element={<MainLayout />} >
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/intern-leaderboard" element={<InternLeaderboard />} />
            <Route path="/reports" element={<DomainReport />} />
            <Route path="/intern" element={<InternDashboard />} />
            <Route path="/my-quizzes" element={<MyQuizzes />} />
            <Route path="/upcoming" element={<UpcomingQuiz />} />
            <Route path="/intern/profile" element={<ProfilePage />} />
            <Route path="/quiz-leaderboard/:id" element={<QuizLeaderboard />} />
            <Route path="/create-contest" element={<CreateContest />} />
            <Route path="/contests" element={<AllContests />} />
            <Route path="/review-question" element={<ReviewQuestion />} />
            <Route path="/review-quiz" element={<ReviewQuiz />} />
            <Route path="/all-interns" element={<AllInterns />} />
            <Route path="/upload-interns" element={<UploadInterns />} />
            {/* Admin Dashboard Aliases to prevent 404s */}
            <Route path="/admin-dashboard" element={<DomainReport />} />
            <Route path="/admin/interns" element={<AllInterns />} />
            <Route path="/admin/contest-results/:id" element={<ContestResults />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;