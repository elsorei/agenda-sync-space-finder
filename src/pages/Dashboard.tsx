import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useTodos } from '@/hooks/useTodos';
import { useContacts } from '@/hooks/useContacts';
import { useFriendships } from '@/hooks/useFriendships';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Bell,
  CheckSquare,
  UserPlus,
  Clock,
  CalendarCheck,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { isToday, isFuture, format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Dashboard() {
  const { profile } = useAuth();
  const { events } = useEvents();
  const { todos } = useTodos();
  const { contacts } = useContacts();
  const { friendships, pendingRequests } = useFriendships();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  // Calculate stats
  const todayEvents = events.filter(
    (e) => isToday(e.start) && e.status !== 'cancelled'
  );
  const pendingInvites = events.filter(
    (e) =>
      !e.is_creator &&
      e.participants.some(
        (p) => p.user_id === profile?.id && p.status === 'pending'
      )
  );
  const eventsToConfirm = events.filter(
    (e) => e.is_creator && e.status === 'pending_confirmations'
  );
  const todosToday = todos.filter(
    (t) => !t.completed && t.due_date && isToday(new Date(t.due_date))
  );
  const incompleteTodos = todos.filter((t) => !t.completed);

  const alerts: { message: string; action: string; path: string }[] = [];
  if (contacts.length === 0) {
    alerts.push({
      message: 'Non hai ancora aggiunto contatti. Importa o aggiungi i tuoi contatti!',
      action: 'Vai alla Rubrica',
      path: '/contacts',
    });
  }
  if (pendingRequests.length > 0) {
    alerts.push({
      message: `Hai ${pendingRequests.length} richieste di amicizia in sospeso.`,
      action: 'Vedi richieste',
      path: '/contacts',
    });
  }

  const stats = [
    {
      icon: CalendarDays,
      label: 'Eventi oggi',
      value: todayEvents.length,
      color: 'text-blue-500',
      path: '/',
    },
    {
      icon: Bell,
      label: 'Inviti ricevuti',
      value: pendingInvites.length,
      color: 'text-orange-500',
      path: '/',
    },
    {
      icon: CalendarCheck,
      label: 'Da confermare',
      value: eventsToConfirm.length,
      color: 'text-yellow-500',
      path: '/',
    },
    {
      icon: UserPlus,
      label: 'Richieste amicizia',
      value: pendingRequests.length,
      color: 'text-purple-500',
      path: '/contacts',
    },
    {
      icon: Users,
      label: 'Amicizie',
      value: friendships.length,
      color: 'text-green-500',
      path: '/friendships',
    },
    {
      icon: Users,
      label: 'Contatti',
      value: contacts.length,
      color: 'text-cyan-500',
      path: '/contacts',
    },
    {
      icon: CheckSquare,
      label: 'Cose da fare oggi',
      value: todosToday.length,
      color: 'text-red-500',
      path: '/todos',
    },
    {
      icon: Clock,
      label: 'Todo in sospeso',
      value: incompleteTodos.length,
      color: 'text-gray-500',
      path: '/todos',
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bentornato/a, {profile?.full_name || 'Utente'}
          </p>
        </div>
        <Button onClick={() => navigate('/')} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nuovo evento
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map((alert, i) => (
            <Card key={i} className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="flex-1 text-sm">{alert.message}</p>
                <Button size="sm" variant="outline" onClick={() => navigate(alert.path)}>
                  {alert.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer hover:bg-secondary/20 transition-colors"
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming events and todos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Prossimi eventi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.filter((e) => isFuture(e.start) && e.status !== 'cancelled').length === 0 ? (
              <p className="text-muted-foreground text-sm">Nessun evento in programma.</p>
            ) : (
              <div className="space-y-3">
                {events
                  .filter((e) => isFuture(e.start) && e.status !== 'cancelled')
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.start, 'PPp', { locale: it })}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {event.status === 'confirmed'
                          ? 'Confermato'
                          : event.status === 'pending_confirmations'
                          ? 'In attesa'
                          : event.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Cose da fare
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incompleteTodos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nessun todo in sospeso.</p>
            ) : (
              <div className="space-y-3">
                {incompleteTodos.slice(0, 5).map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{todo.title}</p>
                      {todo.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Scadenza: {format(new Date(todo.due_date), 'PP', { locale: it })}
                        </p>
                      )}
                    </div>
                    {todo.priority > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        P{todo.priority}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
