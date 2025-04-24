import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  LogOut,
  SendIcon,
  UsersIcon,
  X,
} from "lucide-react";

export default function Room() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const username = params.get("username");
  const navigate = useNavigate();

  const {
    joinRoom,
    leaveRoom,
    sendMessage,
    messages,
    users,
    usernameTaken,
    checkUsername,
    loading,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef(null);
  const endRef = useRef(null);

  // Join room logic
  useEffect(() => {
    const joinLogic = async () => {
      if (!roomId || !username) {
        navigate("/");
        return;
      }

      const isTaken = await checkUsername(roomId, username);
      if (isTaken) {
        toast.error("Username already taken. Please choose another username.");
        navigate("/");
        return;
      }

      joinRoom(roomId, username);
    };

    joinLogic();
    return leaveRoom;
  }, [roomId, username]);

  // Username taken redirect
  useEffect(() => {
    if (usernameTaken) navigate("/");
  }, [usernameTaken]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

      setIsAtBottom(isBottom);
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const bottomOffset = 100; // space to avoid overlapping with input
      container.scrollTo({
        top: end.offsetTop - bottomOffset,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim()) {
      return;
    }
    sendMessage(input.trim());
    setInput("");
  }, [input]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Text Copied to clipboard");
  };

  const scrollToTop = () =>
    containerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
      block: "nearest",
    });

  const scrollToBottom = () => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      container.scrollTo({
        top: end.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const renderUsersList = () =>
    users.map((user, i) => (
      <li key={i} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center font-bold">
          {user[0]?.toUpperCase()}
        </div>
        <span className="font-medium">@{user}</span>
      </li>
    ));

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
      {/* Header */}
      <header className="p-4 border-b bg-white flex justify-between items-center sticky top-0 z-10">
        <div className="text-gray-700 font-bold">
          Room: <span className="font-medium">#{roomId}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowUsers(true)}
            className="md:hidden text-gray-600 hover:text-gray-700"
          >
            <UsersIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              leaveRoom();
              navigate("/");
            }}
            className="text-red-500 text-xs font-medium flex items-center gap-1 hover:underline"
          >
            <LogOut className="w-4 h-4" /> Leave
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <main
          ref={containerRef}
          className="flex-1 p-4 overflow-y-auto relative "
        >
          <div className="max-w-screen-lg mx-auto">
            <div className="min-h-[70vh] space-y-4 flex flex-col items-center justify-center">
              {loading ? (
                <div className="text-center text-gray-500">
                  Loading messages...
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className="group border bg-white rounded-md px-4 py-3 shadow-sm text-sm relative w-full"
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
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <footer className="bg-white sticky bottom-6 z-10 border-2 rounded-xl overflow-hidden w-full max-w-screen-lg mx-auto flex shadow-2xl">
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto"; // Reset height
                    el.style.height =
                      Math.min(el.scrollHeight, window.innerHeight * 0.5) +
                      "px"; // Max height: 50vh
                  }
                }}
                rows={5}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height =
                    Math.min(el.scrollHeight, window.innerHeight * 0.5) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type something..."
                className="flex-1 px-4 py-3 text-sm resize-none focus:outline-none max-h-[50vh] overflow-auto outline-none border-collapse"
              />
              <button
                onClick={handleSend}
                className="bg-gray-700 text-white p-3 mx-4 my-3 ml-0 rounded-xl h-10 w-10 hover:bg-gray-800 transition"
              >
                <SendIcon size={15} />
              </button>
            </footer>

            {/* Scroll Controls */}
            {!isAtBottom ? (
              <div className="sticky w-max bottom-40 float-end flex flex-col gap-2 z-50">
                <button
                  onClick={scrollToBottom}
                  className="bg-gray-700 text-white p-2.5 rounded-xl shadow hover:bg-gray-900 transition"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="sticky w-max bottom-40 float-end flex flex-col gap-2 z-50">
                <button
                  onClick={scrollToTop}
                  className="bg-gray-700 text-white p-2.5 rounded-xl shadow hover:bg-gray-900 transition"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-l bg-white p-4 text-sm">
          <h2 className="font-bold mb-4 text-gray-800">Active Users</h2>
          <ul className="space-y-2 text-gray-600 overflow-auto h-full">
            {renderUsersList()}
          </ul>
        </aside>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all ${
          showUsers ? "" : "translate-x-full"
        }`}
      >
        <div className="absolute right-0 top-0 w-full max-w-80 bg-white h-full p-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-sm">Active Users</h2>
            <button
              onClick={() => setShowUsers(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <hr className="my-4"/>
          <ul className="space-y-2 text-gray-600 text-sm overflow-auto h-full">
            {renderUsersList()}
          </ul>
        </div>
      </div>
    </div>
  );
}
