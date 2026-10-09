
// services/googleCalendarService.ts
// Główna architektura Christian Culture Global
// v4.5.870 - Soli Deo Gloria

declare global {
  interface Window {
    gapi: any;
    gapi_onload: () => void;
  }
}

const CLIENT_ID = '553245611022-9hvn6787p6pgjtflrpt2790svci9ecrq.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];

/**
 * ZAKRESY UŚWIĘCENIA (SCOPES)
 * drive.file -> Tworzenie certyfikatów PDF Uniwersytetu Biblijnego
 * drive.appdata -> Przechowywanie ukrytych postępów systemu Joshua 5.10.15
 * calendar.freebusy -> Sprawdzanie wolnych pór na modlitwę (Pełna prywatność treści)
 */
const SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/calendar.freebusy"
].join(' ');

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private isGapiLoaded: boolean = false;
  private isGapiClientLoaded: boolean = false;
  private authInstance: any = null;
  private resolveClientReady: ((value?: unknown) => void) | null = null;
  private clientReadyPromise: Promise<unknown>;

  private constructor() {
    this.clientReadyPromise = new Promise(resolve => {
      this.resolveClientReady = resolve;
    });
    this.loadGapi();
  }

  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  private loadGapi() {
    if (window.gapi && window.gapi.client) {
      this.isGapiLoaded = true;
      this.initClient();
      return;
    }

    window.gapi_onload = () => {
      window.gapi.load('client:auth2', async () => {
        this.isGapiLoaded = true;
        await this.initClient();
      });
    };
  }

  private async initClient() {
    if (!this.isGapiLoaded || this.isGapiClientLoaded) return;

    try {
      await window.gapi.client.init({
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });
      this.authInstance = window.gapi.auth2.getAuthInstance();
      this.isGapiClientLoaded = true;
      this.resolveClientReady?.();
      console.log("Christian Culture Global Identity System initialized. Soli Deo Gloria.");
    } catch (error) {
      console.error("Spiritual Fortress Connection Error:", error);
      this.resolveClientReady?.(Promise.reject(error)); 
    }
  }

  public async ensureClientReady(): Promise<void> {
    if (this.isGapiClientReady()) return;
    await this.clientReadyPromise;
    if (!this.isGapiClientReady()) throw new Error("Connection to Google Intelligence failed.");
  }

  public async signIn(): Promise<boolean> {
    await this.ensureClientReady();
    if (!this.isGapiClientReady()) return false;
    try {
      await this.authInstance.signIn({
        prompt: 'select_account',
        ux_mode: 'popup'
      });
      return true;
    } catch (error) {
      console.error("Login attempt failed:", error);
      return false;
    }
  }

  public async signOut(): Promise<boolean> {
    await this.ensureClientReady();
    if (!this.isGapiClientReady()) return false;
    try {
      await this.authInstance.signOut();
      return true;
    } catch (error) {
      return false;
    }
  }

  public isSignedIn(): boolean {
    return this.isGapiClientReady() && this.authInstance.isSignedIn.get();
  }

  public isGapiClientReady(): boolean {
    return this.isGapiLoaded && this.isGapiClientLoaded && !!this.authInstance;
  }

  /**
   * Joshua Helper: Sprawdza zajętość, aby zasugerować czas na "pozytywny bat" uświęcenia.
   */
  public async getJoshuaAvailability(timeStart: string, timeEnd: string) {
    await this.ensureClientReady();
    if (!this.isSignedIn()) return null;
    
    try {
      const response = await window.gapi.client.calendar.freebusy.query({
        timeMin: timeStart,
        timeMax: timeEnd,
        items: [{ id: 'primary' }]
      });
      return response.result.calendars.primary.busy;
    } catch (error) {
      return null;
    }
  }
}

export const googleCalendarService = GoogleCalendarService.getInstance();
