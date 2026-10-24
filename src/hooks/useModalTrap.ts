/**
 * KairOS Accessible Modal Focus Trap & Keyboard Dismissal Hook
 * 
 * Implements WAI-ARIA Modal Dialog Practices:
 * 1. Traps focus within modal container.
 * 2. Listens for Escape key to trigger dismiss callback.
 * 3. Auto-focuses designated initial element upon mount.
 * 
 * @module hooks/useModalTrap
 */

import { useEffect, useRef, RefObject } from 'react';

export interface UseModalTrapOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export function useModalTrap({ isOpen, onClose, initialFocusRef }: UseModalTrapOptions): RefObject<HTMLDivElement | null> {
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap for Tab key
      if (e.key === 'Tab' && modalContainerRef.current) {
        const focusableElements = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(el => !el.hasAttribute('disabled'));

        if (focusable.length === 0) {
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Initial focus placement
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, initialFocusRef]);

  return modalContainerRef;
}
