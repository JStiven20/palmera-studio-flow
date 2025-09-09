import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching user role:', roleError);
        }

        setUserProfile(profileData);
        setUserRole(roleData?.role || 'manicurist');
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserProfile(null);
        setUserRole('manicurist');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return { 
    userProfile, 
    userRole,
    loading, 
    isActive: userProfile?.is_active || false,
    isAdmin: userRole === 'admin',
    manicuristName: userProfile?.manicurist_name || null
  };
};