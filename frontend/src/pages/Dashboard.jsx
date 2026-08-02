import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ScholarshipCard from '../components/ScholarshipCard';
import { ArrowRight, BookMarked, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get('recommendations/');
                setRecommendations(res.data.slice(0, 3)); // Top 3
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
            }
            setLoading(false);
        };
        fetchRecommendations();
    }, []);

    const isProfileComplete = user?.profile?.education_level && user?.profile?.gpa;

    return (
        <div className="space-y-8">
            
            <div className="bg-hero rounded-2xl p-8 shadow-sm">
                {/* <span className="label-accent inline-block bg-accent-light px-3 py-1 rounded-full mb-3">AI-Powered</span> */}
                <h1 className="text-3xl font-bold mb-2 text-text">Welcome back, {user?.username}! </h1>
                <p className="text-text-muted mb-6">Let's find the perfect scholarship for your educational journey.</p>
                
                {!isProfileComplete && (
                    <div className="bg-surface/80 backdrop-blur-sm rounded-xl p-4 inline-block border border-gray-100">
                        <p className="text-sm font-medium mb-2 text-text">Complete your profile to get AI-powered matches.</p>
                        <Link to="/profile" className="inline-flex items-center text-sm btn-secondary px-4 py-2">
                            Complete Profile <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-text">Top Matches For You</h2>
                        <Link to="/scholarships" className="text-primary hover:underline text-sm font-medium">View all matches</Link>
                    </div>
                    
                    {loading ? (
                        <div className="text-text-muted">Loading your matches...</div>
                    ) : recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recommendations.map((rec) => (
                                <ScholarshipCard 
                                    key={rec.scholarship.id} 
                                    scholarship={rec.scholarship} 
                                    matchPercentage={rec.match_percentage} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="glass p-8 text-center rounded-2xl">
                            <p className="text-text-muted mb-4">No exact matches found right now.</p>
                            <Link to="/profile" className="text-primary hover:underline font-medium">Update your profile to improve matches</Link>
                        </div>
                    )}
                </div>

                
                <div className="space-y-6">

                    <div className="glass rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <BookMarked className="w-5 h-5 text-accent" />
                            <h3 className="text-lg font-bold text-text">Saved Scholarships</h3>
                        </div>
                        <p className="text-sm text-text-muted">You haven't saved any scholarships yet. Browse and bookmark them to keep track.</p>
                        <Link to="/scholarships" className="inline-block mt-3 text-sm text-primary hover:underline font-medium">Browse Database</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
