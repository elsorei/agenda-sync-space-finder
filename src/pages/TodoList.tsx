
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { mockUsers } from "@/data/mockData";
import { UserAvatar } from "@/components/UserAvatar";

interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  assignedToId?: string;
  createdAt: Date;
}

const TodoList = () => {
  const [users] = useState<User[]>(mockUsers);
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: "1",
      content: "Preparare presentazione per cliente",
      completed: false,
      assignedToId: users[0].id,
      createdAt: new Date(),
    },
    {
      id: "2",
      content: "Revisione documenti progetto",
      completed: true,
      assignedToId: users[1].id,
      createdAt: new Date(),
    },
    {
      id: "3",
      content: "Aggiornare roadmap",
      completed: false,
      createdAt: new Date(),
    },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo: TodoItem = {
      id: Date.now().toString(),
      content: newTodo,
      completed: false,
      createdAt: new Date(),
    };
    
    setTodos([...todos, todo]);
    setNewTodo("");
  };

  const handleToggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Todo List</h1>
      
      <div className="flex gap-3 mb-6">
        <Input
          type="text"
          placeholder="Aggiungi nuovo todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="max-w-md"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddTodo();
            }
          }}
        />
        <Button onClick={handleAddTodo}>Aggiungi</Button>
      </div>
      
      <div className="space-y-4">
        {todos.length === 0 ? (
          <p className="text-muted-foreground">Nessun todo da mostrare.</p>
        ) : (
          todos.map((todo) => {
            const assignedUser = users.find(user => user.id === todo.assignedToId);
            
            return (
              <div
                key={todo.id}
                className="flex items-center p-3 border rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleComplete(todo.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`todo-${todo.id}`}
                    className={`${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.content}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creato il: {todo.createdAt.toLocaleDateString()}
                  </p>
                </div>
                {assignedUser && (
                  <div className="ml-4">
                    <UserAvatar user={assignedUser} size="sm" showName />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodoList;
