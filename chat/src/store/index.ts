import { qwenSummarizeOldMessages } from '@/lib';
import { AppState, AppActions, Conversation } from '@/models';
import { create } from 'zustand';

const initialState: AppState = {
    conversationHistory: [],
    conversationSummary: '',
    memory: {},
    retrievedDocs: [],
}


const useContextPipelineStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,
  // Add a message
  addMessage: async (conversation: Conversation) => {
    const { conversationHistory, conversationSummary } = get();
    const updatedHistory = [...conversationHistory, conversation];

    if (updatedHistory.length > 6) {
      const oldMessages = updatedHistory.slice(0, -3);
      const recentMessages = updatedHistory.slice(-3);

      // 🔥 Call Qwen to summarize older messages
      const summary = await qwenSummarizeOldMessages(oldMessages);

      set({
        conversationHistory: recentMessages,
        conversationSummary: summary || conversationSummary,
      });
    } else {
      set({ conversationHistory: updatedHistory });
    }
  },

  // Update memory
  updateMemory: (key, value) =>
    set((state) => ({
      memory: { ...state.memory, [key]: value },
    })),

  // Add retrieved document
  addRetrievedDoc: (doc) =>
    set((state) => ({
      retrievedDocs: [...state.retrievedDocs, doc],
    })),

  // Reset pipeline completely
  resetPipeline: () =>
    set({...initialState}),
}));

export default useContextPipelineStore;
