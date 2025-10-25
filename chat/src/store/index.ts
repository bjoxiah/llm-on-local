import { qwenSummarizeOldMessages } from '@/lib';
import { AppState, AppActions, Conversation } from '@/models';
import { create } from 'zustand';

const initialState: AppState = {
  conversationHistory: [],
  conversationSummary: '',
  memory: {},
  retrievedDocs: [],
  fileLoader: false,
  fileName: '',
  loader: false
}


const useContextPipelineStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,
  // Add a message
  addMessage: async (conversation: Conversation[]) => {
    const { conversationHistory, conversationSummary } = get();
    const updatedHistory = [...conversationHistory, ...conversation];

    if (updatedHistory.length > 6) {
      const oldMessages = updatedHistory.slice(0, -6);
      const recentMessages = updatedHistory.slice(-6);

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
  
  // Set File Loader
  setFileLoader: (loading) =>
    set((_) => ({
      fileLoader: loading,
    })
  ),

  // Set Loader
  setLoader: (loader) =>
    set((_) => ({
      loader,
    })
  ),
  // Set File Name
  setFileName(name) {
    set((_) => ({
      fileName: name,
    }));
  },
  
  // Reset pipeline completely
  resetPipeline: () =>
    set({...initialState}),
}));

export default useContextPipelineStore;
