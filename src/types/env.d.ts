declare namespace NodeJS {
  interface ProcessEnv {
    SESSION_REDIS_SECRET_KEY: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    SENDGRID_API_KEY: string;
    APP_URL: string;
    GOOGLE_MAPS_API_KEY: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    CORS_ORIGIN: string;
  }
}
