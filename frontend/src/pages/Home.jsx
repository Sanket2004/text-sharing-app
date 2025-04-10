import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { toast } from "react-toastify";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const { joinRoom } = useChatStore();

  const handleJoin = () => {
    if (!validateForm()) return;
    joinRoom(roomId, username);
    if (roomId.trim() && username.trim()) {
      navigate(`/room/${roomId}?username=${username}`);
    }
  };

  const validateForm = () => {
    if (!username.trim()) {
      toast("Please enter a username.");
      return false;
    }
    if (!roomId.trim()) {
      toast("Please enter a room ID.");
      return false;
    }

    return roomId.trim() && username.trim();
  };

  return (
    <>
      <section className="flex items-center justify-center min-h-[70vh]">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="max-w-prose text-center flex items-center justify-center flex-col mx-auto">
            <h1 className="text-4xl text-white px-2 bg-gradient-to-r from-green-500 to-blue-500 sm:text-5xl font-bold -skew-y-3">TextRoom</h1>
            <h1 className="mt-4 text-4xl text-gray-900 sm:text-5xl font-serif font-black ">
              Instant{" "}
              <span className="text-transparent bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text relative">
                Text Sharing
                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1 w-44 absolute -bottom-3 -right-2 -skew-y-3" />
              </span>
            </h1>

            <p className="mt-6 text-base text-pretty text-gray-700 sm:text-lg/relaxed">
              Lightweight, real-time text sharing. No accounts. No installs.
              Just rooms, usernames, and pure collaboration.
            </p>

            <button
              className="bg-black text-white px-8 py-3 rounded mt-6 shadow-[8px_8px_0_rgba(0,0,0,0.1)] focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)] hover:shadow-[5px_5px_0_rgba(0,0,0,0.1)] outline-none border-collapse transition-all uppercase tracking-wider text-sm"
              onClick={() => window.scrollTo(0, document.body.scrollHeight)}
            >
              Explore Rooms
            </button>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="mx-auto max-w-screen-xl px-4 pb-28 sm:px-6 sm:pb-24 lg:px-8 lg:pb-32">
        <div className="max-w-md text-center flex items-center justify-center flex-col mx-auto">
          <h1 className="text-2xl font-black mb-4">Join a Room</h1>
          <span className="flex items-center w-full">
            <span className="h-px flex-1 bg-black"></span>

            <span className="shrink-0 px-4 text-gray-900">OR</span>

            <span className="h-px flex-1 bg-black"></span>
          </span>
          <h1 className="text-2xl font-black my-4">Create a Room</h1>

          <div className="flex flex-col w-full text-start gap-4">
            <label htmlFor="username">
              <span className="text-sm font-medium text-gray-700">
                Username
              </span>

              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-0.5 p-3 w-full rounded border border-gray-300 transition-all focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)] outline-none sm:text-sm"
              />
            </label>

            <label htmlFor="roomId">
              <span className="text-sm font-medium text-gray-700">Room ID</span>

              <input
                type="text"
                name="roomId"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="mt-0.5 p-3 w-full rounded border border-gray-300 transition-all focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)] outline-none sm:text-sm"
              />
            </label>
            <button
              onClick={handleJoin}
              className="bg-black text-white px-8 py-3 mt-6 focus:shadow-[5px_5px_0_rgba(0,0,0,0.1)] outline-none border-collapse transition-all rounded uppercase tracking-wider text-sm"
            >
              Join or Create Room
            </button>
          </div>
        </div>
      </section>
      <div className="fixed bottom-0 w-full h-24 z-50 bg-gradient-to-t from-white via-white/70 to-white/0 pointer-events-none" />
    </>
  );
}
