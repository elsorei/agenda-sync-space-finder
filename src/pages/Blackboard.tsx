
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { User } from "@/types";
import { mockUsers } from "@/data/mockData";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  userId: string;
  timestamp: Date;
}

interface Board {
  id: string;
  name: string;
  messages: Message[];
  userIds: string[]; // Massimo 10 utenti
}

const MAX_USERS_PER_BOARD = 10; // Costante configurabile per il numero massimo di utenti

const Blackboard = () => {
  const [users] = useState<User[]>(mockUsers);
  const [boards, setBoards] = useState<Board[]>([
    {
      id: "board-1",
      name: "Idee Progetto",
      userIds: [users[0].id, users[1].id, users[2].id],
      messages: [
        {
          id: "msg-1",
          content: "Dobbiamo considerare di includere una timeline nel prossimo sprint.",
          userId: users[0].id,
          timestamp: new Date(Date.now() - 3600000), // 1 ora fa
        },
        {
          id: "msg-2",
          content: "Sono d'accordo. Inoltre, potremmo aggiungere un sistema di notifiche.",
          userId: users[1].id,
          timestamp: new Date(Date.now() - 1800000), // 30 minuti fa
        },
      ],
    },
  ]);
  
  // Board corrente
  const [currentBoardId, setCurrentBoardId] = useState<string>(boards[0]?.id || "");
  const currentBoard = boards.find(board => board.id === currentBoardId);
  
  // Nuovo messaggio
  const [newMessage, setNewMessage] = useState("");
  
  // Stato per la gestione dell'aggiunta di un nuovo utente
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentBoard) return;
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      userId: users[0].id, // Utente corrente (hardcoded per ora)
      timestamp: new Date(),
    };
    
    const updatedBoards = boards.map(board => 
      board.id === currentBoardId
        ? { ...board, messages: [...board.messages, message] }
        : board
    );
    
    setBoards(updatedBoards);
    setNewMessage("");
  };
  
  // Formato ora del messaggio
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Lista utenti che possono essere aggiunti alla board
  const availableUsers = users.filter(
    user => !currentBoard?.userIds.includes(user.id)
  );
  
  // Gestione dell'aggiunta di un nuovo utente alla board
  const handleAddUser = () => {
    if (!selectedUserToAdd || !currentBoard) return;
    
    // Controllo sul numero massimo di utenti
    if (currentBoard.userIds.length >= MAX_USERS_PER_BOARD) {
      toast({
        title: "Limite raggiunto",
        description: `Non è possibile aggiungere più di ${MAX_USERS_PER_BOARD} utenti a una lavagna.`,
        variant: "destructive",
      });
      return;
    }
    
    // Aggiungiamo l'utente selezionato
    const updatedBoards = boards.map(board => 
      board.id === currentBoardId
        ? { ...board, userIds: [...board.userIds, selectedUserToAdd] }
        : board
    );
    
    setBoards(updatedBoards);
    setIsAddingUser(false);
    setSelectedUserToAdd("");
    
    toast({
      title: "Utente aggiunto",
      description: "L'utente è stato aggiunto alla lavagna.",
    });
  };
  
  // Gestione della creazione di una nuova lavagna
  const handleCreateBoard = () => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: `Nuova Lavagna ${boards.length + 1}`,
      userIds: [users[0].id], // Solo l'utente corrente inizialmente
      messages: [],
    };
    
    setBoards([...boards, newBoard]);
    setCurrentBoardId(newBoard.id);
    
    toast({
      title: "Lavagna creata",
      description: "Una nuova lavagna è stata creata con successo.",
    });
  };
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Blackboard</h1>
      
      <div className="flex mb-6 gap-4">
        <Select
          value={currentBoardId}
          onValueChange={setCurrentBoardId}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Seleziona una lavagna" />
          </SelectTrigger>
          <SelectContent>
            {boards.map((board) => (
              <SelectItem key={board.id} value={board.id}>
                {board.name} ({board.userIds.length} utenti)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={handleCreateBoard}>
          Crea Nuova Lavagna
        </Button>
      </div>
      
      {currentBoard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Lista utenti della board */}
          <div className="md:col-span-1 p-4 border rounded-lg bg-background">
            <h3 className="font-medium mb-4">Utenti ({currentBoard.userIds.length}/{MAX_USERS_PER_BOARD})</h3>
            <div className="space-y-3">
              {currentBoard.userIds.map(userId => {
                const user = users.find(u => u.id === userId);
                if (!user) return null;
                
                return (
                  <div key={userId} className="flex items-center">
                    <UserAvatar user={user} showName />
                  </div>
                );
              })}
              
              {/* UI per aggiungere nuovi utenti */}
              {isAddingUser ? (
                <div className="mt-2 space-y-2">
                  <Select
                    value={selectedUserToAdd}
                    onValueChange={setSelectedUserToAdd}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona utente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-1/2"
                      onClick={handleAddUser}
                      disabled={!selectedUserToAdd}
                    >
                      Aggiungi
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-1/2"
                      onClick={() => {
                        setIsAddingUser(false);
                        setSelectedUserToAdd("");
                      }}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                currentBoard.userIds.length < MAX_USERS_PER_BOARD && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setIsAddingUser(true)}
                    disabled={availableUsers.length === 0}
                  >
                    Aggiungi Utente
                  </Button>
                )
              )}
            </div>
          </div>
          
          {/* Board dei messaggi */}
          <div className="md:col-span-3 border rounded-lg bg-background flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b">
              <h2 className="font-semibold">{currentBoard.name}</h2>
            </div>
            
            {/* Messaggi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentBoard.messages.map((message) => {
                const sender = users.find(u => u.id === message.userId);
                if (!sender) return null;
                
                const isCurrentUser = message.userId === users[0].id;
                
                return (
                  <div 
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-[80%]",
                      isCurrentUser ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <UserAvatar user={sender} size="sm" />
                    <div>
                      <div className={cn(
                        "p-3 rounded-lg",
                        isCurrentUser 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary"
                      )}>
                        {message.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        {!isCurrentUser && <span>{sender.name}</span>}
                        <span>{formatMessageTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Separator />
            
            {/* Input per nuovo messaggio */}
            <div className="p-4 flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi un messaggio..."
                className="min-h-[80px]"
              />
              <Button onClick={handleSendMessage}>Invia</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blackboard;
