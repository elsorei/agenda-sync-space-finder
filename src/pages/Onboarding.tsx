import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Bell, CheckCircle } from 'lucide-react';

const slides = [
  {
    icon: CalendarDays,
    title: 'La tua agenda in cloud',
    description:
      'Gestisci i tuoi appuntamenti ovunque ti trovi. Sincronizzazione in tempo reale su tutti i tuoi dispositivi.',
  },
  {
    icon: Users,
    title: 'Multiutente',
    description:
      'Invita i tuoi contatti agli eventi, condividi il calendario e coordina gli appuntamenti con facilità.',
  },
  {
    icon: Bell,
    title: 'Notifiche intelligenti',
    description:
      'Ricevi promemoria, richieste di conferma e aggiornamenti sugli eventi. Non perderai più nessun appuntamento.',
  },
  {
    icon: CheckCircle,
    title: 'Todo List integrata',
    description:
      'Organizza le cose da fare con priorità e scadenze. Tutto in un\'unica app.',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/login');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/login');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{slide.title}</h1>
          <p className="text-muted-foreground text-lg">{slide.description}</p>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentSlide ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleNext} size="lg" className="w-full">
            {currentSlide < slides.length - 1 ? 'Avanti' : 'Inizia'}
          </Button>
          {currentSlide < slides.length - 1 && (
            <Button variant="ghost" onClick={handleSkip} className="w-full">
              Salta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
