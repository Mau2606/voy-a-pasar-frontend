import { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

/**
 * Wrapper around react-google-recaptcha for consistent usage.
 *
 * Props:
 * - onVerify(token)  — called when user completes captcha
 * - onExpire()       — called when captcha token expires (optional)
 * - captchaRef       — optional external ref to control the widget
 */
export default function ReCaptcha({ onVerify, onExpire, captchaRef }) {
  const internalRef = useRef(null);
  const ref = captchaRef || internalRef;

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        ref={ref}
        sitekey={SITE_KEY}
        onChange={(token) => onVerify?.(token || '')}
        onExpired={() => {
          onVerify?.('');
          onExpire?.();
        }}
        onErrored={() => {
          onVerify?.('');
        }}
      />
    </div>
  );
}

/**
 * Helper to reset a captcha widget from outside.
 * Pass the same ref used for captchaRef.
 */
export function resetCaptchaRef(ref) {
  ref?.current?.reset();
}
