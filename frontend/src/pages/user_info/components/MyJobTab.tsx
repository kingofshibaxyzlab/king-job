import { formatDistanceToNow } from "date-fns";
import { formatEther } from "ethers";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { UrlMapping } from "@/commons/url-mapping.common";
import env from "@/env";
import { useCreateJob } from "@/hooks/useCreateJob";
import { JobStatus, useJobsByClient } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";

const MyJobTab: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: userJobs,
    isLoading: isJobsLoading,
    error: errorJobsLoading,
  } = useJobsByClient();

  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const {
    create,
    isLoading,
    isSuccess,
    error,
    hash: transactionHash,
  } = useCreateJob();

  const handleCreateJob = (jobId: number, jobAmount: string) => {
    setCurrentJobId(jobId);
    create({ jobId, amount: jobAmount });
  };

  if (isJobsLoading) {
    return <div className="py-8 text-center">Loading jobs...</div>;
  }
  if (errorJobsLoading) {
    return (
      <div className="py-8 text-center text-red-500">
        Error loading jobs. Please try again later.
      </div>
    );
  }

  const renderJobCard = (job: any) => {
    const isPushLoading = isLoading && job.id === currentJobId;
    // Button disabled when loading or job status is not NEW
    const canPushOnchain = job.status === JobStatus.NEW && !isLoading;

    return (
      <div
        key={job.id}
        className="p-6 border rounded-lg shadow-lg bg-gray-50 hover:bg-white transition-colors duration-300 min-w-fit"
      >
        <div className="flex flex-col md:flex-row items-center md:space-x-6">
          <img
            src={job.image || "https://via.placeholder.com/150"}
            alt={job.title}
            className="w-24 h-24 object-cover rounded-lg mb-4 md:mb-0"
          />
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-700">{job.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                  job.status
                )}`}
              >
                {job.status}
              </span>
            </div>
            <p className="mt-2 text-gray-600 font-semibold">
              Amount: {formatEther(job.amount.toString())} BSC
            </p>
            <div className="mt-3 flex flex-col sm:flex-row sm:space-x-4">
              <p className="text-sm text-gray-500 mt-1">
                Created:{" "}
                {job.created_at
                  ? formatDistanceToNow(new Date(job.created_at), {
                      addSuffix: true,
                    })
                  : "Unknown"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Updated:{" "}
                {job.updated_at
                  ? formatDistanceToNow(new Date(job.updated_at), {
                      addSuffix: true,
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center mt-4 md:mt-0 space-y-3">
            <button
              onClick={() => handleCreateJob(job.id, job.amount)}
              disabled={!canPushOnchain}
              className={`w-36 rounded-full py-2 px-4 text-white transition-all duration-300 ${
                isPushLoading || !canPushOnchain
                  ? "bg-yellow-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {isPushLoading ? "Processing..." : "Push onchain"}
            </button>
            <button
              onClick={() => navigate(`${UrlMapping.job_picker}/${job.id}`)}
              className="w-36 rounded-full bg-yellow-500 py-2 px-4 text-white transition-all duration-300 hover:bg-yellow-600"
            >
              View Picker
            </button>
          </div>
        </div>
        {isSuccess && transactionHash && job.id === currentJobId && (
          <p className="mt-3 text-center text-green-600">
            Push onchain successful!{" "}
            <a
              href={`${env.EXPLORER_SCAN}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction
            </a>
          </p>
        )}
        {error && job.id === currentJobId && (
          <p className="mt-3 text-center text-red-500">{error.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl">
      <h2 className="mb-6 text-center text-xl font-extrabold text-blue-800">
        My Jobs
      </h2>
      {userJobs && userJobs.length > 0 ? (
        <div className="space-y-4">
          {userJobs.map((job: any) => renderJobCard(job))}
        </div>
      ) : (
        <div className="py-8 text-center">No jobs found.</div>
      )}
    </div>
  );
};

export default MyJobTab;
