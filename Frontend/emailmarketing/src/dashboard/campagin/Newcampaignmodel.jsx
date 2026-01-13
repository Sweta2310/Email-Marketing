import React, { useState, useEffect } from 'react';
import { X, Layout, FileText, Check, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI } from '../../services/campaign.services';
import './Newcampaignmodel.css'; // We might need to create this css or inline it

// Hardcoded templates for display as per user request/images
const SYSTEM_TEMPLATES = [
    {
        id: 'temp_restaurant',
        name: 'Restaurant Guide',
        subject: 'The 3 Restaurants You Must Visit',
        preview: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=300&h=200', // Placeholder or use user uploaded if I could
        content: {
            subject: 'The 3 Restaurants You Must Visit',
            text: 'Three flavors, One City. Your insider guide to the best dining right now.',
            html: '<div style="background:#fff9c4; padding:20px; font-family:serif; color:#333;"><h1>The 3 Restaurants You Must Visit</h1><p>Three flavors. One City.</p></div>'
        }
    },
    {
        id: 'temp_finbank',
        name: 'Welcome to FinBank',
        subject: 'Welcome to FinBank',
        preview: 'https://images.unsplash.com/photo-1565514020176-db8b32115ba3?auto=format&fit=crop&q=80&w=300&h=200',
        content: {
            subject: 'Welcome to FinBank',
            text: 'The modern way to manage your money.',
            html: '<div style="background:#fff; border:1px solid #ddd; padding:20px; font-family:sans-serif;"><h1>Welcome to FinBank</h1><p>The modern way to manage your money.</p></div>'
        }
    }
];

const NewCampaignModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Type Selection, 2: Template Selection (if applicable), 3: Naming
    const [selectedType, setSelectedType] = useState(null); // 'scratch' or 'template'
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [campaignName, setCampaignName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setStep(1);
        setSelectedType(null);
        setSelectedTemplate(null);
        setCampaignName('');
        setError('');
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleCreate = async () => {
        if (!campaignName.trim()) {
            setError('Please enter a campaign name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                name: campaignName,
                // If it's a system template (hardcoded), we pass the content manually since backend might not have it in DB
                // If it's a DB template, we pass templateId
                content: selectedTemplate?.content || {},
                // We use a trick: if ID starts with 'temp_', it's fake. Real IDs are Mongo ObjectIds
                templateId: (selectedTemplate && !selectedTemplate.id.startsWith('temp_')) ? selectedTemplate.id : null
            };

            const newCampaign = await campaignAPI.createCampaign(payload);
            handleClose();
            // Navigate to editor
            navigate(`/campaign/${newCampaign._id}`);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {step === 1 ? 'Start a New Campaign' :
                            step === 2 ? 'Select a Template' : 'Name Your Campaign'}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                onClick={() => { setSelectedType('scratch'); setStep(3); }}
                                className="cursor-pointer group relative p-8 border-2 border-gray-100 hover:border-teal-500 rounded-2xl transition-all hover:shadow-lg bg-white"
                            >
                                <div className="w-16 h-16 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileText size={32} className="text-teal-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Create from Scratch</h3>
                                <p className="text-gray-500">Start with a blank canvas and build your email exactly how you want it.</p>
                            </div>

                            <div
                                onClick={() => { setSelectedType('template'); setStep(2); }}
                                className="cursor-pointer group relative p-8 border-2 border-gray-100 hover:border-purple-500 rounded-2xl transition-all hover:shadow-lg bg-white"
                            >
                                <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Layout size={32} className="text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Use a Template</h3>
                                <p className="text-gray-500">Choose from our professionally designed templates to get started quickly.</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {SYSTEM_TEMPLATES.map(temp => (
                                <div
                                    key={temp.id}
                                    onClick={() => { setSelectedTemplate(temp); setStep(3); }}
                                    className="cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all hover:border-teal-500 group"
                                >
                                    <div className="h-40 bg-gray-200 overflow-hidden">
                                        <img src={temp.preview} alt={temp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-gray-800">{temp.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1 truncate">{temp.subject}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-md mx-auto">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="e.g., Weekly Newsletter #42"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                                {selectedType === 'scratch' ? <FileText size={20} className="text-teal-600" /> : <Layout size={20} className="text-purple-600" />}
                                <span className="text-sm font-medium text-gray-600">
                                    Type: {selectedType === 'scratch' ? 'Blank Campaign' : `Template: ${selectedTemplate?.name}`}
                                </span>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={loading || !campaignName.trim()}
                                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : 'Create Draft'}
                            </button>

                            <button onClick={() => setStep(selectedType === 'template' ? 2 : 1)} className="w-full mt-3 py-2 text-gray-500 hover:text-gray-800 font-medium">
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewCampaignModal;
