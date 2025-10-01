// app/page.tsx
import { ChatComponent } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <ChatComponent />
      </div>
    </div>
  );
}
