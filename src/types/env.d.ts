declare global {
  namespace NodeJS {
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
      AWS_BUCKET_NAME: string;
      AWS_BUCKET_REGION: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_KEY: string;
      SENTRY_DSN: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_DOMAIN: string;
      AUTH0_CLIENT_SECRET: string;
    }
  }
}

export {}
