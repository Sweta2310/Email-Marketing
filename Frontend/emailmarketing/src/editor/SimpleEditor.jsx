import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    LogOut, MoreVertical, Code2, Type, Bold, Italic, Underline,
    Strikethrough, Palette, Highlighter, Link2, Image as ImageIcon,
    Smile, Braces, Table, AlignLeft, AlignCenter, AlignRight,
    AlignJustify, List, ListOrdered, Indent, Outdent, Eraser,
    ChevronDown, Check
} from 'lucide-react';
import './styles/simple-editor.css';

const SimpleEditor = () => {
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    const editorRef = useRef(null);
    const [content, setContent] = useState('<p><br/></p>');

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
        }
    }, []); // Only once on mount

    const handleBack = () => {
        if (campaignId) {
            navigate(`/campaign/${campaignId}`);
        } else {
            navigate('/dashboard');
        }
    };

    const handleFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        // Sync content after format
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    const handleLink = () => {
        const url = prompt('Enter the URL:', 'https://');
        if (url) handleFormat('createLink', url);
    };

    const handleImage = () => {
        const url = prompt('Enter the image URL:');
        if (url) handleFormat('insertImage', url);
    };

    const handleEmoji = () => {
        const emojis = ['😊', '🚀', '🔥', '✨', '🎉', '💡', '✅'];
        const emoji = prompt(`Choose an emoji: ${emojis.join(' ')}`, '😊');
        if (emoji) handleFormat('insertText', emoji);
    };

    const handleMergeTag = () => {
        const tags = ['{{First_Name}}', '{{Last_Name}}', '{{Email}}', '{{Company}}'];
        const tag = prompt(`Choose a merge tag: ${tags.join(', ')}`, '{{First_Name}}');
        if (tag) handleFormat('insertText', tag);
    };

    const handleSave = () => {
        const currentContent = editorRef.current ? editorRef.current.innerHTML : content;
        console.log('Saving content for campaign:', campaignId, currentContent);
        alert('Email content saved successfully!');
    };

    return (
        <div className="simple-editor-root">
            {/* Nav Bar */}
            <nav className="simple-nav">
                <div className="nav-left">
                    <button className="back-btn" onClick={handleBack}>
                        <LogOut size={20} />
                    </button>
                    <span className="email-name">email marketing (Simple)</span>
                </div>
                <div className="nav-right">
                    <button className="preview-btn">Preview & Test</button>
                    <button className="save-quit-btn" onClick={handleSave}>Save & Quit</button>
                    <button className="more-btn">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </nav>

            {/* Toolbar */}
            <div className="simple-toolbar">
                <div className="toolbar-group">
                    <div className="font-selector">
                        <select
                            onChange={(e) => handleFormat('fontName', e.target.value)}
                            defaultValue="Inter"
                        >
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                            <option value="Arial Black">Arial Black</option>
                            <option value="Impact">Impact</option>
                            <option value="Tahoma">Tahoma</option>
                            <option value="Trebuchet MS">Trebuchet MS</option>
                        </select>
                    </div>
                    <div className="size-selector">
                        <select
                            onChange={(e) => handleFormat('fontSize', e.target.value)}
                            defaultValue="3"
                        >
                            <option value="1">10px</option>
                            <option value="2">13px</option>
                            <option value="3">16px</option>
                            <option value="4">18px</option>
                            <option value="5">24px</option>
                            <option value="6">32px</option>
                            <option value="7">48px</option>
                            <option value="8">64px</option>
                            <option value="9">72px</option>
                            <option value="10">96px</option>
                            <option value="11">128px</option>
                            <option value="12">144px</option>
                            <option value="13">160px</option>
                        </select>
                    </div>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button onClick={() => handleFormat('bold')} title="Bold"><Bold size={16} /></button>
                    <button onClick={() => handleFormat('italic')} title="Italic"><Italic size={16} /></button>
                    <button onClick={() => handleFormat('underline')} title="Underline"><Underline size={16} /></button>
                    <button onClick={() => handleFormat('strikethrough')} title="Strikethrough"><Strikethrough size={16} /></button>
                    <button onClick={() => {
                        const color = prompt('Enter color hex or name:', '#ff0000');
                        if (color) handleFormat('foreColor', color);
                    }} title="Text Color"><Palette size={16} /></button>
                    <button onClick={() => {
                        const color = prompt('Enter highlight hex or name:', '#ffff00');
                        if (color) handleFormat('hiliteColor', color);
                    }} title="Highlight"><Highlighter size={16} /></button>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button onClick={handleLink} title="Link"><Link2 size={16} /></button>
                    <button onClick={handleImage} title="Image"><ImageIcon size={16} /></button>
                    <button onClick={handleEmoji} title="Emoji"><Smile size={16} /></button>
                    <button onClick={handleMergeTag} title="Merge Tags"><Braces size={16} /></button>
                    <button onClick={() => handleFormat('insertHTML', '<table border="1" style="width:100%; border-collapse: collapse;"><tr><td style="padding: 8px;">Col 1</td><td style="padding: 8px;">Col 2</td></tr></table>')} title="Table"><Table size={16} /></button>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button onClick={() => handleFormat('justifyLeft')} title="Align Left"><AlignLeft size={16} /></button>
                    <button onClick={() => handleFormat('justifyCenter')} title="Align Center"><AlignCenter size={16} /></button>
                    <button onClick={() => handleFormat('justifyRight')} title="Align Right"><AlignRight size={16} /></button>
                    <button onClick={() => handleFormat('justifyFull')} title="Align Justify"><AlignJustify size={16} /></button>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button onClick={() => handleFormat('insertUnorderedList')} title="Bullet List"><List size={16} /></button>
                    <button onClick={() => handleFormat('insertOrderedList')} title="Numbered List"><ListOrdered size={16} /></button>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button onClick={() => handleFormat('indent')} title="Indent"><Indent size={16} /></button>
                    <button onClick={() => handleFormat('outdent')} title="Outdent"><Outdent size={16} /></button>
                </div>
                <div className="v-divider"></div>
                <div className="toolbar-group">
                    <button onClick={() => handleFormat('removeFormat')} title="Clear Formatting"><Eraser size={16} /></button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="editor-container">
                <div className="editor-paper">
                    <div
                        ref={editorRef}
                        className="editable-area"
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    />
                </div>
            </div>
        </div>
    );
};

export default SimpleEditor;
