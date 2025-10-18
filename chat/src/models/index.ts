export type Conversation = {
    role: string;
    content: string;
}

export type AppState = {
    conversationHistory: Conversation[]; // all messages (recent + last 5)
    conversationSummary: string;      // summarized older messages
    memory: Record<string, string>;     // persistent facts about user
    retrievedDocs: string[];         // retrieved documents or knowledge
}

export type AppActions = {
    addMessage: (conversation: Conversation[]) => void;
    updateMemory: (key: string, value: string) => void;
    addRetrievedDoc: (doc: string) => void;
    resetPipeline: () => void;
}