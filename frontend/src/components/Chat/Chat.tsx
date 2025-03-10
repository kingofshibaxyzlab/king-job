import { useUploadFile } from "@/services/apis/auth";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { FiLoader, FiPaperclip, FiSend, FiSmile } from "react-icons/fi";
import { toast } from "react-toastify";

interface ChatMessage {
  id?: number;
  sender_address: string;
  sender_name?: string;
  content: string;
  created_at?: string;
}

interface ChatProps {
  messages: ChatMessage[];
  currentUserAddress: string;
  onSendMessage: (message: string) => void;
  isSendingMessage?: boolean;
  isLoadingMessage?: boolean;
  className?: string;
}

/** Example list of stickers. */
const ICONS = [
  { id: "LOVE", label: "❤️" },
  { id: "THUMBS_UP", label: "👍" },
  { id: "LAUGH", label: "😆" },
  { id: "WOW", label: "😮" },
  { id: "SAD", label: "😢" },
  { id: "ANGRY", label: "😡" },
  { id: "LIKE", label: "👍" },
  { id: "DISLIKE", label: "👎" },
  { id: "FIRE", label: "🔥" },
  { id: "COOL", label: "😎" },
  { id: "PARTY", label: "🎉" },
  { id: "PRAY", label: "🙏" },
  { id: "CRY", label: "😭" },
  { id: "SMILE", label: "😊" },
  { id: "CLAP", label: "👏" },
  { id: "OK_HAND", label: "👌" },
  { id: "ROFL", label: "🤣" },
  { id: "SLEEPY", label: "😴" },
  { id: "SCARED", label: "😱" },
  { id: "CONFUSED", label: "🤔" },
  { id: "KISS", label: "😘" },
  { id: "MUSCLE", label: "💪" },
  { id: "HEART_EYES", label: "😍" },
  { id: "ROCKET", label: "🚀" },
  { id: "CHECK", label: "✔️" },
  { id: "X", label: "❌" },
  { id: "COFFEE", label: "☕" },
  { id: "100", label: "💯" },
  { id: "STAR", label: "⭐" },
  { id: "THINKING", label: "🤯" },
  { id: "DEVIL", label: "😈" },
  { id: "ANGEL", label: "😇" },
  { id: "SUNGLASSES", label: "🕶️" },
  { id: "BOOM", label: "💥" },
  { id: "SKULL", label: "💀" },
  { id: "DIZZY", label: "😵" },
  { id: "MONEY", label: "🤑" },
  { id: "NERD", label: "🤓" },
  { id: "ZANY", label: "🤪" },
  { id: "FACEPALM", label: "🤦" },
  { id: "SALUTE", label: "🫡" },
  { id: "SPARKLE", label: "✨" },
  { id: "ROBOT", label: "🤖" },
  { id: "RAINBOW", label: "🌈" },
  { id: "WAVING_HAND", label: "👋" },
  { id: "TADA", label: "🎊" },
  { id: "SMIRK", label: "😏" },
  { id: "FROG", label: "🐸" },
  { id: "SHOCKED", label: "😳" },
  { id: "CAT", label: "🐱" },
  { id: "DOG", label: "🐶" },
  { id: "ALIEN", label: "👽" },
  { id: "GHOST", label: "👻" },
  { id: "TURTLE", label: "🐢" },
];

const Chat: React.FC<ChatProps> = ({
  messages,
  currentUserAddress,
  onSendMessage,
  isSendingMessage = false,
  isLoadingMessage = false,
  className = "",
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Track if initial messages have been loaded
  const [hasLoaded, setHasLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // S3 upload hook
  const { mutate: uploadFile } = useUploadFile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setHasLoaded(true);
    }
    scrollToBottom();
  }, [messages]);

  // Generic send function
  const handleSend = (message: string) => {
    if (!message.trim()) return;
    onSendMessage(message);
    setNewMessage("");
    setShowStickers(false);
  };

  const handleIconClick = (iconId: string) => {
    handleSend(`ICON_${iconId}`);
  };

  // File Upload Handling
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadFile(uploadData, {
      onSuccess: (data) => {
        setIsUploading(false);
        const fileUrl = data.file_url;
        const messageContent = `FILE|${fileUrl}|${file.name}`;
        handleSend(messageContent);
      },
      onError: (error: any) => {
        setIsUploading(false);
        toast.error(`Error uploading file: ${error.message}`);
      },
    });
  };

  // Helper: Check if a file is an image (by extension)
  const isImageFile = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    return (
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".gif") ||
      lowerName.endsWith(".webp") ||
      lowerName.endsWith(".bmp")
    );
  };

  // Render message content:
  // - If it starts with "ICON_", display corresponding sticker.
  // - If it starts with "FILE|", check extension: render an image if image; else, a link.
  const renderMessageContent = (content: string) => {
    if (content.startsWith("ICON_")) {
      const iconId = content.replace("ICON_", "");
      const foundIcon = ICONS.find((icon) => icon.id === iconId);
      return foundIcon ? foundIcon.label : content;
    } else if (content.startsWith("FILE|")) {
      const parts = content.split("|");
      if (parts.length >= 3) {
        const fileUrl = parts[1];
        const fileName = parts.slice(2).join("|");
        if (isImageFile(fileName)) {
          return (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full rounded-lg"
            />
          );
        } else {
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline"
            >
              {fileName}
            </a>
          );
        }
      }
      return content;
    }
    return content;
  };

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow ${className}`}>
      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h4 className="text-base sm:text-lg font-semibold text-gray-800">
          Messages
        </h4>
        <p className="text-xs sm:text-sm text-gray-500">
          {messages.length} message{messages.length !== 1 && "s"}
        </p>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-4 max-h-[50vh] min-h-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #f0f4f8 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
      >
        {!hasLoaded && isLoadingMessage ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <FiLoader className="w-5 h-5 animate-spin mr-2" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isCurrentUser = msg.sender_address === currentUserAddress;
            return (
              <div
                key={msg.id || idx}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] p-3 shadow-sm ${
                    isCurrentUser
                      ? "bg-blue-500 text-white rounded-l-lg rounded-br-lg"
                      : "bg-gray-100 text-gray-800 rounded-r-lg rounded-bl-lg"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs sm:text-sm">
                      {isCurrentUser ? "You" : msg.sender_name || "Unknown"}
                    </span>
                    {msg.created_at && (
                      <span
                        className={`text-[0.625rem] sm:text-xs ${
                          isCurrentUser ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="break-words text-xs sm:text-sm">
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        {/* Row: Sticker, Attach, then Text Input with Like & Send Buttons */}
        <div className="flex items-center gap-2 mb-2">
          {/* Left Controls: Sticker & Attach */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStickers((prev) => !prev)}
              disabled={isSendingMessage}
              className={`px-2 py-1 rounded-md border text-sm flex items-center justify-center ${
                isSendingMessage
                  ? "bg-gray-200 cursor-not-allowed text-gray-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              title="Stickers"
            >
              <FiSmile className="w-5 h-5" />
            </button>
            <button
              onClick={handleAttachClick}
              disabled={isSendingMessage || isUploading}
              className={`px-2 py-1 rounded-md border text-sm flex items-center justify-center ${
                isSendingMessage || isUploading
                  ? "bg-gray-200 cursor-not-allowed text-gray-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              title="Attach File"
            >
              {isUploading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <FiPaperclip className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Text Input with Like & Send Buttons */}
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-24 text-xs sm:text-sm"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(newMessage);
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={() => handleSend("ICON_THUMBS_UP")}
                disabled={isSendingMessage}
                className={`px-2 py-1 rounded-full border text-sm flex items-center justify-center ${
                  isSendingMessage
                    ? "bg-gray-200 cursor-not-allowed text-gray-400"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Send Like"
              >
                <span role="img" aria-label="Like">
                  👍
                </span>
              </button>
              {/* Send Button */}
              <button
                onClick={() => handleSend(newMessage)}
                disabled={!newMessage.trim() || isSendingMessage}
                className={`px-2 py-1 rounded-md border text-sm flex items-center justify-center ${
                  newMessage.trim() && !isSendingMessage
                    ? "text-blue-500 hover:bg-blue-50"
                    : "text-gray-400"
                }`}
                title="Send Message"
              >
                {isSendingMessage ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="text-[0.625rem] sm:text-xs text-gray-500">
          Press Enter to send, Shift + Enter for new line
        </p>

        {/* Sticker Panel */}
        {showStickers && (
          <div className="relative">
            <div className="absolute w-80 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-wrap gap-2 z-10">
              {ICONS.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleIconClick(icon.id)}
                  className="w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-100 rounded"
                  title={icon.id}
                >
                  {icon.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
