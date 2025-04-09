import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { toast } from "react-toastify";

export default function Room() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const username = params.get("username");

  const navigate = useNavigate();

  const { joinRoom, leaveRoom, sendMessage, messages, users } = useChatStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    joinRoom(roomId, username);
    return () => leaveRoom();
  }, [roomId, username]);

  //check if roomId and username are not null
  if (!roomId || !username) {
    navigate("/");
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.length === 0) {
      toast.error("Please enter a message.");
      return;
    }
    sendMessage(input);
    setInput("");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-start p-6">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-14">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 font-serif">
              Room{" "}
              <span className="text-transparent bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text">
                #{roomId}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              You are logged in as <strong>{username}</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 mt-6">
            <div className="bg-white border rounded-lg shadow-sm p-4 h-[500px] overflow-y-auto col-span-2">
              {messages.map((msg, index) => {
                const isOwnMessage = msg.username === username;

                return (
                  <div
                    key={index}
                    className={`mb-4 flex items-start gap-4 max-w-full ${
                      isOwnMessage ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white text-sm">
                      {msg.username?.[0].toUpperCase()}
                    </div>

                    {/* Message Content */}
                    <div className="w-max max-w-[80%] group relative">
                      <pre
                        className={`px-4 py-2 rounded-bl-md whitespace-pre-wrap break-words overflow-auto font-sans w-full ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-s-md text-black rounded-br-md"
                            : "bg-[rgba(0,0,0,0.02)] rounded-e-md"
                        }`}
                      >
                        {msg.message}
                      </pre>

                      {/* Copy Button on Hover */}
                      <button
                        onClick={() => {
                          handleCopy(msg.message);
                          toast.success("Message copied to clipboard.");
                        }}
                        className="absolute top-2 right-2 text-xs bg-white/70 backdrop-blur-sm border border-gray-300 rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        Copy
                      </button>

                      {/* Message Metadata */}
                      <div
                        className={`text-xs mt-1 text-gray-500 ${
                          isOwnMessage ? "text-right" : ""
                        }`}
                      >
                        @{msg.username} |{" "}
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-4 flex-col w-full">
              <textarea
                value={input}
                rows={8}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 p-3 w-full rounded border border-gray-300 focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)] transition-all  outline-none sm:text-sm resize-none"
              />
              <button
                onClick={handleSend}
                className="w-full bg-black text-white px-8 py-3 rounded outline-none border-collapse transition-all uppercase tracking-wider focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)] text-sm"
              >
                Send
              </button>
            </div>
          </div>
          <div className="pt-4 text-sm text-gray-600">
            <strong>Users in this room:</strong>{" "}
            {users.length > 0 ? users.join(", ") : "No one yet"}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-wrap">
            <button
              onClick={() => {
                handleCopy(roomId);
                toast.success("Room ID copied to clipboard.");
              }}
              className="w-full bg-black text-white px-8 py-3 rounded outline-none border-collapse transition-all uppercase tracking-wider text-sm focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)]"
            >
              Copy Room ID
            </button>
            <button
              onClick={() => {
                leaveRoom(roomId);
                navigate("/");
              }}
              className="w-full bg-red-600 text-white px-8 py-3 rounded outline-none border-collapse transition-all uppercase tracking-wider text-sm focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)]"
            >
              Leave Room
            </button>
          </div>
        </div>
      </section>
      <div className="fixed bottom-0 w-full h-24 z-50 bg-gradient-to-t from-white via-white/70 to-white/0 pointer-events-none" />
    </>
  );
}
