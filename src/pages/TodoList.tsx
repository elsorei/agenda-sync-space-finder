import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function TodoList() {
  const { todos, loading, addTodo, toggleComplete, updateTodo, deleteTodo } = useTodos();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 0,
  });

  const handleAdd = async () => {
    if (!formData.title.trim()) return;
    const { error } = await addTodo({
      title: formData.title,
      description: formData.description || undefined,
      due_date: formData.due_date ? new Date(formData.due_date) : null,
      priority: formData.priority,
    });
    if (error) {
      toast({ title: 'Errore', variant: 'destructive' });
    } else {
      toast({ title: 'Todo aggiunto' });
      setFormData({ title: '', description: '', due_date: '', priority: 0 });
      setShowNewDialog(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingTodo) return;
    const { error } = await updateTodo(editingTodo, {
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      priority: formData.priority,
    });
    if (error) {
      toast({ title: 'Errore', variant: 'destructive' });
    } else {
      toast({ title: 'Todo aggiornato' });
      setEditingTodo(null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTodo(id);
    if (result?.error) {
      toast({ title: 'Errore', variant: 'destructive' });
    } else {
      toast({ title: 'Todo eliminato' });
    }
  };

  const handleToggle = async (id: string) => {
    await toggleComplete(id);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const TodoForm = ({ onSave, saveLabel }: { onSave: () => void; saveLabel: string }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titolo *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Cosa devi fare?"
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />
      </div>
      <div className="space-y-2">
        <Label>Descrizione</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Dettagli..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Scadenza</Label>
          <Input
            type="datetime-local"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Priorità</Label>
          <Select
            value={formData.priority.toString()}
            onValueChange={(v) => setFormData({ ...formData, priority: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Normale</SelectItem>
              <SelectItem value="1">Media</SelectItem>
              <SelectItem value="2">Alta</SelectItem>
              <SelectItem value="3">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={onSave} className="w-full">
        {saveLabel}
      </Button>
    </div>
  );

  const priorityLabels: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    0: { label: 'Normale', variant: 'outline' },
    1: { label: 'Media', variant: 'secondary' },
    2: { label: 'Alta', variant: 'default' },
    3: { label: 'Urgente', variant: 'destructive' },
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="pending">In sospeso</SelectItem>
              <SelectItem value="completed">Completati</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setFormData({ title: '', description: '', due_date: '', priority: 0 });
              setShowNewDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : filteredTodos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {todos.length === 0
              ? 'Nessun todo. Aggiungine uno!'
              : 'Nessun todo per questo filtro.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo) => {
            const prio = priorityLabels[todo.priority] || priorityLabels[0];
            return (
              <Card
                key={todo.id}
                className={`transition-colors ${todo.completed ? 'opacity-60' : ''}`}
              >
                <CardContent className="flex items-start gap-3 py-3 px-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggle(todo.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        todo.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                    )}
                    {todo.due_date && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(todo.due_date), 'PPp', { locale: it })}
                      </p>
                    )}
                  </div>
                  <Badge variant={prio.variant} className="shrink-0 text-xs">
                    {prio.label}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          title: todo.title,
                          description: todo.description || '',
                          due_date: todo.due_date
                            ? new Date(todo.due_date).toISOString().slice(0, 16)
                            : '',
                          priority: todo.priority,
                        });
                        setEditingTodo(todo.id);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Elimina todo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questo todo?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(todo.id)}>
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Todo dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Todo</DialogTitle>
          </DialogHeader>
          <TodoForm onSave={handleAdd} saveLabel="Aggiungi" />
        </DialogContent>
      </Dialog>

      {/* Edit Todo dialog */}
      <Dialog open={!!editingTodo} onOpenChange={(open) => !open && setEditingTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Todo</DialogTitle>
          </DialogHeader>
          <TodoForm onSave={handleUpdate} saveLabel="Salva modifiche" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
