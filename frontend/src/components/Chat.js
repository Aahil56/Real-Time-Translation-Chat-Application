import React, { useState } from 'react';
import axios from 'axios';
import LanguageSelector from './LanguageSelector';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [senderLanguage, setSenderLanguage] = useState('en'); // Default sender language
  const [receiverLanguage, setReceiverLanguage] = useState('bn'); // Default receiver language (example)
  // Add translated message state
  const [translatedMessage, setTranslatedMessage] = useState('');

  // Add translation function
  const translateMessage = async (text, targetLanguage) => {
    try {
      const response = await axios.post('/api/translate', {
        text,
        targetLanguage,
      });
      return response.data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  };

  const handleSendMessage = async () => {
    try {
      // Translate message before sending
      const translated = await translateMessage(message, receiverLanguage);
      setTranslatedMessage(translated);

      const response = await axios.post(`/api/messages/send/${receiverId}`, {
        text: message,
        translatedText: translated,
        originalLanguage: senderLanguage,
        receiverLanguage: receiverLanguage,
      });
      console.log('Message sent:', response.data);
      setMessage(''); // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <LanguageSelector
        label="Select Your Language:"
        selectedLanguage={senderLanguage}
        onLanguageChange={setSenderLanguage}
      />
      <LanguageSelector
        label="Select Receiver's Language:"
        selectedLanguage={receiverLanguage}
        onLanguageChange={setReceiverLanguage}
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      {translatedMessage && (
        <div className="translation-preview">
          Translation: {translatedMessage}
        </div>
      )}
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat; 