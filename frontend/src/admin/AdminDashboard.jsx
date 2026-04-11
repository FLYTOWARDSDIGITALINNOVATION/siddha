import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Calendar, FileText, Trash2, Edit, Download, Upload, X, Check, Search, Users, Star, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AdminLayout from '../components/Layout/AdminLayout';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTests: 0,
        globalAverage: 0,
        activeToday: 0
    });
    const [chartData, setChartData] = useState({ performanceDistribution: [], performanceTrend: [] });
    const [users, setUsers] = useState([]);
    const [questionBanks, setQuestionBanks] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [reattemptRequests, setReattemptRequests] = useState([]);
    const [pendingRegistrations, setPendingRegistrations] = useState([]);
    const [requestType, setRequestType] = useState('registration'); // 'registration' or 'reattempt'
    const [reviews, setReviews] = useState([]);
    const [editingReview, setEditingReview] = useState(null);
    const [statsBank, setStatsBank] = useState(null);
    const [statsData, setStatsData] = useState({ viewers: [], attempts: [] });
    const [loadingStats, setLoadingStats] = useState(false);

    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : "https://jclsiddhaacademy.in");

    const fetchAllData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const statsResponse = await axios.get(`${API_URL}/api/admin/dashboard-stats`, config);
            setStats(statsResponse.data.stats);
            setChartData(statsResponse.data.charts);

            const usersResponse = await axios.get(`${API_URL}/api/admin/users`, config);
            setUsers(usersResponse.data);

            const qbResponse = await axios.get(`${API_URL}/api/admin/question-banks`, config);
            setQuestionBanks(qbResponse.data);

            const reRes = await axios.get(`${API_URL}/api/admin/reattempt-requests`, config);
            setReattemptRequests(reRes.data);

            const pendingRegRes = await axios.get(`${API_URL}/api/admin/pending-registrations`, config);
            setPendingRegistrations(pendingRegRes.data);

            const reviewsRes = await axios.get(`${API_URL}/api/admin/reviews`, config);
            setReviews(reviewsRes.data);

        } catch (err) {
            console.log("Using mock data as backend failed or unauthorized", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    }, [navigate]);

    const fetchBankStats = async (bankId) => {
        setLoadingStats(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/question-banks/${bankId}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatsData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student and all their records?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            alert('Failed to delete student: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReattemptAction = async (requestId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/admin/reattempt-requests/${requestId}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleApprovalAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = action === 'approve'
                ? `${API_URL}/api/admin/approve-registration/${id}`
                : `${API_URL}/api/admin/reject-registration/${id}`;

            await axios.put(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleToggleStatus = async (bank) => {
        const id = bank._id || bank.id;
        if (!id) {
            alert('Error: Question bank ID not found');
            return;
        }
        const newStatus = bank.status === 'published' ? 'disabled' : 'published';
        try {
            const token = localStorage.getItem('token');
            console.log(`Toggling status for ${id} to ${newStatus}`);
            await axios.patch(`${API_URL}/api/admin/question-banks/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            console.error("Status update error", err);
            alert('Failed to update test status: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReviewAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/admin/reviews/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReviewDelete = async (id) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const requestUpdateReview = async (id, newText) => {
        if (!newText.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/admin/reviews/${id}`, { text: newText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingReview(null);
            fetchAllData();
        } catch (err) {
            alert('Failed to update review: ' + (err.response?.data?.message || err.message));
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        setEditingBank(null);
        fetchAllData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question bank?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/question-banks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            console.error("Delete failed", err);
            const msg = err.response?.data?.message || err.message;
            alert(`Failed to delete: ${msg}`);
        }
    };

    const handleDownload = async (bank) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/question-banks/${bank._id}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const questionData = response.data;
            const contentType = (response.headers['content-type'] || response.headers['Content-Type'] || "");
            if (contentType.includes('application/octet-stream') || contentType.includes('application/pdf') || !Array.isArray(questionData)) {
                console.log("[DEBUG] Server sent a file or non-array data, downloading directly...");
                const blobResponse = await axios.get(`${API_URL}/api/admin/question-banks/${bank._id}/download`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([blobResponse.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', bank.filename || `${bank.title.replace(/\s+/g, '_')}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                return;
            }

            console.log("[DEBUG] Generating PDF from JSON data using html2pdf...");
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            const element = document.createElement('div');
            element.innerHTML = `
                <div style="padding: 20px; font-family: 'Arial', sans-serif;">
                    <h2 style="text-align: center; color: #1e3a8a; margin-bottom: 5px;">${bank.title}</h2>
                    <p style="text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                        Difficulty: ${bank.difficulty || 'N/A'} | Total Questions: ${questionData.length}
                    </p>
                    <hr style="margin-bottom: 25px; border: 1px solid #e5e7eb;"/>
                    ${questionData.map((q, i) => `
                        <div style="margin-bottom: 20px; page-break-inside: avoid;">
                            <p style="font-weight: 600; font-size: 14px; margin-bottom: 10px;">${i + 1}. ${q.question}</p>
                            ${q.options && Array.isArray(q.options) ? q.options.map((opt, j) => `
                                <p style="margin-left: 20px; font-size: 13px; margin-bottom: 4px; color: #374151;">
                                    ${String.fromCharCode(97 + j)}) ${opt}
                                </p>
                            `).join('') : ''}
                            ${q.answer !== undefined ? `
                                <p style="margin-left: 20px; color: #16a34a; font-size: 13px; font-style: italic; margin-top: 8px;">
                                    Answer: ${typeof q.answer === 'number' && q.options ? q.options[q.answer] : q.answer}
                                </p>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;

            const opt = {
                margin: 10,
                filename: `${bank.title.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().from(element).set(opt).save();
            console.log("[DEBUG] PDF download triggered.");

        } catch (err) {
            console.error("Download failed", err);
            const msg = err.response?.data?.message || err.message;
            alert("Failed to download or generate PDF: " + msg);
        }
    };


return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="p-4 md:p-8 lg:p-12">

            {/* Header for all pages */}
            <header className="flex flex-col md:flex-row justify-between items-start mb-8 lg:mb-10 gap-6">
                <div>
                    {activeTab === 'Overview' && (
                        <>
                            <h2 className="text-4xl font-serif font-bold text-[#0F172A] mb-2">Dashboard Overview</h2>
                            <p className="text-slate-500">Monitor global performance and insights</p>
                        </>
                    )}
                    {activeTab === 'Question Vault' && (
                        <>
                            <h2 className="text-4xl font-serif font-bold text-[#0F172A] mb-2">Question Bank Vault</h2>
                            <p className="text-slate-500">Manage your question repositories</p>
                        </>
                    )}
                    {activeTab === 'Students' && (
                        <>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#0F172A] mb-1 md:mb-2">Student Management</h2>
                            <p className="text-slate-500 text-sm md:text-base">Track individual student progress</p>
                        </>
                    )}
                    {activeTab === 'Requests' && (
                        <>
                            <h2 className="text-4xl font-serif font-bold text-[#0F172A] mb-2">Re-attempt Requests</h2>
                            <p className="text-slate-500">Manage student requests for test re-takes</p>
                        </>
                    )}

                    {activeTab === 'Approvals' && (
                        <>
                            <h2 className="text-4xl font-serif font-bold text-[#0F172A] mb-2">Registration Approvals</h2>
                            <p className="text-slate-500">Approve or reject new user registrations</p>
                        </>
                    )}
                    {activeTab === 'Reviews' && (
                        <>
                            <h2 className="text-4xl font-serif font-bold text-[#0F172A] mb-2">Review Management</h2>
                            <p className="text-slate-500">Moderate and approve student testimonials</p>
                        </>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {activeTab === 'Question Vault' && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="w-full sm:w-auto bg-[#C2410C] hover:bg-[#9a3412] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-900/10"
                        >
                            <Upload size={16} /> Upload New
                        </button>
                    )}
                    {/* Tab buttons removed as they are now in the sidebar */}
                </div>
            </header>

            {/* CONTENT: OVERVIEW */}
            {activeTab === 'Overview' && (
                <div className="space-y-12">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        <OverviewCard icon={<Users size={24} className="text-blue-500" />} value={stats.totalStudents} label="Total Students" />
                        <OverviewCard icon={<FileText size={24} className="text-teal-500" />} value={stats.totalTests} label="Total Tests" />
                        <OverviewCard icon={<TrendingUp size={24} className="text-orange-500" />} value={`${stats.globalAverage}%`} label="Global Average" />
                        <OverviewCard icon={<Calendar size={24} className="text-green-500" />} value={stats.activeToday} label="Active Today" />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-gray-800 mb-6">Performance Distribution</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData.performanceDistribution} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="score" fill="#0D9488" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-serif font-bold text-gray-800 mb-6">Monthly Performance Trend</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData.performanceTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="score" stroke="#C2410C" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT: QUESTION VAULT */}
            {activeTab === 'Question Vault' && (
                <div>
                    <div className="mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={`Search question banks...`}
                                className="pl-10 pr-4 py-2 w-full rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {questionBanks.length > 0 ?
                            questionBanks.map((bank) => (
                                <div key={bank._id || bank.id} className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 hover:shadow-sm transition-shadow">
                                    <div className="w-full">
                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-1">
                                            <h4 className="text-base md:text-lg font-bold text-slate-900">{bank.title}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${bank.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {bank.difficulty}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider ${bank.category === 'AIAPGET' ? 'bg-indigo-100 text-indigo-700' : bank.category === 'MRB' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>
                                                {bank.category || 'Both'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                                            <span>{bank.questionsCount || bank.questions} questions</span>
                                            <span>Uploaded {new Date(bank.createdAt || bank.uploaded).toLocaleDateString()}</span>
                                            <span>{bank.attempts} attempts</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter md:hidden">Status:</span>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter hidden md:block">Test Status</span>
                                                <button
                                                    onClick={() => handleToggleStatus(bank)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${bank.status === 'published' ? 'bg-green-500' : 'bg-slate-300'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bank.status === 'published' ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                                <span className={`text-[10px] font-bold mt-1 uppercase hidden md:block ${bank.status === 'published' ? 'text-green-600' : 'text-slate-400'}`}>
                                                    {bank.status === 'published' ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-px h-8 bg-slate-100 mx-1 hidden md:block"></div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => {
                                                    setStatsBank(bank);
                                                    fetchBankStats(bank._id);
                                                }} 
                                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" 
                                                title="Viewers & Attempts"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => handleDownload(bank)} className="p-2 text-slate-400 hover:text-teal-600 transition-colors" title="Download"><Download size={18} /></button>
                                            <button onClick={() => setEditingBank(bank)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(bank._id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400">
                                    No question banks found.
                                </div>
                            )}
                    </div>
                </div>
            )
            }

            {/* CONTENT: STUDENTS */}
            {
                activeTab === 'Students' && (
                    <div>
                        <div className="mb-8">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="pl-10 pr-4 py-2 w-full rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                                />
                            </div>
                        </div>

                        {/* DESKTOP VIEW */}
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hidden md:block">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4 text-center">Tests</th>
                                        <th className="px-6 py-4 text-center">Avg Score</th>
                                        <th className="px-6 py-4 text-center">Trend</th>
                                        <th className="px-6 py-4">Last Active</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {users.filter(u => (u.role || 'student').toLowerCase() === 'student').map((user, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.fullName}</p>
                                                    <p className="text-slate-400 text-xs">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">{user.testsCompleted || 0}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded font-bold text-xs">{user.averageScore || '-'}%</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center text-green-500"><TrendingUp size={16} /></div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">
                                                {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSelectedStudent(user)} className="text-blue-600 font-bold hover:underline text-xs">View</button>
                                                    <button onClick={() => handleDeleteStudent(user._id)} className="text-red-600 font-bold hover:underline text-xs">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.filter(u => (u.role || 'student').toLowerCase() === 'student').length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-slate-400">
                                                No students found. (Total Users fetched: {users.length})
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE VIEW */}
                        <div className="space-y-4 block md:hidden">
                            {users.filter(u => (u.role || 'student').toLowerCase() === 'student').length > 0 ? (
                                users.filter(u => (u.role || 'student').toLowerCase() === 'student').map((user, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-900">{user.fullName}</p>
                                                <p className="text-slate-400 text-xs">{user.email}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-500">
                                                {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                                            <div className="bg-slate-50 px-3 py-1.5 rounded-lg flex-1">
                                                <span className="text-slate-400 block mb-0.5 text-[10px] uppercase">Tests</span>
                                                {user.testsCompleted || 0}
                                            </div>
                                            <div className="bg-teal-50 px-3 py-1.5 rounded-lg flex-1 text-teal-700">
                                                <span className="text-teal-400 block mb-0.5 text-[10px] uppercase">Avg Score</span>
                                                {user.averageScore || '-'}%
                                            </div>
                                            <div className="bg-green-50 px-3 py-1.5 rounded-lg flex-1 text-green-600 flex flex-col justify-center items-center">
                                                <span className="text-green-400 block mb-0.5 text-[10px] uppercase">Trend</span>
                                                <TrendingUp size={14} />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                                            <button onClick={() => setSelectedStudent(user)} className="text-blue-600 font-bold hover:underline text-xs p-1">View Details</button>
                                            <button onClick={() => handleDeleteStudent(user._id)} className="text-red-600 font-bold hover:underline text-xs p-1">Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-slate-400 font-medium text-sm">
                                    No students found.
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            {/* CONTENT: REQUESTS */}
            {
                activeTab === 'Requests' && (
                    <div className="space-y-6">
                        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setRequestType('registration')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${requestType === 'registration' ? 'bg-white text-[#C2410C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Registration ({pendingRegistrations.length})
                            </button>
                            <button
                                onClick={() => setRequestType('reattempt')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${requestType === 'reattempt' ? 'bg-white text-[#C2410C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Re-attempts ({reattemptRequests.filter(r => r.status === 'pending').length})
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto shadow-sm">
                            {requestType === 'registration' ? (
                                <table className="w-full text-left min-w-[800px] md:min-w-full">
                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">User Details</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4 text-center">Course</th>
                                            <th className="px-6 py-4">Registration Date</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {pendingRegistrations.map((user, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900">{user.fullName}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </td>
                                                <td className="px-6 py-4 uppercase font-bold text-xs text-slate-500">
                                                    {user.role}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-wider ${user.category === 'AIAPGET' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {user.category || 'MRB'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => setSelectedStudent(user)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1">
                                                        <Users size={14} /> View Details
                                                    </button>
                                                    <button onClick={() => handleApprovalAction(user._id, 'approve')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1">
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button onClick={() => handleApprovalAction(user._id, 'reject')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1">
                                                        <X size={14} /> Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingRegistrations.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-10 text-slate-400 font-medium italic">No pending registrations found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left min-w-[800px] md:min-w-full">
                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Assessment</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {reattemptRequests.filter(r => r.status === 'pending').map((req, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900">{req.userId?.fullName}</p>
                                                    <p className="text-xs text-slate-400">{req.userId?.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-slate-700">{req.testId?.title}</p>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => handleReattemptAction(req._id, 'approved')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1">
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button onClick={() => handleReattemptAction(req._id, 'rejected')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1">
                                                        <X size={14} /> Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {reattemptRequests.filter(r => r.status === 'pending').length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-slate-400 font-medium italic">No pending re-attempt requests</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )
            }
            {/* CONTENT: REVIEWS */}
            {activeTab === 'Reviews' && (
                <div className="space-y-6">
                    {/* DESKTOP VIEW */}
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hidden md:block">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Review content</th>
                                    <th className="px-6 py-4 text-center">Rating</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {reviews.map((review, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{review.name}</p>
                                            <p className="text-xs text-slate-400">{review.userId?.email || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            {editingReview?._id === review._id ? (
                                                <div className="flex flex-col gap-2">
                                                    <textarea
                                                        value={editingReview.text}
                                                        onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                                                        className="w-full p-2 border rounded-lg text-sm"
                                                        rows="3"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => requestUpdateReview(review._id, editingReview.text)} className="text-green-600 text-xs font-bold hover:underline">Save</button>
                                                        <button onClick={() => setEditingReview(null)} className="text-red-500 text-xs font-bold hover:underline">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-slate-600 truncate" title={review.text}>{review.text}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-0.5">
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star key={idx} size={12} className={idx < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingReview(review)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors border border-blue-100" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                {review.status !== 'approved' && (
                                                    <button onClick={() => handleReviewAction(review._id, 'approved')} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors border border-green-100" title="Approve">
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                {review.status !== 'rejected' && review.status !== 'approved' && (
                                                    <button onClick={() => handleReviewAction(review._id, 'rejected')} className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition-colors border border-amber-100" title="Reject">
                                                        <X size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleReviewDelete(review._id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors border border-red-100" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {reviews.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-400">No reviews found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE VIEW */}
                    <div className="space-y-4 block md:hidden">
                        {reviews.length > 0 ? reviews.map((review, i) => (
                            <div key={i} className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow">
                                <div className="w-full md:w-1/4">
                                    <p className="font-bold text-slate-900">{review.name}</p>
                                    <p className="text-xs text-slate-400">{review.userId?.email || 'N/A'}</p>
                                    <div className="flex items-center gap-0.5 mt-2">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={12} className={idx < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full md:w-1/2">
                                    {editingReview?._id === review._id ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea
                                                value={editingReview.text}
                                                onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                                                className="w-full p-2 border rounded-lg text-sm"
                                                rows="3"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => requestUpdateReview(review._id, editingReview.text)} className="text-green-600 text-xs font-bold hover:underline">Save</button>
                                                <button onClick={() => setEditingReview(null)} className="text-red-500 text-xs font-bold hover:underline">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-600" title={review.text}>{review.text}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {review.status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setEditingReview(review)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        {review.status !== 'approved' && (
                                            <button onClick={() => handleReviewAction(review._id, 'approved')} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Approve">
                                                <Check size={16} />
                                            </button>
                                        )}
                                        {review.status !== 'rejected' && review.status !== 'approved' && (
                                            <button onClick={() => handleReviewAction(review._id, 'rejected')} className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors" title="Reject">
                                                <X size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => handleReviewDelete(review._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                                No reviews found
                            </div>
                        )}
                    </div>
                </div>
            )}




            {/* Modals */}
            {isUploadModalOpen && (
                <UploadModal
                    onClose={() => setIsUploadModalOpen(false)}
                    onSuccess={handleUploadSuccess}
                    onAuthError={handleLogout}
                />
            )}
            {editingBank && (
                <EditModal
                    bank={editingBank}
                    onClose={() => setEditingBank(null)}
                    onSuccess={handleUploadSuccess}
                />
            )}
            {selectedStudent && (
                <StudentDetailsModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
            {statsBank && (
                <QuestionBankStatsModal
                    bank={statsBank}
                    data={statsData}
                    loading={loadingStats}
                    onClose={() => setStatsBank(null)}
                />
            )}
        </div >
    </AdminLayout >
);
};

// Sub-components
const OverviewCard = ({ icon, value, label }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
        <div className="mb-4 bg-slate-50 p-3 rounded-xl">{icon}</div>
        <h3 className="text-3xl font-serif font-bold text-slate-800 mb-1">{value}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
);

const UploadModal = ({ onClose, onSuccess, onAuthError }) => {
    const [formData, setFormData] = useState({
        title: '',
        difficulty: 'Easy',
        category: 'Both',
        negativeMarking: false,
        duration: 60,
        status: 'published'
    });
    const [questions, setQuestions] = useState([
        { question: '', options: ['', '', '', ''], answer: 0 }
    ]);
    const [loading, setLoading] = useState(false);



    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: 0, image: null, imagePreview: null }]);
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        if (field === 'options') {
            const { optIdx, val } = value;
            updatedQuestions[index].options[optIdx] = val;
        } else if (field === 'image') {
            const file = value;
            updatedQuestions[index].image = file;
            updatedQuestions[index].imagePreview = file ? URL.createObjectURL(file) : null;
        } else {
            updatedQuestions[index][field] = value;
        }
        setQuestions(updatedQuestions);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questions.length === 0) return alert('Please add at least one question');

        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('difficulty', formData.difficulty);
        data.append('category', formData.category);
        data.append('negativeMarking', formData.negativeMarking);
        data.append('duration', formData.duration);
        data.append('status', formData.status);

        // Prepare questions for backend
        // We need to keep track of which file belongs to which question
        // Backend expects 'files' array and 'manualQuestions' JSON
        const questionsToSave = questions.map((q, index) => {
            if (q.image) {
                data.append('questionImages', q.image, `q-${index}`);
            }
            return {
                question: q.question,
                options: q.options,
                answer: q.answer
            };
        });

        data.append('manualQuestions', JSON.stringify(questionsToSave));
        data.append('questionsCount', questionsToSave.length);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/question-banks`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                onAuthError();
            } else {
                alert('Upload failed: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };


    const triggerSubmit = async (e, forceStatus) => {
        e.preventDefault();
        const updatedStatus = forceStatus || formData.status;

        if (questions.length === 0) return alert('Please add at least one question');

        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('difficulty', formData.difficulty);
        data.append('category', formData.category);
        data.append('negativeMarking', formData.negativeMarking);
        data.append('duration', formData.duration);
        data.append('status', updatedStatus);


        const questionsToSave = questions.map((q, index) => {
            if (q.image) {
                data.append('questionImages', q.image, `q-${index}`);
            }
            return {
                question: q.question,
                options: q.options,
                answer: q.answer
            };
        });

        data.append('manualQuestions', JSON.stringify(questionsToSave));
        data.append('questionsCount', questionsToSave.length);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/question-banks`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                onAuthError();
            } else {
                alert('Upload failed: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-serif font-bold text-slate-800">Create Question Bank</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm"
                                    placeholder="e.g., Annual Exam"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Difficulty</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm bg-white"
                                    value={formData.difficulty}
                                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                >
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm bg-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Both</option>
                                    <option>MRB</option>
                                    <option>AIAPGET</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration (Min)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Negative Marking</h4>
                                <p className="text-xs text-slate-500">Enable to deduct -0.25 marks for each incorrect answer.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.negativeMarking}
                                    onChange={e => setFormData({ ...formData, negativeMarking: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C2410C]"></div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Questions ({questions.length})</h4>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
                                    >
                                        + Add Question
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {questions.map((q, qIdx) => (
                                    <div key={qIdx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group animate-in slide-in-from-top-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(qIdx)}
                                            className="absolute -right-2 -top-2 bg-white border border-slate-200 p-1.5 rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            {/* Text Content */}
                                            <div className="md:col-span-12 space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Question {qIdx + 1} Text</label>
                                                    <textarea
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm h-20 resize-none font-medium"
                                                        placeholder={`Enter question ${qIdx + 1} content...`}
                                                        value={q.question}
                                                        onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${q.answer === oIdx ? 'bg-[#C2410C] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                {String.fromCharCode(65 + oIdx)}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm"
                                                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                value={opt}
                                                                onChange={e => handleQuestionChange(qIdx, 'options', { optIdx: oIdx, val: e.target.value })}
                                                            />
                                                            <input
                                                                type="radio"
                                                                name={`answer-${qIdx}`}
                                                                checked={q.answer === oIdx}
                                                                onChange={() => handleQuestionChange(qIdx, 'answer', oIdx)}
                                                                className="w-4 h-4 accent-[#C2410C] cursor-pointer"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-6">
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="bg-[#C2410C]/10 text-[#C2410C] border border-[#C2410C]/20 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#C2410C]/20 transition-colors flex items-center gap-2"
                                >
                                    + Add Next Question
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-slate-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={(e) => triggerSubmit(e, 'draft')}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-70"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={(e) => triggerSubmit(e, 'published')}
                        type="button"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-[#0F172A] hover:bg-black text-white font-bold shadow-lg shadow-slate-900/10 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Creating...' : 'Post Question Bank'}
                    </button>
                </div>
            </div >
        </div >
    );
};

const EditModal = ({ bank, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: bank.title,
        difficulty: bank.difficulty || 'Easy',
        category: bank.category || 'Both',
        duration: bank.duration || 60,
        status: bank.status || 'published',
        negativeMarking: bank.negativeMarking || false
    });

    const [questions, setQuestions] = useState(
        (bank.questions || []).map((q, idx) => ({
            ...q,
            imagePreview: q.filename ? `${API_URL}/uploads/${q.filename}` : null
        }))
    );
    const [loading, setLoading] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: 0 }]);
    };

    const handleRemoveQuestion = (index) => {
        if (window.confirm('Are you sure you want to remove this question?')) {
            const updatedQuestions = questions.filter((_, i) => i !== index);
            setQuestions(updatedQuestions);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        if (field === 'options') {
            const { optIdx, val } = value;
            updatedQuestions[index].options[optIdx] = val;
        } else if (field === 'image') {
            const file = value;
            updatedQuestions[index].image = file;
            updatedQuestions[index].imagePreview = file ? URL.createObjectURL(file) : null;
        } else {
            updatedQuestions[index][field] = value;
        }
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('difficulty', formData.difficulty);
        data.append('category', formData.category);
        data.append('negativeMarking', formData.negativeMarking);
        data.append('duration', formData.duration);
        data.append('status', formData.status);

        const questionsToSave = questions.map((q, index) => {
            if (q.image) {
                // We use a prefix to identify which question this image belongs to
                data.append('questionImages', q.image, `q-${index}`);
            }
            return {
                question: q.question,
                options: q.options,
                answer: q.answer,
                filename: q.filename, // Keep existing filename if not changed
                _id: q._id
            };
        });

        data.append('updatedQuestions', JSON.stringify(questionsToSave));
        data.append('updatedFilenames', JSON.stringify([]));

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/admin/question-banks/${bank._id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSuccess();
        } catch (err) {
            console.error("Update failed", err);
            alert(`Update failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-serif font-bold text-slate-800">Edit Question Bank</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Difficulty</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm bg-white"
                                    value={formData.difficulty}
                                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                >
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm bg-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Both</option>
                                    <option>MRB</option>
                                    <option>AIAPGET</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration (Min)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Negative Marking</h4>
                                <p className="text-xs text-slate-500">Enable to deduct -0.25 marks for each incorrect answer.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.negativeMarking}
                                    onChange={e => setFormData({ ...formData, negativeMarking: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C2410C]"></div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Questions ({questions.length})</h4>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
                                    >
                                        + Add Manual Question
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {questions.map((q, qIdx) => (
                                    <div key={qIdx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group animate-in slide-in-from-top-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(qIdx)}
                                            className="absolute -right-2 -top-2 bg-white border border-slate-200 p-1.5 rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            {/* Text Content */}
                                            <div className="md:col-span-12 space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Question {qIdx + 1} Text</label>
                                                    <textarea
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm h-20 resize-none font-medium"
                                                        placeholder={`Enter question ${qIdx + 1} text...`}
                                                        value={q.question}
                                                        onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${q.answer === oIdx ? 'bg-[#C2410C] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                {String.fromCharCode(65 + oIdx)}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 text-sm"
                                                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                value={opt}
                                                                onChange={e => handleQuestionChange(qIdx, 'options', { optIdx: oIdx, val: e.target.value })}
                                                            />
                                                            <input
                                                                type="radio"
                                                                name={`edit-answer-${qIdx}`}
                                                                checked={q.answer === oIdx}
                                                                onChange={() => handleQuestionChange(qIdx, 'answer', oIdx)}
                                                                className="w-4 h-4 accent-[#C2410C] cursor-pointer"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-6">
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="bg-[#C2410C]/10 text-[#C2410C] border border-[#C2410C]/20 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#C2410C]/20 transition-colors flex items-center gap-2"
                                >
                                    + Add Next Question
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-slate-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="edit-form"
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-[#C2410C] hover:bg-[#9a3412] text-white font-bold shadow-lg shadow-orange-900/20 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>
            </div >
        </div >
    );
};

const StudentDetailsModal = ({ student, onClose }) => {
    if (!student) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X size={20} className="text-slate-500" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                        🎓
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-800">{student.fullName}</h2>
                    <p className="text-slate-500 font-medium">{student.role || 'Student'}</p>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-sm font-bold text-slate-500">Email</span>
                        <span className="text-sm font-medium text-slate-900">{student.email}</span>
                    </div>
                    {student.gender && (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                            <span className="text-sm font-bold text-slate-500">Gender</span>
                            <span className="text-sm font-medium text-slate-900">{student.gender}</span>
                        </div>
                    )}
                    {student.dob && (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                            <span className="text-sm font-bold text-slate-500">Date of Birth</span>
                            <span className="text-sm font-medium text-slate-900">{student.dob}</span>
                        </div>
                    )}
                    {student.age && (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                            <span className="text-sm font-bold text-slate-500">Age</span>
                            <span className="text-sm font-medium text-slate-900">{student.age}</span>
                        </div>
                    )}
                    <div className="h-px bg-slate-100 my-2"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Academic Information</p>
                    {student.ugYear && (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <span className="text-sm font-bold text-slate-500">UG Academic Year</span>
                            <span className="text-sm font-medium text-slate-900">{student.ugYear}</span>
                        </div>
                    )}
                    {student.pgCollege && (
                        <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <span className="text-sm font-bold text-slate-500">PG College Name</span>
                            <span className="text-sm font-medium text-slate-900">{student.pgCollege}</span>
                        </div>
                    )}
                    {student.pgYear && (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <span className="text-sm font-bold text-slate-500">PG Academic Year</span>
                            <span className="text-sm font-medium text-slate-900">{student.pgYear}</span>
                        </div>
                    )}
                    {student.category && (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <span className="text-sm font-bold text-slate-500">Registered Category</span>
                            <span className="text-sm font-medium text-slate-900 font-bold text-blue-900">{student.category}</span>
                        </div>
                    )}
                    {student.regNo && (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <span className="text-sm font-bold text-slate-500">Register Number</span>
                            <span className="text-sm font-medium text-slate-900">{student.regNo}</span>
                        </div>
                    )}
                    <div className="h-px bg-slate-100 my-2"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Performance Overview</p>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-sm font-bold text-slate-500">Tests Taken</span>
                        <span className="text-sm font-medium text-slate-900">{student.testsCompleted || 0}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-sm font-bold text-slate-500">Average Score</span>
                        <span className="text-sm font-medium text-blue-600 font-bold">{student.averageScore || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-sm font-bold text-slate-500">Joined On</span>
                        <span className="text-sm font-medium text-slate-900">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const QuestionBankStatsModal = ({ bank, data, loading, onClose }) => {
    const [tab, setTab] = useState('viewers');

    // Group attempts by user to show unique students in the attempts list
    const uniqueAttempts = Object.values((data.attempts || []).reduce((acc, current) => {
        const uid = current.userId || current.fullName;
        if (!acc[uid] || new Date(current.date) > new Date(acc[uid].date)) {
            acc[uid] = current;
        }
        return acc;
    }, {}));

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-slate-800">{bank.title} - Stats</h3>
                        <p className="text-xs text-slate-500">Track student engagement</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
                </div>

                <div className="flex bg-slate-100 p-1 m-4 rounded-xl items-center">
                    <button
                        onClick={() => setTab('viewers')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'viewers' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Viewers ({data.viewers?.length || 0})
                    </button>
                    <button
                        onClick={() => setTab('attempts')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'attempts' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Attempts ({uniqueAttempts.length})
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tab === 'viewers' ? (
                                <>
                                    {data.viewers && data.viewers.length > 0 ? data.viewers.map((v, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                    {(v.fullName || 'S')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{v.fullName}</p>
                                                    <p className="text-xs text-slate-400">{v.email || v.mobile || 'No contact'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Last Viewed</p>
                                                <p className="text-xs font-medium text-slate-600">{new Date(v.viewedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 text-slate-400 italic">No views recorded yet.</div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {uniqueAttempts.length > 0 ? uniqueAttempts.map((a, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-orange-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold">
                                                    {(a.fullName || 'S')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{a.fullName}</p>
                                                    <p className="text-xs text-slate-400">{a.email || a.mobile || 'No contact'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end mb-1">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Latest Score:</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${a.score >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.score}%</span>
                                                </div>
                                                <p className="text-[10px] font-medium text-slate-500">{new Date(a.date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 text-slate-400 italic">No attempts made yet.</div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

