import { useEffect, useRef } from 'react';

const GoogleLoginButton = ({ onSuccess}) => {
  const buttonRef = useRef();

  useEffect(() => {
    // Load Google SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '1063472421493-dsbk7mc5tiuml1btm6hqbi8l4e8kps4g.apps.googleusercontent.com',
          callback: (response) => {
            // response.credential is the ID token
            onSuccess(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        // Render the Google button inside the div
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: '380',
          text: 'signin_with',
        });
      }
    };
    document.head.appendChild(script);
  }, [onSuccess]);

  return (
    <div className="w-full">
      <div ref={buttonRef} className="flex justify-center"></div>
    </div>
  );
};

export default GoogleLoginButton;