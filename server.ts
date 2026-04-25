import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'nexus-cloud-persistent-secret-v2',
  resave: true,
  saveUninitialized: true,
  name: 'nexus.sid',
  proxy: true,
  cookie: {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Dynamic Redirect URI helper
const getRedirectUri = (req: express.Request) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = process.env.APP_URL || `${protocol}://${req.get('host')}`;
  return `${host.replace(/\/$/, '')}/auth/callback`;
};

// Auth Routes
app.get('/api/auth/url', (req, res) => {
  const redirectUri = getRedirectUri(req);
  console.log('Generating auth URL with Redirect URI:', redirectUri);
  
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.metadata.readonly'
    ],
    prompt: 'consent'
  });
  res.json({ url });
});

app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, error: queryError } = req.query;
  const redirectUri = getRedirectUri(req);
  
  console.log('Callback received. Redirect URI:', redirectUri);

  if (queryError) {
    console.error('OAuth Query Error:', queryError);
    return res.status(400).send(`Authentication failed: ${queryError}. Please try again.`);
  }

  if (!code) {
    console.error('No code received at callback');
    return res.status(400).send('No authentication code received. Please try again.');
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  console.log('Received auth code at callback, exchanging for tokens...');
  try {
    const { tokens } = await client.getToken(code as string);
    console.log('Successfully exchanged code for tokens');
    (req.session as any).tokens = tokens;
    
    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error('Session save error in callback:', err);
        return res.status(500).send('Error interno: No se pudo guardar la sesión.');
      }
      console.log('Session saved successfully, SessionID:', req.sessionID);
      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              console.log('Authentication successful, signaling parent window');
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                setTimeout(() => {
                  window.close();
                }, 1500);
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
              <h2 style="color: #10b981;">¡Conectado!</h2>
              <p>Cerrando esta ventana...</p>
            </div>
          </body>
        </html>
      `);
    });
  } catch (error: any) {
    console.error('FULL OAUTH ERROR:', error);
    const errorMsg = error.response?.data?.error_description || error.message || 'Unknown error';
    console.error('Detailed error message:', errorMsg);
    res.status(500).send(`
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #ef4444;">Error de Autenticación</h2>
        <p>Google ha devuelto este error: <b>${errorMsg}</b></p>
        <hr/>
        <p>Cosas a revisar:</p>
        <ul>
          <li>Que las credenciales (ID y Secreto) en los Secretos sean correctas.</li>
          <li>Que la URL de redirección en Google Cloud sea exactamente: <br/><code>${redirectUri}</code></li>
        </ul>
        <button onclick="window.close()">Cerrar Ventana</button>
      </div>
    `);
  }
});

app.get('/api/auth/status', async (req, res) => {
  const sessionAny = req.session as any;
  const tokens = sessionAny.tokens;
  
  console.log('Session ID:', req.sessionID);
  console.log('Tokens present in session:', !!tokens);

  if (!tokens) {
    return res.json({ authenticated: false });
  }
  
  try {
    const redirectUri = getRedirectUri(req);
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userInfo = await oauth2.userinfo.get();
    console.log('User info fetched successfully for:', userInfo.data.email);
    res.json({ authenticated: true, user: userInfo.data });
  } catch (error: any) {
    console.error('Failed to get user info from tokens:', error.message);
    // If tokens are invalid, clear them
    delete sessionAny.tokens;
    res.json({ authenticated: false });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Proxy for Drive API
app.all('/api/drive/*', async (req, res) => {
  const tokens = (req.session as any).tokens;
  if (!tokens) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const redirectUri = getRedirectUri(req);
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    client.setCredentials(tokens);
    
    // Refresh token if expired
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      const { credentials } = await client.refreshAccessToken();
      (req.session as any).tokens = credentials;
      client.setCredentials(credentials);
    }

    const drive = google.drive({ version: 'v3', auth: client });
    const drivePath = req.params[0];
    
    // This is a simple proxy, for more complex operations like upload 
    // we'd need to handle files properly.
    // For now, let's just implement some basic methods.
    
    if (drivePath === 'files' && req.method === 'GET') {
      const response = await drive.files.list({
        pageSize: 50,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size, iconLink, thumbnailLink)',
        q: req.query.q as string || "trashed = false",
        orderBy: req.query.orderBy as string || 'folder,name'
      });
      return res.json(response.data);
    }

    // Handle specific file info
    if (drivePath.startsWith('files/') && req.method === 'GET') {
      const fileId = drivePath.split('/')[1];
      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, modifiedTime, size, iconLink, thumbnailLink, parents'
      });
      return res.json(response.data);
    }

    res.status(404).json({ error: 'Not implemented in proxy' });
  } catch (error: any) {
    console.error('Drive API proxy error:', error);
    res.status(error.code || 500).json({ error: error.message });
  }
});

app.post('/api/drive/upload', upload.single('file'), async (req, res) => {
  const tokens = (req.session as any).tokens;
  if (!tokens || !req.file) {
    return res.status(401).json({ error: 'Unauthorized or no file' });
  }

  try {
    const redirectUri = getRedirectUri(req);
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: client });

    const fileMetadata = {
      name: req.file.originalname,
    };
    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name',
    });

    res.json(file.data);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start logic
async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Avoid intercepting API or Auth
      if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) return;
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
export { app };
