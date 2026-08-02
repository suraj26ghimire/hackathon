import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
const EDUCATION_LEVELS = ['Plus Two', 'Bachelors', 'Masters', 'PhD'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        phone: '',
        province: '',
        district: '',
        education_level: '',
        university_school: '',
        field_of_study: '',
        current_semester: '',
        gpa: '',
        family_income: '',
        gender: '',
        disability_status: false,
        ethnicity: '',
        interests: '',
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.profile) {
            setFormData({
                phone: user.profile.phone || '',
                province: user.profile.province || '',
                district: user.profile.district || '',
                education_level: user.profile.education_level || '',
                university_school: user.profile.university_school || '',
                field_of_study: user.profile.field_of_study || '',
                current_semester: user.profile.current_semester || '',
                gpa: user.profile.gpa || '',
                family_income: user.profile.family_income || '',
                gender: user.profile.gender || '',
                disability_status: user.profile.disability_status || false,
                ethnicity: user.profile.ethnicity || '',
                interests: user.profile.interests || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError('');
        try {
            const res = await api.put('users/profile/', formData);
            setUser(res.data);
            setSuccess(true);
        } catch (err) {
            setError('Failed to save profile. Please try again.');
        }
        setSaving(false);
    };

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface";
    const selectClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface";
    const labelClass = "block text-sm font-medium text-text-muted mb-1";
    const sectionClass = "label-accent block mb-2";

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <span className="label-accent block mb-1">Your Profile</span>
                <h1 className="text-3xl font-bold text-text">My Profile</h1>
                <p className="text-text-muted mt-1">Complete your profile to get better scholarship matches.</p>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6">
                    ✅ Profile saved successfully! Your matches will be updated.
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                {/* Basic Info */}
                <section>
                    <span className={sectionClass}>Basic Info</span>
                    <h2 className="text-lg font-semibold text-text border-b border-gray-100 pb-2 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <input type="text" className={inputClass} value={user?.username || ''} readOnly disabled />
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" className={inputClass} value={user?.email || ''} readOnly disabled />
                        </div>
                        <div>
                            <label className={labelClass}>Phone</label>
                            <input type="text" name="phone" className={inputClass} value={formData.phone} onChange={handleChange} placeholder="98XXXXXXXX" />
                        </div>
                        <div>
                            <label className={labelClass}>Gender</label>
                            <select name="gender" className={selectClass} value={formData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                {GENDER_OPTIONS.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section>
                    <span className={sectionClass}>Location</span>
                    <h2 className="text-lg font-semibold text-text border-b border-gray-100 pb-2 mb-4">Location</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Province</label>
                            <select name="province" className={selectClass} value={formData.province} onChange={handleChange}>
                                <option value="">Select Province</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>District</label>
                            <input type="text" name="district" className={inputClass} value={formData.district} onChange={handleChange} placeholder="e.g. Kathmandu" />
                        </div>
                    </div>
                </section>

                {/* Education */}
                <section>
                    <span className={sectionClass}>Education</span>
                    <h2 className="text-lg font-semibold text-text border-b border-gray-100 pb-2 mb-4">Education</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Education Level</label>
                            <select name="education_level" className={selectClass} value={formData.education_level} onChange={handleChange}>
                                <option value="">Select Level</option>
                                {EDUCATION_LEVELS.map(e => <option key={e} value={e.toLowerCase()}>{e}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>University / School</label>
                            <input type="text" name="university_school" className={inputClass} value={formData.university_school} onChange={handleChange} placeholder="e.g. Tribhuvan University" />
                        </div>
                        <div>
                            <label className={labelClass}>Field of Study</label>
                            <input type="text" name="field_of_study" className={inputClass} value={formData.field_of_study} onChange={handleChange} placeholder="e.g. BCA, Engineering, Medicine" />
                        </div>
                        <div>
                            <label className={labelClass}>Current Semester</label>
                            <input type="text" name="current_semester" className={inputClass} value={formData.current_semester} onChange={handleChange} placeholder="e.g. 5th Semester" />
                        </div>
                        <div>
                            <label className={labelClass}>GPA (out of 4.0)</label>
                            <input type="number" name="gpa" step="0.01" min="0" max="4" className={inputClass} value={formData.gpa} onChange={handleChange} placeholder="e.g. 3.5" />
                        </div>
                    </div>
                </section>

                {/* Financial & Other */}
                <section>
                    <span className={sectionClass}>Background</span>
                    <h2 className="text-lg font-semibold text-text border-b border-gray-100 pb-2 mb-4">Financial & Background</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Annual Family Income (NPR)</label>
                            <input type="number" name="family_income" className={inputClass} value={formData.family_income} onChange={handleChange} placeholder="e.g. 350000" />
                        </div>
                        <div>
                            <label className={labelClass}>Ethnicity / Caste (Optional)</label>
                            <input type="text" name="ethnicity" className={inputClass} value={formData.ethnicity} onChange={handleChange} placeholder="e.g. Brahmin, Janajati, Dalit" />
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                            <input type="checkbox" id="disability_status" name="disability_status" className="w-4 h-4 text-primary" checked={formData.disability_status} onChange={handleChange} />
                            <label htmlFor="disability_status" className="text-sm font-medium text-text-muted">I have a disability</label>
                        </div>
                    </div>
                </section>

                {/* Interests */}
                <section>
                    <span className={sectionClass}>Interests</span>
                    <h2 className="text-lg font-semibold text-text border-b border-gray-100 pb-2 mb-4">Interests</h2>
                    <div>
                        <label className={labelClass}>Your Interests</label>
                        <textarea name="interests" rows={3} className={inputClass} value={formData.interests} onChange={handleChange} placeholder="e.g. Technology, Research, Sports, Arts..." />
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 font-semibold disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Profile & Get Matches'}
                </button>
            </form>
        </div>
    );
};

export default Profile;
