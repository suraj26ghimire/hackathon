import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Building, MapPin, GraduationCap, Calendar, ExternalLink, Bookmark, BookmarkCheck, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const ScholarshipDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scholarship, setScholarship] = useState(null);
    const [match, setMatch] = useState(null);
    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [scholRes, recRes, bookmarksRes] = await Promise.all([
                    api.get(`scholarships/list/${id}/`),
                    api.get('recommendations/'),
                    api.get('scholarships/bookmarks/')
                ]);
                setScholarship(scholRes.data);
                const rec = recRes.data.find(r => r.scholarship.id === parseInt(id));
                if (rec) setMatch(rec);
                const bk = bookmarksRes.data.find(b => b.scholarship === parseInt(id));
                if (bk) {
                    setBookmarked(true);
                    setBookmarkId(bk.id);
                }
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const toggleBookmark = async () => {
        try {
            if (bookmarked) {
                await api.delete(`scholarships/bookmarks/${bookmarkId}/`);
                setBookmarked(false);
                setBookmarkId(null);
            } else {
                const res = await api.post('scholarships/bookmarks/', { scholarship: parseInt(id) });
                setBookmarked(true);
                setBookmarkId(res.data.id);
            }
        } catch (err) {
            console.error("Bookmark failed", err);
        }
    };

    if (loading) return <div className="text-center py-20 text-text-muted animate-pulse">Loading scholarship details...</div>;
    if (!scholarship) return <div className="text-center py-20 text-text-muted">Scholarship not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-text-muted hover:text-text transition">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Scholarships</span>
            </button>

            {/* Header Card */}
            <div className="bg-hero rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <span className="label-accent block mb-2">Scholarship</span>
                        <h1 className="text-3xl font-bold mb-2 text-text">{scholarship.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mt-3">
                            <div className="flex items-center gap-1"><Building className="w-4 h-4" />{scholarship.organization}</div>
                            {scholarship.province_restriction && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{scholarship.province_restriction}</div>}
                            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />Deadline: {scholarship.deadline}</div>
                        </div>
                    </div>
                    <button
                        onClick={toggleBookmark}
                        className="ml-4 p-3 bg-surface/80 rounded-xl hover:bg-surface transition border border-gray-100"
                        title={bookmarked ? "Remove bookmark" : "Bookmark this"}
                    >
                        {bookmarked ? <BookmarkCheck className="w-6 h-6 text-accent" /> : <Bookmark className="w-6 h-6 text-text-muted" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
                        <span className="label-accent block mb-2">Overview</span>
                        <h2 className="text-lg font-bold text-text mb-3">About This Scholarship</h2>
                        <p className="text-text-muted leading-relaxed">{scholarship.description}</p>
                    </div>

                    {/* Eligibility */}
                    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
                        <span className="label-accent block mb-2">Requirements</span>
                        <h2 className="text-lg font-bold text-text mb-3">Eligibility Criteria</h2>
                        <p className="text-text-muted mb-4">{scholarship.eligibility}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {scholarship.minimum_gpa && (
                                <div className="bg-accent-light rounded-lg p-3 text-sm">
                                    <span className="text-primary font-semibold block">Min. GPA</span>
                                    <span className="text-text">{scholarship.minimum_gpa}</span>
                                </div>
                            )}
                            {scholarship.eligible_education_level && (
                                <div className="bg-accent-light rounded-lg p-3 text-sm">
                                    <span className="text-primary font-semibold block">Education Level</span>
                                    <span className="text-text capitalize">{scholarship.eligible_education_level}</span>
                                </div>
                            )}
                            {scholarship.eligible_field && (
                                <div className="bg-accent-light rounded-lg p-3 text-sm">
                                    <span className="text-primary font-semibold block">Field of Study</span>
                                    <span className="text-text capitalize">{scholarship.eligible_field}</span>
                                </div>
                            )}
                            {scholarship.gender_requirement && (
                                <div className="bg-accent-light rounded-lg p-3 text-sm">
                                    <span className="text-primary font-semibold block">Gender</span>
                                    <span className="text-text capitalize">{scholarship.gender_requirement}</span>
                                </div>
                            )}
                            {scholarship.income_requirement_max && (
                                <div className="bg-accent-light rounded-lg p-3 text-sm">
                                    <span className="text-primary font-semibold block">Max Family Income</span>
                                    <span className="text-text">NPR {Number(scholarship.income_requirement_max).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
                        <span className="label-accent block mb-2">Rewards</span>
                        <h2 className="text-lg font-bold text-text mb-3">Benefits</h2>
                        <p className="text-text-muted">{scholarship.benefits}</p>
                    </div>

                    {/* Required Documents */}
                    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
                        <span className="label-accent block mb-2">Documents</span>
                        <h2 className="text-lg font-bold text-text mb-3">Required Documents</h2>
                        <ul className="space-y-2">
                            {scholarship.required_documents.split(',').map((doc, i) => (
                                <li key={i} className="flex items-center gap-2 text-text">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {doc.trim()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column - AI Match & Apply */}
                <div className="space-y-6">
                    {/* Match Score */}
                    {match && (
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
                            {/* <span className="label-accent block mb-2">AI Match</span> */}
                            <h2 className="text-lg font-bold text-text mb-4">Your Match</h2>
                            <div className="flex items-center justify-center mb-4">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-primary/20 ${match.match_percentage >= 80 ? 'bg-green-500' : match.match_percentage >= 50 ? 'bg-accent' : 'bg-gray-400'}`}>
                                    {match.match_percentage}%
                                </div>
                            </div>
                            <div className="space-y-2">
                                {match.reasons.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-green-700">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{r.replace('✓ ', '')}</span>
                                    </div>
                                ))}
                                {match.missing.map((m, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-red-500">
                                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{m.replace('✗ ', '')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Apply Button */}
                    {match.match_percentage === 100 ?(
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
                            <a
                                href={scholarship.official_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 btn-primary py-3 font-semibold"
                            >
                            <ExternalLink className="w-5 h-5" />
                                Apply Now
                            </a>

                            <p className="text-xs text-center text-gray-400 mt-3">
                                Deadline: {scholarship.deadline}
                            </p>
                        </div>
                    ): (
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
                            <p className="text-center text-red-500 font-medium">
                                You are not eligible to apply.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScholarshipDetails;
