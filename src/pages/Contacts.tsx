import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  UserPlus,
  Upload,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';
import type { FriendshipStatus } from '@/types/database';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  registered_friend: { label: 'Amico', color: 'bg-green-500', icon: UserCheck },
  registered_pending: { label: 'In attesa', color: 'bg-yellow-500', icon: Clock },
  registered_rejected: { label: 'Rifiutato', color: 'bg-red-500', icon: UserX },
  registered_none: { label: 'Registrato', color: 'bg-blue-500', icon: UserCheck },
  unregistered: { label: 'Non registrato', color: 'bg-gray-400', icon: UserX },
};

export default function Contacts() {
  const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();
  const { pendingRequests, acceptFriendship, rejectFriendship, getFriendshipStatus } = useFriendships();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });

  const getContactStatus = (contact: { linked_user_id: string | null }) => {
    if (!contact.linked_user_id) return 'unregistered';
    const status = getFriendshipStatus(contact.linked_user_id);
    if (status === 'accepted') return 'registered_friend';
    if (status === 'pending') return 'registered_pending';
    if (status === 'rejected') return 'registered_rejected';
    return 'registered_none';
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
  );

  const handleAddContact = async () => {
    if (!formData.name.trim()) return;
    const { error } = await addContact(formData);
    if (error) {
      toast({ title: 'Errore', description: 'Impossibile aggiungere il contatto.', variant: 'destructive' });
    } else {
      toast({ title: 'Contatto aggiunto' });
      setFormData({ name: '', email: '', phone: '', notes: '' });
      setShowNewDialog(false);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;
    const { error } = await updateContact(editingContact, formData);
    if (error) {
      toast({ title: 'Errore', description: 'Impossibile aggiornare il contatto.', variant: 'destructive' });
    } else {
      toast({ title: 'Contatto aggiornato' });
      setEditingContact(null);
    }
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await deleteContact(id);
    if (error) {
      toast({ title: 'Errore', description: 'Impossibile eliminare il contatto.', variant: 'destructive' });
    } else {
      toast({ title: 'Contatto eliminato' });
    }
  };

  const handleAcceptFriendship = async (id: string) => {
    const result = await acceptFriendship(id);
    if (result?.error) {
      toast({ title: 'Errore', variant: 'destructive' });
    } else {
      toast({ title: 'Amicizia accettata!' });
    }
  };

  const handleRejectFriendship = async (id: string) => {
    const result = await rejectFriendship(id);
    if (result?.error) {
      toast({ title: 'Errore', variant: 'destructive' });
    } else {
      toast({ title: 'Richiesta rifiutata' });
    }
  };

  const ContactForm = ({ onSave, saveLabel }: { onSave: () => void; saveLabel: string }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome e cognome"
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@esempio.it"
        />
      </div>
      <div className="space-y-2">
        <Label>Telefono</Label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+39 ..."
        />
      </div>
      <div className="space-y-2">
        <Label>Note</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Note aggiuntive..."
        />
      </div>
      <Button onClick={onSave} className="w-full">
        {saveLabel}
      </Button>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Rubrica</h1>
        <Button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', notes: '' });
            setShowNewDialog(true);
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nuovo contatto
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="list">Lista contatti</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Richieste
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="import">Importa</TabsTrigger>
        </TabsList>

        {/* LISTA CONTATTI */}
        <TabsContent value="list">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca contatti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {contacts.length === 0
                  ? 'Nessun contatto. Aggiungi il tuo primo contatto!'
                  : 'Nessun risultato per la ricerca.'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => {
                const status = getContactStatus(contact);
                const config = statusConfig[status];
                const initials = contact.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card key={contact.id} className="hover:bg-secondary/20 transition-colors">
                    <CardContent className="flex items-center gap-4 py-3 px-4">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${config.color}`}
                          title={config.label}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contact.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {contact.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <Badge variant="outline" className="shrink-0">
                        {config.label}
                      </Badge>

                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              name: contact.name,
                              email: contact.email || '',
                              phone: contact.phone || '',
                              notes: contact.notes || '',
                            });
                            setEditingContact(contact.id);
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
                              <AlertDialogTitle>Elimina contatto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare {contact.name} dalla rubrica?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteContact(contact.id)}>
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
        </TabsContent>

        {/* RICHIESTE DI AMICIZIA */}
        <TabsContent value="requests">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nessuna richiesta di amicizia in sospeso.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const requester = request.requester_profile;
                const initials = requester?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || '??';

                return (
                  <Card key={request.id}>
                    <CardContent className="flex items-center gap-4 py-4 px-4">
                      <Avatar>
                        <AvatarFallback
                          style={{ backgroundColor: requester?.color || '#9b87f5' }}
                          className="text-white"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{requester?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{requester?.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptFriendship(request.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accetta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectFriendship(request.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rifiuta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* IMPORTA CONTATTI */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importa dalla rubrica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                L'importazione dalla rubrica del telefono e disponibile nella versione mobile dell'app
                (iOS e Android tramite Capacitor).
              </p>
              <p className="text-sm text-muted-foreground">
                Nella versione web, puoi aggiungere i contatti manualmente utilizzando il
                pulsante "Nuovo contatto" in alto a destra.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: 'Funzione mobile',
                    description: 'L\'importazione dalla rubrica e disponibile solo nell\'app mobile.',
                  });
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importa contatti
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog nuovo contatto */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo contatto</DialogTitle>
          </DialogHeader>
          <ContactForm onSave={handleAddContact} saveLabel="Aggiungi" />
        </DialogContent>
      </Dialog>

      {/* Dialog modifica contatto */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica contatto</DialogTitle>
          </DialogHeader>
          <ContactForm onSave={handleUpdateContact} saveLabel="Salva modifiche" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
