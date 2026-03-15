import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function VerifyEmail() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Controlla la tua email</CardTitle>
          <CardDescription>
            Ti abbiamo inviato un'email di conferma. Clicca sul link contenuto nell'email per attivare il tuo account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Se non trovi l'email, controlla nella cartella spam. Il link di conferma scade dopo 24 ore.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Torna al login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
