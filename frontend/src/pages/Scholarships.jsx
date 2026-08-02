import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ScholarshipCard from '../components/ScholarshipCard';
import { Search, Filter, X } from 'lucide-react';

const Scholarships = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all | matched
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, scholRes] = await Promise.all([
                    api.get('recommendations/'),
                    api.get('scholarships/list/')
                ]);
                setRecommendations(recRes.data);
                setScholarships(scholRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const matchMap = recommendations.reduce((acc, rec) => {
        acc[rec.scholarship.id] = rec.match_percentage;
        return acc;
    }, {});

    const filtered = scholarships.filter(s =>
        [s.title, s.organization, s.eligible_field, s.province_restriction, s.eligibility]
            .join(' ').toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => (matchMap[b.id] || 0) - (matchMap[a.id] || 0));
    const displayScholarships = sorted;
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="label-accent block mb-1">Database</span>
                    <h1 className="text-3xl font-bold text-text">Scholarship Database</h1>
                    <p className="text-text-muted mt-1">{scholarships.length} scholarships available</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder='Search e.g. "BCA scholarships", "Girls scholarship", "Karnali"...'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-muted">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-surface rounded-2xl h-52 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : displayScholarships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayScholarships.map(scholarship => (
                        <ScholarshipCard
                            key={scholarship.id}
                            scholarship={scholarship}
                            matchPercentage={matchMap[scholarship.id] ?? 0}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-text-muted">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No scholarships found</p>
                    <p className="text-sm">Try different search terms</p>
                </div>
            )}
        </div>
    );
};

export default Scholarships;
