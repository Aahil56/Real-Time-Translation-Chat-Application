import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '@google-cloud/translate';
const { Translate } = pkg.v2;

const router = express.Router();

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Translate with your credentials
const translate = new Translate({
  projectId: 'elegant-tangent-449817-a8',
  keyFilename: path.join(__dirname, '..', 'google-translate-credentials.json'),
});

router.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    console.log('Translating:', { text, targetLanguage }); // Debug log

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and targetLanguage are required' });
    }

    const [translation] = await translate.translate(text, {
      from: 'en',
      to: targetLanguage
    });
    
    console.log('Translation result:', translation); // Debug log
    res.json({ translatedText: translation });
  } catch (error) {
    console.error('Translation error details:', error); // Detailed error log
    res.status(500).json({ 
      error: 'Translation failed',
      details: error.message 
    });
  }
});

export default router;