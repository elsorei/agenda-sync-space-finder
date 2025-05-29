
// Google Calendar API service
export interface GoogleCalendarConfig {
  apiKey: string;
  clientId: string;
  discoveryDoc: string;
  scopes: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus: string;
  }>;
}

class GoogleCalendarService {
  private gapi: any;
  private isInitialized = false;
  private isSignedIn = false;
  
  private config: GoogleCalendarConfig = {
    apiKey: 'YOUR_API_KEY', // L'utente dovrà inserire la sua API key
    clientId: 'YOUR_CLIENT_ID', // L'utente dovrà inserire il suo client ID
    discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    scopes: 'https://www.googleapis.com/auth/calendar'
  };

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Load Google API
      await this.loadGoogleAPI();
      
      await this.gapi.load('client:auth2', async () => {
        await this.gapi.client.init({
          apiKey: this.config.apiKey,
          clientId: this.config.clientId,
          discoveryDocs: [this.config.discoveryDoc],
          scope: this.config.scopes
        });
        
        this.isInitialized = true;
        this.updateSignInStatus();
      });
      
      return true;
    } catch (error) {
      console.error('Errore nell\'inizializzazione di Google Calendar:', error);
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapi = window.gapi;
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private updateSignInStatus(): void {
    if (this.gapi?.auth2) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      this.isSignedIn = authInstance?.isSignedIn?.get() || false;
    }
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      this.updateSignInStatus();
      return this.isSignedIn;
    } catch (error) {
      console.error('Errore nel sign-in:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (this.gapi?.auth2) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.isSignedIn = false;
    }
  }

  getSignInStatus(): boolean {
    return this.isSignedIn;
  }

  async getCalendars(): Promise<any[]> {
    if (!this.isSignedIn) {
      throw new Error('Utente non autenticato');
    }

    try {
      const response = await this.gapi.client.calendar.calendarList.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Errore nel recupero dei calendari:', error);
      throw error;
    }
  }

  async getEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<GoogleCalendarEvent[]> {
    if (!this.isSignedIn) {
      throw new Error('Utente non autenticato');
    }

    try {
      const request = {
        calendarId,
        timeMin: timeMin?.toISOString() || new Date().toISOString(),
        timeMax: timeMax?.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime'
      };

      const response = await this.gapi.client.calendar.events.list(request);
      return response.result.items || [];
    } catch (error) {
      console.error('Errore nel recupero degli eventi:', error);
      throw error;
    }
  }

  async createEvent(calendarId: string = 'primary', event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn) {
      throw new Error('Utente non autenticato');
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId,
        resource: event
      });
      return response.result;
    } catch (error) {
      console.error('Errore nella creazione dell\'evento:', error);
      throw error;
    }
  }

  async updateEvent(calendarId: string = 'primary', eventId: string, event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn) {
      throw new Error('Utente non autenticato');
    }

    try {
      const response = await this.gapi.client.calendar.events.update({
        calendarId,
        eventId,
        resource: event
      });
      return response.result;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'evento:', error);
      throw error;
    }
  }

  async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('Utente non autenticato');
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId,
        eventId
      });
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'evento:', error);
      throw error;
    }
  }

  // Metodo per aggiornare le credenziali
  updateCredentials(apiKey: string, clientId: string): void {
    this.config.apiKey = apiKey;
    this.config.clientId = clientId;
    this.isInitialized = false; // Richiede re-inizializzazione
  }
}

// Singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Type declaration for window.gapi
declare global {
  interface Window {
    gapi: any;
  }
}
