export const EDITOR_SECTIONS = [
    {
        id: 'section-title-text',
        name: 'Title & Text',
        description: 'A large title with a description paragraph.',
        thumbnail: 'https://via.placeholder.com/200x120?text=Title+%26+Text',
        blocks: [
            {
                type: 'title',
                settings: {
                    content: 'Some title here',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#1a202c',
                    textAlign: 'center',
                    padding: '20px 20px 10px 20px'
                }
            },
            {
                type: 'text',
                settings: {
                    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.',
                    fontSize: '16px',
                    color: '#4a5568',
                    textAlign: 'center',
                    padding: '0 40px 20px 40px',
                    lineHeight: '1.6'
                }
            }
        ]
    },
    {
        id: 'section-header',
        name: 'Header',
        description: 'Logo and navigation links.',
        thumbnail: 'https://via.placeholder.com/200x120?text=Header',
        blocks: [
            {
                type: 'logo',
                settings: {
                    url: 'https://via.placeholder.com/150x50?text=LOGO',
                    width: '120px',
                    align: 'center',
                    padding: '20px'
                }
            },
            {
                type: 'navigation',
                settings: {
                    links: [
                        { label: 'HOME', url: '#' },
                        { label: 'SHOP', url: '#' },
                        { label: 'BLOG', url: '#' },
                        { label: 'CONTACT', url: '#' }
                    ],
                    padding: '10px',
                    align: 'center',
                    color: '#4a5568',
                    fontSize: '13px'
                }
            }
        ]
    },
    {
        id: 'section-images-grid',
        name: 'Image Grid',
        description: 'Two columns with images and text.',
        thumbnail: 'https://via.placeholder.com/200x120?text=Images+Grid',
        blocks: [
            {
                type: 'columns',
                settings: {
                    columnCount: 2,
                    layout: [50, 50],
                    padding: '20px',
                    columns: [
                        {
                            id: 'col-left',
                            blocks: [
                                {
                                    type: 'image',
                                    settings: {
                                        url: 'https://via.placeholder.com/400x300?text=Image+1',
                                        alt: 'Image 1',
                                        width: '100%',
                                        borderRadius: '8px',
                                        padding: '0 0 10px 0'
                                    }
                                },
                                {
                                    type: 'title',
                                    settings: {
                                        content: 'Product One',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        padding: '5px'
                                    }
                                }
                            ]
                        },
                        {
                            id: 'col-right',
                            blocks: [
                                {
                                    type: 'image',
                                    settings: {
                                        url: 'https://via.placeholder.com/400x300?text=Image+2',
                                        alt: 'Image 2',
                                        width: '100%',
                                        borderRadius: '8px',
                                        padding: '0 0 10px 0'
                                    }
                                },
                                {
                                    type: 'title',
                                    settings: {
                                        content: 'Product Two',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        padding: '5px'
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'section-footer',
        name: 'Footer',
        description: 'Social icons and company address.',
        thumbnail: 'https://via.placeholder.com/200x120?text=Footer',
        blocks: [
            {
                type: 'divider',
                settings: {
                    height: '1px',
                    color: '#edf2f7',
                    padding: '40px 0 20px 0',
                    width: '100%'
                }
            },
            {
                type: 'social',
                settings: {
                    networks: [
                        { name: 'facebook', url: '#' },
                        { name: 'twitter', url: '#' },
                        { name: 'instagram', url: '#' },
                        { name: 'linkedin', url: '#' }
                    ],
                    align: 'center',
                    padding: '10px',
                    iconSize: '24px',
                    iconSpacing: '15px'
                }
            },
            {
                type: 'text',
                settings: {
                    content: '123 Business St, City, Country<br/>© 2026 Your Company. All rights reserved.',
                    fontSize: '12px',
                    color: '#718096',
                    textAlign: 'center',
                    padding: '10px 20px 40px 20px',
                    lineHeight: '1.5'
                }
            }
        ]
    },
    {
        id: 'section-signature',
        name: 'Signature',
        description: 'Professional email signature.',
        thumbnail: 'https://via.placeholder.com/200x120?text=Signature',
        blocks: [
            {
                type: 'columns',
                settings: {
                    columnCount: 2,
                    layout: [30, 70],
                    padding: '20px',
                    columns: [
                        {
                            id: 'sig-left',
                            blocks: [
                                {
                                    type: 'image',
                                    settings: {
                                        url: 'https://via.placeholder.com/100x100?text=Profile',
                                        alt: 'Profile',
                                        width: '80px',
                                        borderRadius: '50%',
                                        padding: '0'
                                    }
                                }
                            ]
                        },
                        {
                            id: 'sig-right',
                            blocks: [
                                {
                                    type: 'text',
                                    settings: {
                                        content: '<strong>John Doe</strong><br/>CEO at Marketing Co.<br/><span style="color: #5a57d9">www.marketing.com</span>',
                                        fontSize: '14px',
                                        color: '#2d3748',
                                        textAlign: 'left',
                                        padding: '5px 0 0 0',
                                        lineHeight: '1.4'
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'section-empty-columns',
        name: 'Empty Columns',
        description: 'Multi-column layout structure.',
        thumbnail: 'https://via.placeholder.com/200x120?text=Empty+Columns',
        blocks: [
            {
                type: 'columns',
                settings: {
                    columnCount: 3,
                    layout: [33.33, 33.33, 33.33],
                    padding: '20px',
                    columns: [
                        { id: 'col-1', blocks: [] },
                        { id: 'col-2', blocks: [] },
                        { id: 'col-3', blocks: [] }
                    ]
                }
            }
        ]
    }
];
