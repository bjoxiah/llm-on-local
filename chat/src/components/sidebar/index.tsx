// components/SidebarComponent.tsx
import { FaPlus, FaCog } from "react-icons/fa";

export const SidebarComponent = () => {
  return (
    <div className="w-64 h-full bg-[#202123] text-gray-200 flex flex-col">
      {/* New Chat */}
      <div className="p-3 border-b border-gray-700">
        <button className="w-full flex items-center gap-3 px-3 py-2 border border-gray-500 rounded-md hover:bg-gray-700">
          <FaPlus size={14} /> New Chat
        </button>
      </div>

      {/* History (mock) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
          Yesterday’s chat
        </div>
        <div className="px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
          Project discussion
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-gray-700">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-700">
          <FaCog size={14} /> Settings
        </button>
      </div>
    </div>
  );
};
