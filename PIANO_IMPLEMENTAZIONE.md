# Piano di Implementazione - App Agenda Multiutente Cloud

## Stack Tecnologico Scelto

### Frontend (già presente)
- **React 18 + TypeScript** - UI framework
- **Vite** - Build tool
- **Capacitor** - Deploy iOS/Android
- **shadcn-ui + Tailwind CSS** - UI components
- **React Query** - Server state management
- **React Router** - Routing

### Backend (da implementare)
- **Supabase** - Backend-as-a-Service
  - **PostgreSQL** - Database relazionale
  - **Auth** - Autenticazione (email/password + magic link)
  - **Realtime** - Notifiche in tempo reale
  - **Storage** - File allegati
  - **Edge Functions** - Logica server-side (invio email, cron jobs)
  - **Row Level Security (RLS)** - Sicurezza dati per utente

### Motivazione scelta Supabase
- Scalabilità verticale inclusa (piano Pro scala automaticamente)
- Realtime built-in per notifiche push
- Auth completo con email verification
- Storage per allegati
- Edge Functions per logica server (email, reminder)
- RLS per sicurezza multi-tenant
- Compatibile con l'architettura container proposta (multi-project per regione)
- Era già stato integrato nel progetto

---

## Fasi di Implementazione

### FASE 1 - Infrastruttura Backend & Auth
1. Setup Supabase (client, tipi, configurazione)
2. Schema Database completo (migrazioni SQL)
3. Row Level Security policies
4. Sistema di autenticazione (registrazione con verifica email, login, logout)
5. Pagine: Onboarding, Login, Registrazione, Verifica Email
6. Profilo utente (visualizza, modifica, cancella account)

### FASE 2 - Rubrica & Sistema Amicizie
1. CRUD Contatti (nuovo, importa, lista, modifica, elimina)
2. Sistema richieste amicizia (invio, accetta, rifiuta)
3. Verifica automatica contatti registrati
4. Notifiche richieste amicizia
5. Gestione stati amicizia (colori nella lista)
6. Importazione contatti da rubrica (Capacitor Contacts plugin)

### FASE 3 - Eventi & Appuntamenti
1. CRUD Eventi con tutti i campi specificati
2. Sistema inviti multi-utente
3. Gestione stati evento (sospeso, in attesa, confermato, annullato)
4. RSVP con scadenze
5. Comunicazioni differenziate per tipo contatto
6. Allegati file (Supabase Storage)
7. Viste calendario (giorno, settimana, mese) - già parzialmente implementate

### FASE 4 - Notifiche & Comunicazioni
1. Sistema notifiche in-app (Supabase Realtime)
2. Email transazionali (Supabase Edge Functions + Resend/SendGrid)
3. Reminder automatici (1gg, 6h, 1h prima scadenza)
4. Link conferma/rifiuto via email con token
5. Push notifications (Capacitor + FCM/APNs)

### FASE 5 - Features Avanzate
1. Todo List con reminder
2. Auto-check disponibilità utenti
3. Free Slot Finder migliorato (basato su dati reali)
4. Dashboard con contatori reali
5. Sezione avvisi/notifiche in dashboard
6. Gestione privacy e impostazioni

### FASE 6 - Ottimizzazione & Deploy
1. Ottimizzazione performance
2. Test end-to-end
3. Build iOS/Android con Capacitor
4. Deploy production
5. Monitoraggio e logging

---

## Schema Database (PostgreSQL via Supabase)

### Tabelle principali:

```sql
-- Profili utente (estende auth.users di Supabase)
profiles (id, email, full_name, phone, avatar_url, created_at, updated_at)

-- Contatti in rubrica
contacts (id, owner_id, name, email, phone, notes, linked_user_id, created_at)

-- Sistema amicizia
friendships (id, requester_id, addressee_id, status[pending/accepted/rejected], created_at, updated_at)

-- Eventi/Appuntamenti
events (id, creator_id, title, description, start_date, end_date, type, status, rsvp_deadline, created_at, updated_at)

-- Partecipanti eventi
event_participants (id, event_id, user_id, status[pending/accepted/declined], is_reserve, invited_at, responded_at)

-- Inviti esterni (non registrati)
event_external_invites (id, event_id, email, phone, name, status, token, invited_at, responded_at)

-- Allegati
event_attachments (id, event_id, file_name, file_type, file_size, storage_path, uploaded_by, uploaded_at)

-- Notifiche
notifications (id, user_id, type, title, message, data, read, created_at)

-- Todo List
todos (id, user_id, title, description, due_date, reminder_at, completed, priority, created_at)
```

---

## Note sull'Architettura Container Proposta

L'architettura "container" descritta nelle specifiche è implementabile con Supabase tramite:
- **Multi-project**: un progetto Supabase "master" per auth/routing + progetti regionali
- **Database Links**: per collegare i progetti
- **Edge Functions**: per il routing intelligente

Per la fase iniziale, un singolo progetto Supabase è sufficiente.
Quando il traffico crescerà, si può migrare verso l'architettura multi-project
senza cambiare il codice frontend (basta cambiare l'URL del client Supabase).
