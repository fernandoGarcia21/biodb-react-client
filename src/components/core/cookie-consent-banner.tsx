'use client';

import { useState, useEffect } from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';
import { GoogleAnalytics } from '@/components/core/google-analytics';
import { paths } from '@/paths';

const COOKIE_NAME = 'biodb-cookie-consent';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export function CookieConsentBanner(): React.JSX.Element {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = Cookies.get(COOKIE_NAME);
    if (consent === 'true') {
      setHasConsent(true);
    }
  }, []);

  const handleAccept = () => {
    setHasConsent(true);
  };

  const handleDecline = () => {
    setHasConsent(false);
    // Remove any existing GA cookies
    Cookies.remove('_ga');
    Cookies.remove('_gat');
    Cookies.remove('_gid');
  };

  return (
    <>
      {hasConsent && GA_MEASUREMENT_ID && <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />}
      
      <CookieConsent
        location="bottom"
        buttonText="Accept All"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName={COOKIE_NAME}
        onAccept={handleAccept}
        onDecline={handleDecline}
        expires={365}
        style={{
          background: 'var(--mui-palette-neutral-900)',
          padding: '20px 20px 20px 80px',
          alignItems: 'center',
          zIndex: 9999,
        }}
        buttonStyle={{
          background: 'var(--mui-palette-primary-main)',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '4px',
          padding: '10px 24px',
          fontWeight: 500,
        }}
        declineButtonStyle={{
          background: 'transparent',
          color: 'var(--mui-palette-text-secondary)',
          fontSize: '14px',
          borderRadius: '4px',
          padding: '10px 24px',
          border: '1px solid var(--mui-palette-neutral-700)',
        }}
        contentStyle={{
          flex: '1 1 auto',
          margin: '10px',
          maxWidth: '100%',
        }}
        buttonWrapperClasses="cookie-consent-buttons"
      >
        <style>{`
          @media (max-width: 768px) {
            .CookieConsent {
              padding: 15px 10px !important;
              flex-direction: column !important;
            }
            .cookie-consent-buttons {
              margin-top: 10px;
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }
          }
        `}</style>
        <div style={{ fontSize: '14px', lineHeight: '1.5', wordWrap: 'break-word' }}>
          <strong>Cookie Notice</strong>
          <p style={{ margin: '8px 0 0 0' }}>
            We use cookies to improve your experience and analyze site traffic. By clicking "Accept All", 
            you consent to our use of cookies for analytics purposes.{' '}
            <a 
              href={paths.legal.cookiePolicy} 
              style={{ color: 'var(--mui-palette-primary-light)', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </p>
        </div>
      </CookieConsent>
    </>
  );
}
