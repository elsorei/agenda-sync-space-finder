import { useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { UserCheck, UserMinus } from 'lucide-react';

export default function Friendships() {
  const { user } = useAuth();
  const { friendships, loading, revokeFriendship } = useFriendships();

  const handleRevoke = async (id: string) => {
    const result = await revokeFriendship(id);
    if (result?.error) {
      toast({ title: 'Errore', variant: 'destructive' });
    } else {
      toast({ title: 'Amicizia revocata' });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Amicizie</h1>
        <Badge variant="secondary">{friendships.length}</Badge>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : friendships.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Non hai ancora amicizie confermate. Aggiungi contatti dalla Rubrica per inviare richieste di amicizia.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {friendships.map((friendship) => {
            const friend =
              friendship.requester_id === user?.id
                ? friendship.addressee_profile
                : friendship.requester_profile;

            const initials = friend?.full_name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || '??';

            return (
              <Card key={friendship.id} className="hover:bg-secondary/20 transition-colors">
                <CardContent className="flex items-center gap-4 py-4 px-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback
                      className="text-white font-bold"
                      style={{ backgroundColor: friend?.color || '#9b87f5' }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-medium text-lg">{friend?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{friend?.email}</p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Amici dal {new Date(friendship.updated_at).toLocaleDateString('it-IT')}
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserMinus className="w-4 h-4 mr-1" />
                        Revoca
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoca amicizia</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sei sicuro di voler revocare l'amicizia con {friend?.full_name}?
                          Non potrete piu invitarvi a vicenda agli eventi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevoke(friendship.id)}>
                          Revoca
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
