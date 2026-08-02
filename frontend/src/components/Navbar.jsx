import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 mb-8 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold text-text">ScholarSathi</span>
                    </Link>
                    
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/scholarships" className="text-text-muted hover:text-primary font-medium lowercase">scholarships</Link>
                                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                <Link to="/profile" className="flex items-center space-x-1 text-text-muted hover:text-primary">
                                    <UserIcon className="h-5 w-5" />
                                    <span>{user.username}</span>
                                </Link>
                                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-500 hover:text-red-700 ml-4">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`font-medium lowercase px-5 py-2 rounded-full transition ${
                                        isLoginPage
                                            ? 'border-2 border-primary text-primary'
                                            : 'text-text-muted hover:text-primary'
                                    }`}
                                >
                                    login
                                </Link>
                                <Link
                                    to="/register"
                                    className={`px-5 py-2 rounded-full transition font-medium ${
                                        isRegisterPage
                                            ? 'bg-primary text-white border-2 border-primary-dark hover:bg-primary-dark'
                                            : 'bg-primary text-white hover:bg-primary-dark'
                                    }`}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
