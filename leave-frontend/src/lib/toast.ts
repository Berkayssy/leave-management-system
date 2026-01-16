// lib/toast.ts - YENİ VERSİYON (Custom Toast)
import { useToast } from '@/components/ui/Toast';

// Client-side'da çalışacak hook
export function useCustomToast() {
  return useToast();
}

// Direk kullanım için helper fonksiyonlar
// NOT: Bu fonksiyonlar sadece client component'lerde çalışır
export const showToast = {
  success: (message: string) => {
    // Sadece client-side'da çalış
    if (typeof window === 'undefined') return;
    
    // useToast hook'u sadece component içinde kullanılabilir
    // Bu yüzden alternatif bir yol kullanacağız
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'success' }
    });
    window.dispatchEvent(event);
  },

  error: (message: string) => {
    if (typeof window === 'undefined') return;
    
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'error' }
    });
    window.dispatchEvent(event);
  }
};