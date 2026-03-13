import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import { User, LogOut, Trash2, Save } from 'lucide-react';

export default function Profile() {
  const { profile, signOut, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    color: profile?.color || '#9b87f5',
  });

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile(formData);
    setIsSaving(false);

    if (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il profilo.',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Profilo aggiornato' });
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    if (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'account.',
        variant: 'destructive',
      });
    } else {
      navigate('/login');
    }
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profilo</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback
                className="text-xl font-bold text-white"
                style={{ backgroundColor: profile?.color || '#9b87f5' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile?.full_name}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+39 ..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Qualcosa su di te..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Colore calendario</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.color}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvataggio...' : 'Salva'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annulla
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Telefono</p>
                  <p>{profile?.phone || 'Non specificato'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Colore</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: profile?.color }}
                    />
                    <span>{profile?.color}</span>
                  </div>
                </div>
              </div>
              {profile?.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p>{profile.bio}</p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    bio: profile?.bio || '',
                    color: profile?.color || '#9b87f5',
                  });
                  setIsEditing(true);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Modifica profilo
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Esci dall'account
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non può essere annullata. Tutti i tuoi dati, eventi,
                contatti e impostazioni verranno eliminati permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>
                Elimina definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
