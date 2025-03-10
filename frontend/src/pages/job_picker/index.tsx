import { UrlMapping } from "@/commons/url-mapping.common";
import Chat from "@/components/Chat/Chat";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useAcceptJob } from "@/hooks/useAcceptJob";
import { useCompleteJob } from "@/hooks/useCompleteJob";
import {
  IUserInfoProfileSchema,
  JobStatus,
  useFetchChatMessages,
  useJobDetails,
  useJobPickers,
  useSendChatMessage,
} from "@/services/apis/core";
import { useAuthStore } from "@/services/stores/useAuthStore";
import { shortenTransactionHash } from "@/utils/transaction_string";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";

const JobPickersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);

  // State for selected picker and mobile chat modal
  const [selectedPicker, setSelectedPicker] =
    useState<IUserInfoProfileSchema | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Hooks for job actions
  const { accept, isLoading: isLoadingAcceptJob } = useAcceptJob();
  const { complete, isLoading: isLoadingCompleteJob } = useCompleteJob();

  // Fetch job details and pickers
  const {
    data: job,
    isLoading: isJobLoading,
    error: jobError,
  } = useJobDetails({ variables: { id: jobId } });
  const { data: pickers, isLoading: arePickersLoading } = useJobPickers({
    variables: { jobId },
  });

  // Auth and Chat hooks
  const { getWalletAddress } = useAuthStore();
  const walletAddress = getWalletAddress();
  const { data: chatMessages, refetch: refetchChatMessages } =
    useFetchChatMessages({
      variables: {
        jobId,
        userA: selectedPicker?.wallet_address,
        userB: walletAddress,
      },
    });
  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendChatMessage();

  // Set default picker if available
  useEffect(() => {
    if (pickers && pickers.length > 0 && !selectedPicker) {
      setSelectedPicker(pickers[0]);
    }
  }, [pickers, selectedPicker]);

  const handleSendMessage = (message: string) => {
    if (!selectedPicker?.wallet_address) return;
    sendMessage(
      {
        jobId,
        content: message,
        receiver_address: selectedPicker.wallet_address,
      },
      {
        onSuccess: () => refetchChatMessages(),
        onError: () => alert("Failed to send message."),
      }
    );
  };

  const handleAcceptJob = () => {
    if (!job || !selectedPicker) return;
    accept({ jobId: job.id, freelancer: selectedPicker.wallet_address });
  };

  const handleCompleteJob = () => {
    if (!job || !selectedPicker) return;
    complete({ jobId: job.id });
  };

  // On mobile, clicking a picker opens the chat popup
  const handlePickerClick = (picker: IUserInfoProfileSchema) => {
    setSelectedPicker(picker);
    if (window.innerWidth < 768) {
      setIsChatModalOpen(true);
    }
  };

  if (isJobLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center mt-20 text-gray-600">
            Loading job details...
          </p>
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

  const canAcceptJob = job.status === JobStatus.PUSHED && selectedPicker;
  const canCompleteJob =
    job.status === JobStatus.ACCEPTED &&
    selectedPicker &&
    job.freelancer?.wallet_address === selectedPicker.wallet_address;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavigationBar />

      <div className="container mx-auto max-w-6xl py-10 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 min-h-[90vh]">
        {/* Left Sidebar: List of Pickers */}
        <div className="w-full md:w-1/3 bg-white shadow-md rounded-lg p-6 overflow-auto min-h-[90vh]">
          <h3 className="text-2xl font-bold text-blue-800 mb-6">Job Pickers</h3>
          {arePickersLoading ? (
            <p className="text-gray-600">Loading pickers...</p>
          ) : pickers && pickers.length > 0 ? (
            <ul>
              {pickers.map((picker) => (
                <li
                  key={picker.id}
                  onClick={() => handlePickerClick(picker)}
                  className={`p-4 rounded-lg mb-4 cursor-pointer transition-colors ${
                    selectedPicker?.id === picker.id
                      ? "bg-blue-100"
                      : "bg-white hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={picker.image || "https://placehold.co/150x150"}
                      alt={picker.name || picker.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="text-lg font-semibold">
                        {picker.name || picker.username?.slice(0, 20)}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {shortenTransactionHash(picker.wallet_address)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No pickers found for this job.</p>
          )}
        </div>

        {/* Right Panel: Picker Info and Chat (Desktop) */}
        <div className="hidden md:block w-full md:w-2/3 bg-white shadow-md rounded-lg p-6 flex flex-col">
          {selectedPicker ? (
            <>
              {/* Picker Info */}
              <div className="flex flex-col sm:flex-row items-center mb-6">
                <img
                  src={selectedPicker.image || "https://placehold.co/150x150"}
                  alt={selectedPicker.name || selectedPicker.username}
                  className="w-24 h-24 rounded-full mr-0 sm:mr-4 mb-4 sm:mb-0"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-blue-800 mb-2">
                    {selectedPicker.name ||
                      selectedPicker.username?.slice(0, 20)}
                    <a
                      href={`${UrlMapping.resume}/${selectedPicker.wallet_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline ml-4"
                    >
                      View Resume
                    </a>
                  </h4>
                  {selectedPicker.bio && (
                    <p className="text-gray-600 mb-2">{selectedPicker.bio}</p>
                  )}
                  <span className="font-mono text-sm">
                    <b>{selectedPicker.wallet_address}</b>
                  </span>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col gap-2">
                  {canAcceptJob && (
                    <button
                      disabled={isLoadingAcceptJob}
                      onClick={handleAcceptJob}
                      className={`text-white px-4 py-2 rounded-lg transition ${
                        isLoadingAcceptJob
                          ? "bg-yellow-300 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      Accept Freelancer
                    </button>
                  )}
                  {canCompleteJob && (
                    <button
                      disabled={isLoadingCompleteJob}
                      onClick={handleCompleteJob}
                      className={`text-white px-4 py-2 rounded-lg transition ${
                        isLoadingCompleteJob
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      Complete &amp; Pay
                    </button>
                  )}
                  {job.status && (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full">
                      {job.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Section */}
              <Chat
                messages={chatMessages || []}
                currentUserAddress={walletAddress}
                onSendMessage={handleSendMessage}
                isLoading={isSendingMessage}
                className="flex-grow"
              />
            </>
          ) : (
            <p className="text-center text-gray-600">
              Select a picker to view their details and chat.
            </p>
          )}
        </div>
      </div>

      {/* Mobile Chat Popup Modal */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 max-w-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chat</h2>
              <button
                onClick={() => setIsChatModalOpen(false)}
                className="text-gray-600 flex items-center"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <Chat
              messages={chatMessages || []}
              currentUserAddress={walletAddress}
              onSendMessage={handleSendMessage}
              isLoading={isSendingMessage}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobPickersPage;
