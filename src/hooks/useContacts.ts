import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/types/database';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];

export function useContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('owner_id', user.id)
      .order('name');
    setContacts(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: Omit<ContactInsert, 'owner_id'>) => {
    if (!user) return { error: new Error('Non autenticato') };

    // Check if user exists with this email/phone
    let linkedUserId: string | null = null;
    if (contact.email || contact.phone) {
      const { data: foundUser } = await supabase.rpc('find_user_by_contact', {
        p_email: contact.email || null,
        p_phone: contact.phone || null,
      });
      if (foundUser) {
        linkedUserId = foundUser;
      }
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contact,
        owner_id: user.id,
        linked_user_id: linkedUserId,
      })
      .select()
      .single();

    if (!error && linkedUserId) {
      // Auto-send friendship request if user is registered
      await sendFriendshipRequest(linkedUserId);
    }

    if (!error) {
      await fetchContacts();
    }
    return { data, error };
  };

  const addMultipleContacts = async (newContacts: Omit<ContactInsert, 'owner_id'>[]) => {
    if (!user) return { error: new Error('Non autenticato') };

    const contactsWithOwner = newContacts.map((c) => ({
      ...c,
      owner_id: user.id,
    }));

    const { error } = await supabase.from('contacts').insert(contactsWithOwner);

    if (!error) {
      // Check each contact for registered users
      for (const contact of newContacts) {
        if (contact.email || contact.phone) {
          const { data: foundUser } = await supabase.rpc('find_user_by_contact', {
            p_email: contact.email || null,
            p_phone: contact.phone || null,
          });
          if (foundUser) {
            await sendFriendshipRequest(foundUser);
          }
        }
      }
      await fetchContacts();
    }
    return { error };
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id);
    if (!error) {
      await fetchContacts();
    }
    return { error };
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (!error) {
      await fetchContacts();
    }
    return { error };
  };

  const sendFriendshipRequest = async (addresseeId: string) => {
    if (!user) return;
    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) return; // Already exists

    await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: addresseeId,
    });

    // Create notification for addressee
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    await supabase.from('notifications').insert({
      user_id: addresseeId,
      type: 'friendship_request',
      title: 'Nuova richiesta di amicizia',
      message: `${profile?.full_name || 'Un utente'} ti ha inviato una richiesta di amicizia.`,
      data: { requester_id: user.id },
    });
  };

  return {
    contacts,
    loading,
    addContact,
    addMultipleContacts,
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts,
  };
}
