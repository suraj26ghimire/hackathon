import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminRedirect from './pages/AdminRedirect';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Scholarships from './pages/Scholarships';
import ScholarshipDetails from './pages/ScholarshipDetails';

const PrivateRoute = ({ children }) => {
    const { user, loading } = React.useContext(AuthContext);
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-background flex flex-col">
                    <Navbar />
                    <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                            <Route path="/scholarships" element={<PrivateRoute><Scholarships /></PrivateRoute>} />
                            <Route path="/scholarships/:id" element={<PrivateRoute><ScholarshipDetails /></PrivateRoute>} />
                            <Route path="/admin" element={<AdminRedirect />} />
                        </Routes>
                    </main>
                    {/* <ChatbotWidget /> */}
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
