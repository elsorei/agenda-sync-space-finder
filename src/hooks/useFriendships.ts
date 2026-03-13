import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database, FriendshipStatus } from '@/types/database';

type Friendship = Database['public']['Tables']['friendships']['Row'];

interface FriendshipWithProfile extends Friendship {
  requester_profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    color: string;
  };
  addressee_profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    color: string;
  };
}

export function useFriendships() {
  const { user } = useAuth();
  const [friendships, setFriendships] = useState<FriendshipWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch all friendships involving the current user
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (data) {
      // Fetch profiles for all involved users
      const userIds = new Set<string>();
      data.forEach((f) => {
        userIds.add(f.requester_id);
        userIds.add(f.addressee_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, color')
        .in('id', Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const enriched: FriendshipWithProfile[] = data.map((f) => ({
        ...f,
        requester_profile: profileMap.get(f.requester_id),
        addressee_profile: profileMap.get(f.addressee_id),
      }));

      setFriendships(enriched.filter((f) => f.status === 'accepted'));
      setPendingRequests(
        enriched.filter(
          (f) => f.status === 'pending' && f.addressee_id === user.id
        )
      );
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  // Listen for realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        () => {
          fetchFriendships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFriendships]);

  const acceptFriendship = async (friendshipId: string) => {
    const friendship = pendingRequests.find((f) => f.id === friendshipId);
    if (!friendship || !user) return;

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' as FriendshipStatus })
      .eq('id', friendshipId);

    if (!error) {
      // Auto-add requester to addressee's contacts
      const requesterProfile = friendship.requester_profile;
      if (requesterProfile) {
        await supabase.from('contacts').insert({
          owner_id: user.id,
          name: requesterProfile.full_name,
          email: requesterProfile.email,
          linked_user_id: requesterProfile.id,
        });
      }

      // Notify requester
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await supabase.from('notifications').insert({
        user_id: friendship.requester_id,
        type: 'friendship_accepted',
        title: 'Amicizia accettata',
        message: `${myProfile?.full_name || 'Un utente'} ha accettato la tua richiesta di amicizia.`,
        data: { friendship_id: friendshipId },
      });

      await fetchFriendships();
    }
    return { error };
  };

  const rejectFriendship = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' as FriendshipStatus })
      .eq('id', friendshipId);

    if (!error) {
      await fetchFriendships();
    }
    return { error };
  };

  const revokeFriendship = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (!error) {
      await fetchFriendships();
    }
    return { error };
  };

  const getFriendshipStatus = (userId: string): FriendshipStatus | null => {
    const friendship = [...friendships, ...pendingRequests].find(
      (f) =>
        (f.requester_id === userId || f.addressee_id === userId) &&
        (f.requester_id === user?.id || f.addressee_id === user?.id)
    );
    return friendship?.status ?? null;
  };

  const getFriendIds = (): string[] => {
    if (!user) return [];
    return friendships.map((f) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    );
  };

  return {
    friendships,
    pendingRequests,
    loading,
    acceptFriendship,
    rejectFriendship,
    revokeFriendship,
    getFriendshipStatus,
    getFriendIds,
    refreshFriendships: fetchFriendships,
  };
}
