import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    LogOut, MoreVertical, Code2, Save, Eye, Copy,
    Trash2, Search, Settings, HelpCircle
} from 'lucide-react';
import './styles/simple-editor.css'; // Reusing base layout styles

const HtmlEditor = () => {
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: Arial, sans-serif; padding: 20px; }
        .header { color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Hello World</h1>
        <p>This is a custom HTML email.</p>
    </div>
</body>
</html>`);

    const handleBack = () => {
        if (campaignId) {
            navigate(`/campaign/${campaignId}`);
        } else {
            navigate('/dashboard');
        }
    };

    const handleSave = () => {
        console.log('Saving HTML for campaign:', campaignId, htmlCode);
        alert('HTML content saved successfully!');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(htmlCode);
        alert('Code copied to clipboard!');
    };

    return (
        <div className="simple-editor-root">
            {/* Nav Bar */}
            <nav className="simple-nav">
                <div className="nav-left">
                    <button className="back-btn" onClick={handleBack}>
                        <LogOut size={20} />
                    </button>
                    <span className="email-name">email marketing (HTML Custom)</span>
                </div>
                <div className="nav-right">
                    <button className="preview-btn">Preview & Test</button>
                    <button className="save-quit-btn" onClick={handleSave}>Save & Quit</button>
                    <button className="more-btn">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </nav>

            {/* Code Toolbar */}
            <div className="simple-toolbar">
                <div className="toolbar-group">
                    <button title="Format Code"><Code2 size={16} /></button>
                    <button onClick={handleCopy} title="Copy All"><Copy size={16} /></button>
                    <button onClick={() => setHtmlCode('')} title="Clear All"><Trash2 size={16} /></button>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button title="Find"><Search size={16} /></button>
                    <button title="Settings"><Settings size={16} /></button>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button title="Help"><HelpCircle size={16} /></button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="editor-container" style={{ padding: '0', background: '#1e222d' }}>
                <textarea
                    className="html-editor"
                    style={{
                        height: '100%',
                        borderRadius: '0',
                        fontSize: '15px',
                        padding: '30px',
                        overflow: 'auto'
                    }}
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

export default HtmlEditor;
