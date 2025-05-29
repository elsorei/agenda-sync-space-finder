
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { googleCalendarService } from '@/services/googleCalendar';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Calendar, Settings, Key } from 'lucide-react';

export const GoogleCalendarSetup = () => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const { isSignedIn, signIn, signOut, isLoading } = useGoogleCalendar();

  const handleSaveCredentials = () => {
    if (apiKey && clientId) {
      googleCalendarService.updateCredentials(apiKey, clientId);
      setShowSetup(false);
      // Salva le credenziali nel localStorage per persistenza
      localStorage.setItem('google_api_key', apiKey);
      localStorage.setItem('google_client_id', clientId);
    }
  };

  // Carica le credenziali salvate al mount
  useState(() => {
    const savedApiKey = localStorage.getItem('google_api_key');
    const savedClientId = localStorage.getItem('google_client_id');
    if (savedApiKey && savedClientId) {
      setApiKey(savedApiKey);
      setClientId(savedClientId);
      googleCalendarService.updateCredentials(savedApiKey, savedClientId);
    }
  });

  if (showSetup) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurazione Google Calendar
          </CardTitle>
          <CardDescription>
            Inserisci le tue credenziali Google Calendar API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              Per ottenere le credenziali:
              <br />1. Vai su Google Cloud Console
              <br />2. Crea un progetto e abilita Calendar API
              <br />3. Crea credenziali OAuth 2.0 e API Key
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              placeholder="Inserisci la tua Google API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              placeholder="Inserisci il tuo Google Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSaveCredentials} disabled={!apiKey || !clientId}>
              Salva
            </Button>
            <Button variant="outline" onClick={() => setShowSetup(false)}>
              Annulla
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar
        </CardTitle>
        <CardDescription>
          Sincronizza i tuoi eventi con Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSignedIn ? (
          <div className="space-y-2">
            <Button onClick={signIn} disabled={isLoading} className="w-full">
              {isLoading ? 'Connessione...' : 'Connetti a Google Calendar'}
            </Button>
            <Button variant="outline" onClick={() => setShowSetup(true)} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configura credenziali
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-green-600">✓ Connesso a Google Calendar</p>
            <Button onClick={signOut} variant="outline" className="w-full">
              Disconnetti
            </Button>
            <Button variant="outline" onClick={() => setShowSetup(true)} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Modifica credenziali
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
