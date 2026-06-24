import { useEffect, useRef } from 'react';

const CLIENT_ID = '1063472421493-dsbk7mc5tiuml1btm6hqbi8l4e8kps4g.apps.googleusercontent.com';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const buttonRef = useRef();

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError?.();
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: buttonRef.current.offsetWidth || 380,
          text: 'signin_with',
          shape: 'rectangular',
        });
      }
    };

    // Already loaded check
    if (window.google) {
      initializeGoogle();
      return;
    }

    // Script already in DOM check
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => onError?.();
    document.head.appendChild(script);
  }, []);

  return (
    <div className='w-full flex justify-center'>
      <div ref={buttonRef} className='w-full' />
    </div>
  );
};

export default GoogleLoginButton;