import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTranslating: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  translateMessage: async (text, targetLanguage) => {
    set({ isTranslating: true });
    try {
      console.log('Sending translation request:', { text, targetLanguage }); // Debug log
      
      const res = await axiosInstance.post('/api/translate', {
        text,
        targetLanguage
      });
      
      console.log('Translation response:', res.data); // Debug log
      
      // Update the message with the translation
      const { messages } = get();
      const updatedMessages = messages.map(msg => {
        if (msg.text === text) {
          return {
            ...msg,
            translatedText: res.data.translatedText
          };
        }
        return msg;
      });
      
      set({ messages: updatedMessages });
      return res.data.translatedText;
    } catch (error) {
      console.error('Translation error:', error.response?.data || error); // Better error logging
      toast.error(error.response?.data?.error || 'Translation failed');
      return null;
    } finally {
      set({ isTranslating: false });
    }
  },
}));
