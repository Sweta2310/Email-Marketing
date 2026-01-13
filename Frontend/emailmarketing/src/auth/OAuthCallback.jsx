import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            // OAuth failed, redirect to signup with error
            navigate('/signup?error=' + error);
            return;
        }

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                navigate('/');
            } catch (err) {
                console.error('Error processing OAuth callback:', err);
                navigate('/signup?error=invalid_callback');
            }
        } else {
            navigate('/signup');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <div>Processing authentication...</div>
        </div>
    );
};

export default OAuthCallback;
