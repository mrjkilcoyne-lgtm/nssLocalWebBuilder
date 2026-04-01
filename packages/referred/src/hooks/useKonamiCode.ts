import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

interface EasterEgg {
  description: string;
  discount_code: string | null;
}

export function useKonamiCode() {
  const [position, setPosition] = useState(0);
  const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null);
  const [showModal, setShowModal] = useState(false);

  const dismiss = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;
      if (key === KONAMI_SEQUENCE[position]) {
        const next = position + 1;
        if (next === KONAMI_SEQUENCE.length) {
          // Konami code complete!
          setPosition(0);
          supabase
            .from('easter_egg_deals')
            .select('description, discount_code')
            .eq('trigger_type', 'konami')
            .eq('is_active', true)
            .limit(1)
            .single()
            .then(({ data }) => {
              if (data) {
                setEasterEgg(data);
                setShowModal(true);
                // Increment unlock count
                supabase.rpc('increment_easter_egg', { trigger: 'konami' }).then(() => {});
              }
            });
        } else {
          setPosition(next);
        }
      } else {
        setPosition(0);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position]);

  return { easterEgg, showModal, dismiss };
}
