import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, GraduationCap, Calendar } from 'lucide-react';

const ScholarshipCard = ({ scholarship, matchPercentage }) => {
    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-text leading-tight">
                    {scholarship.title}
                </h3>
                {matchPercentage !== undefined && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${matchPercentage >= 80 ? 'bg-green-100 text-green-800' : matchPercentage >= 50 ? 'bg-accent-light text-accent' : 'bg-gray-100 text-gray-800'}`}>
                        {matchPercentage}% Match
                    </span>
                )}
            </div>
            
            <div className="space-y-2 mb-6 text-sm text-text-muted">
                <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>
                        {scholarship.organization}
                        {scholarship.country ? ` · ${scholarship.country}` : ''}
                    </span>
                </div>
                {scholarship.province_restriction && (
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{scholarship.province_restriction}</span>
                    </div>
                )}
                {scholarship.eligible_education_level && (
                    <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span>{scholarship.eligible_education_level}</span>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                        Deadline: {scholarship.deadline 
                            ? scholarship.deadline 
                            : (scholarship.deadline_text ? `${scholarship.deadline_text.substring(0, 30)}...` : 'Check official page')}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                {/* <span className="text-primary font-medium text-sm">
                    {scholarship.benefits.substring(0, 30)}...
                </span> */}
                <Link
                    to={`/scholarships/${scholarship.id}`}
                    className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-full text-sm font-medium transition"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default ScholarshipCard;
