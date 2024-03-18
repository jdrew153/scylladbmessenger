"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowUp,
  Check,
  GhostIcon,
  Loader2,
  Plus,
  Trash2,
  XIcon,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { cn, prodURLBase } from "@/utils/lib";
import { getCookie, setCookie } from "cookies-next";
import Image from "next/image";

interface Message {
  id: string;
  username: string;
  body: string;
  time: number;
  write_time: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const user = getCookie("username");

  const messages = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await axios.get(prodURLBase + "/all");

      let unsortedMessages = res.data as Message[];

      return unsortedMessages.sort((a, b) => a.time - b.time);
    },
    refetchInterval: 500,
  });

  const mutate = useMutation({
    mutationKey: ["postMessage"],
    mutationFn: async () => {
      if (!user) {
        setShowModal(true);
        return;
      }
      console.log("this is the message", message);
      if (message.length === 0) return;
      let body: Message = {
        id: Math.random().toString(36).substr(2, 9),
        username: user,
        body: message,
        time: Date.now(),
        write_time: ""
      };
      const res = await axios.post(
        prodURLBase + "/create-message",
        body
      );

      return res.data;
    },
    onSuccess: () => {
      setMessage("");
    },
  });

  const deleteMessage = useMutation({
    mutationKey: ["deleteMessage"],
    mutationFn: async (id: string) => {
      if (!user) {
        return;
      }

      const res = await axios.delete(
        prodURLBase + `/delete-message/${id}/${user}`
      );

      return res.data;
    },
    onSuccess: () => {
      messages.refetch();
    },
  });

  function createUser() {
    if (username.length > 0) {
      setCookie("username", username);
      setShowModal(false);
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-zinc-900">
      <div className="w-full h-20 flex justify-between items-center bg-zinc-950 p-4">
        <div className="flex flex-row space-x-2 items-center">
          <Image src="/scylla.png" alt="scylla" width={50} height={50} />
          <h2>Scylla DB Chat App</h2>
        </div>
        {!user ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center rounded-full bg-indigo-500 p-1 hover:bg-indigo-500/50 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-x-2">
            <h1>Welcome, {user}</h1>
            <button>
              <XIcon
                className="w-5 h-5   transition-colors"
                onClick={() => {
                  setCookie("username", "");
                  location.reload();
                }}
              />
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black opacity-50 z-40 transition-transform"
            onClick={() => setShowModal(false)} // Close the modal when clicking on the overlay
          />
          <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center z-50">
            <div className="p-6 min-h-40 max-w-2xl bg-zinc-800 rounded-md flex flex-col justify-center items-start space-y-3">
              <div className="w-full flex justify-between items-center gap-x-4">
                <h1 className="text-lg">
                  Enter your username to join the chat
                </h1>
                <Image src="/scylla.png" alt="scylla" width={50} height={50} />
              </div>
              <input
                className="h-14 border-solid border-black rounded-md pl-2 text-black"
                type="text"
                value={username}
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
              />
              <div className="w-full flex justify-end">
                <button
                  disabled={username.length === 0}
                  onClick={createUser}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500"
                >
                  <Check className="w-8 h-8" />
                </button>
              </div>
              <div className="absolute w-10 h-10 bg-black hover:bg-zinc-900 hover:text-indigo-500 hover:cursor-pointer top-3 left-3 flex items-center justify-center rounded-full">
                <XIcon
                  className="w-5 h-5   transition-colors"
                  onClick={() => {
                    setShowModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
      <div className="w-full h-full flex-1">
        {messages.isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-16 h-16 animate-spin" />
          </div>
        ) : (
          <div className="w-full flex-col-reverse h-full pt-4">
            {messages.data?.length && messages.data.length > 0 ? (
              <>
                {messages.data?.map((message, indx) => (
                  <div
                   key={message.id}
                    className={cn(
                      "min-h-12 p-2 pl-4 flex flex-col space-y-2 justify-start w-full",
                      indx % 2 === 0 ? "bg-slate-700" : "bg-slate-700/50"
                    )}
                  >
                    <div className="flex flex-row justify-between max-w-full">
                     <div className="flex items-center gap-x-4">
                     {message.username}
                    <div className="flex items-center gap-x-2">
                      {Number(message.write_time) > 200 ? (
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    <p className="text-sm italic">
                      {message.write_time} ms
                     </p>
                    </div>
                     </div>
                      {message.username === user && (
                        <button
                          onClick={() => deleteMessage.mutate(message.id)}
                        >
                          {deleteMessage.isPending ? <Loader2 /> : <Trash2 />}
                        </button>
                      )}
                    </div>
                    <div className="h-[1px] w-[25%] bg-zinc-300 opacity-35" />
                    <p className="whitespace-pre max-w-md">{message.body}</p>
                    <div className="w-full items-end">
                      <p className="text-xs text-right text-zinc-300">
                        {new Date(message.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center pt-20 gap-y-4">
                <GhostIcon className="w-16 h-16" />
                <h1>Send a message to get the conversation started</h1>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-full flex flex-row justify-center items-center space-x-4 bg-zinc-950 p-10 ">
        <input
          className="min-h-16 w-full rounded-md border-solid border-black pl-2 text-black"
          placeholder="Type a message"
          value={message}
          onChange={(e) => {
            if (!user) {
              setShowModal(true);
              return;
            }
            setMessage(e.target.value);
            console.log("this is the message", message);
          }}
        />
        <button
          // disabled={message.length === 0 || !user}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500",
            message.length === 0 || !user
              ? "bg-indigo-500/50"
              : "hover:bg-indigo-500/50"
          )}
          onClick={() => {
            if (user && message.length > 0) {
              mutate.mutate();
            } else {
              console.log(user, message);
            }
            onkeyup = (e) => {
              if (e.key === "Enter") {
                if (user && message.length > 0) {
                  mutate.mutate();
                } else {
                  console.log(user, message);
                }
              }
            };
          }}
        >
          <ArrowUp className="hover:w-8 hover:h-8 transition-all hover:font-extrabold" />
        </button>
      </div>
    </main>
  );
}
