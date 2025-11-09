export default () => ({
  secrets: {
    jwt: process.env.JWT_SECRET,
  },
  app:{
    appLogoUrl: process.env.APP_LOGO_URL || 'https://glauk-app.vercel.app/logo.png',
    appName: process.env.APP_NAME || 'Glauk',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    appBaseUrl: process.env.APP_BASE_URL || 'https://glauk-app.vercel.app',
    appClientBaseUrl: process.env.APP_CLIENT_BASE_URL || 'https://glauk-app.vercel.app',
  },
  db:{
    prismaDbUrl: process.env.DATABASE_URL,
  },
  mailer:{
    mailerUser: process.env.MAILER_USER,
    mailerPass: process.env.MAILER_PASS,
    mailerDefaultFrom: process.env.MAILER_DEFAULT_FROM,
  }
});
