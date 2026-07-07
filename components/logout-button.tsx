'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from '@/components/i18n-provider';

export function LogoutButton() {
  const router = useRouter();
  const dict = useTranslations();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      {dict.common.logout}
    </Button>
  );
}
