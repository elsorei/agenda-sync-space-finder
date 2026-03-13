import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/types/database';

type Todo = Database['public']['Tables']['todos']['Row'];

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    setTodos(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (todo: {
    title: string;
    description?: string;
    due_date?: Date | null;
    reminder_at?: Date | null;
    priority?: number;
  }) => {
    if (!user) return { error: new Error('Non autenticato') };
    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title: todo.title,
        description: todo.description || null,
        due_date: todo.due_date?.toISOString() || null,
        reminder_at: todo.reminder_at?.toISOString() || null,
        priority: todo.priority || 0,
      })
      .select()
      .single();

    if (!error) {
      await fetchTodos();
    }
    return { data, error };
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const { error } = await supabase.from('todos').update(updates).eq('id', id);
    if (!error) {
      await fetchTodos();
    }
    return { error };
  };

  const toggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    return updateTodo(id, { completed: !todo.completed });
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) {
      await fetchTodos();
    }
    return { error };
  };

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    refreshTodos: fetchTodos,
  };
}
