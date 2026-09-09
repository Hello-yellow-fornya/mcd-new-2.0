'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button/Button';
import { site } from '@/lib/site';
import { cta } from '../copy';
import styles from './CallBar.module.css';

/** Mobile only (ocr-homepage-mobile.html .callbar): a fixed navy call pill that slides in once the hero has scrolled past. */
export function CallBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    if (!hero) return;
    const onScroll = () => setShow(window.scrollY > hero.offsetTop + hero.offsetHeight - 80);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <div className={[styles.bar, show ? styles.show : ''].join(' ')} data-callbar aria-hidden={!show}>
        <Button href={site.phone.href} variant="ink" icon="phone" block data-cta="call">
          {cta.call}
        </Button>
      </div>
    </>
  );
}
