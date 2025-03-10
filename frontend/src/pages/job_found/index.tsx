import Chat from "@/components/Chat/Chat";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import {
  useFetchChatMessages,
  useJobDetails,
  useSendChatMessage,
} from "@/services/apis/core";
import { useAuthStore } from "@/services/stores/useAuthStore";
import { getStatusBadgeClass } from "@/utils/colors";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "ethers";
import React, { useState } from "react";
import { FiMessageSquare, FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";
import TransactionSequence from "../job_details/components/TransactionSequence";
import { toast } from "react-toastify";

const JobFoundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: job,
    isLoading: isLoadingJob,
    error: jobError,
  } = useJobDetails({ variables: { id: Number(id) } });

  const { getWalletAddress } = useAuthStore();
  const walletAddress = getWalletAddress();

  const {
    data: chatMessages,
    refetch: refetchChatMessages,
    isFetching: isFetchingChatMessages,
  } = useFetchChatMessages({
    variables: {
      jobId: Number(id),
      userA: job?.client?.wallet_address || "",
      userB: walletAddress,
    },
  });

  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendChatMessage();

  const handleSendMessage = (message: string) => {
    if (!job?.client?.wallet_address) return;
    sendMessage(
      {
        jobId: Number(id),
        content: message,
        receiver_address: job.client.wallet_address,
      },
      {
        onSuccess: () => {
          refetchChatMessages();
        },
        onError: () => {
          toast.error("Failed to send message.");
        },
      }
    );
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isLoadingJob) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center mt-20">Loading job details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center mt-20">
            Job not found or an error occurred.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavigationBar />
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 min-h-[90vh]">
        {/* Left Panel: Job Info */}
        <div className="w-full md:w-1/2 bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-blue-800 mb-4">{job.title}</h2>
          <b className="text-sm text-gray-600 mb-4">
            Posted by: {job.client?.username || "Unknown"}
          </b>
          <p className="text-sm text-gray-500 mb-4">
            Created{" "}
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </p>
          <img
            src={job.image || "https://placehold.co/150x150"}
            alt={job.title}
            className="w-full rounded-lg object-cover shadow-lg mb-6"
          />
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            {job.description}
          </p>
          {job.info && (
            <div
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: job.info }}
            />
          )}
          <div className="mb-6">
            <h4 className="text-xl font-bold text-blue-700">Amount</h4>
            <p className="text-lg text-gray-600 mt-2">
              {formatEther(job.amount.toString())} BNB
            </p>
          </div>
          <div className="mb-6">
            <h4 className="text-xl font-bold text-blue-700">Job Type</h4>
            <p className="text-lg text-gray-600 mt-2">
              {job.job_type?.name || "Unknown"}
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-blue-700">Status</h4>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                job.status
              )}`}
            >
              {job.status}
            </span>
          </div>
          <div className="my-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3">
              Transaction History
            </h2>
            <TransactionSequence
              transactionAcceptJob={job.transaction_accept_job}
              transactionCompleteJob={job.transaction_complete_job}
              transactionCreate={job.transaction_create}
            />
          </div>
        </div>

        {/* Right Panel: Chat for Desktop */}
        <div className="hidden md:block w-full md:w-1/2 bg-white rounded-xl p-8 shadow-md">
          <Chat
            messages={chatMessages || []}
            currentUserAddress={walletAddress}
            onSendMessage={handleSendMessage}
            isLoadingMessage={isFetchingChatMessages}
            isSendingMessage={isSendingMessage}
          />
        </div>
      </main>

      {/* Mobile Chat Popup Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <FiMessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 mt-16">
          <div className="bg-white w-11/12 max-w-md rounded-lg p-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chat</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-600 font-semibold flex items-center"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <Chat
              messages={chatMessages || []}
              currentUserAddress={walletAddress}
              onSendMessage={handleSendMessage}
              isLoadingMessage={isFetchingChatMessages}
              isSendingMessage={isSendingMessage}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobFoundPage;
