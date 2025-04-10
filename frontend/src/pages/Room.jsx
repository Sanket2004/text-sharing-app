import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  LogOut,
  SendIcon,
  Users,
  Users2,
  UsersIcon,
  X,
} from "lucide-react";

export default function Room() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const username = params.get("username");
  const navigate = useNavigate();

  const { joinRoom, leaveRoom, sendMessage, messages, users } = useChatStore();

  const [input, setInput] = useState("");
  const containerRef = useRef(null);
  const endRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    if (!roomId || !username) {
      navigate("/");
      return;
    }
    joinRoom(roomId, username);
    return () => leaveRoom();
  }, [roomId, username]);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScroll(scrollTop + clientHeight < scrollHeight - 100);
    };

    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) {
      toast("Message can't be empty.");
      return;
    }
    sendMessage(input.trim());
    setInput("");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  };

  const scrollToTop = () =>
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
      {/* Header */}
      <header className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="text-gray-700 font-bold">
          Room: <span className="font-medium">#{roomId}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Show users toggle on mobile */}
          <button
            onClick={() => setShowUsers(true)}
            className="md:hidden text-gray-600 hover:text-black"
          >
            <UsersIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              leaveRoom();
              navigate("/");
            }}
            className="text-red-500 flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <LogOut className="w-4 h-4" /> Leave
          </button>
        </div>
      </header>

      {/* Main Content Section */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <main
          ref={containerRef}
          className="flex-1 md:pt-10 p-4 overflow-y-auto relative"
        >
          <div className="max-w-screen-lg mx-auto relative">
            <div className="min-h-[70vh] space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="group border rounded-md bg-white px-4 py-3 shadow-sm text-sm relative"
                >
                  <div className="text-gray-900 whitespace-pre-wrap break-words">
                    {msg.message}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    @{msg.username} •{" "}
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() => handleCopy(msg.message)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Message Input */}
            <footer className="bg-white flex items-start sticky bottom-0 z-10 border-2 rounded-xl overflow-hidden w-full max-w-screen-lg mx-auto">
              <textarea
                rows={5}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type something..."
                className="flex-1 px-4 py-3 h-full w-full text-sm focus:outline-none resize-none"
              />
              <button
                onClick={handleSend}
                className="bg-black text-white p-3 m-2 rounded-full text-sm hover:bg-gray-900 transition"
              >
                <SendIcon size={15} />
              </button>
            </footer>

            {/* Scroll Controls */}
            {showScroll && (
              <div className="sticky w-max bottom-40 float-end flex flex-col gap-2 z-50">
                <button
                  onClick={scrollToTop}
                  className="bg-black text-white p-2 rounded-full shadow hover:bg-gray-900 transition"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollToBottom}
                  className="bg-black text-white p-2 rounded-full shadow hover:bg-gray-900 transition"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar (desktop only) */}
        <aside className="hidden md:block w-64 border-l bg-white p-4 pt-10 text-sm">
          <h2 className="font-bold mb-4 text-gray-800">Active Users</h2>
          <ul className="space-y-2 text-gray-600 overflow-auto h-full pb-4 pt-2">
            {users.map((user, i) => (
              <li key={i} className="flex items-center gap-2 border-b-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.toUpperCase()[0]}
                </div>
                <span className="font-medium">@{user}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          showUsers ? "" : "translate-x-full"
        } transition-all`}
      >
        <div className="absolute right-0 top-0 w-full max-w-80 bg-white h-full p-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800 text-sm">Active Users</h2>
            <button
              onClick={() => setShowUsers(false)}
              className="text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ul className="space-y-2 text-gray-600 text-sm overflow-auto h-full pb-4 pt-2">
            {users.map((user, i) => (
              <li key={i} className="flex items-center gap-2 border-b-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.toUpperCase()[0]}
                </div>
                <span className="font-medium">@{user}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
