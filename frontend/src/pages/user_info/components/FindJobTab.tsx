import { formatDistanceToNow } from "date-fns";
import { formatEther } from "ethers";
import React from "react";
import { useNavigate } from "react-router-dom";

import { UrlMapping } from "@/commons/url-mapping.common";
import { useJobsByFreelancer } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";

const FindJobTab: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: userJobs,
    isLoading: isJobsLoading,
    error: errorJobsLoading,
  } = useJobsByFreelancer();

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

  const renderJobCard = (job: any) => (
    <div
      key={job.id}
      className="p-6 border rounded-lg shadow-lg bg-gray-50 hover:bg-white transition ease-in-out duration-300"
    >
      <div className="flex flex-col md:flex-row items-center md:space-x-6">
        <img
          src={job.image || "https://via.placeholder.com/150"}
          alt={job.title}
          className="w-24 h-24 object-cover rounded-lg mb-4 md:mb-0"
        />
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <h3 className="text-xl font-bold text-blue-700">{job.title}</h3>
            <span
              className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
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
            <p className="text-sm text-gray-500">
              Created:{" "}
              {job.created_at
                ? formatDistanceToNow(new Date(job.created_at), {
                    addSuffix: true,
                  })
                : "Unknown"}
            </p>
            <p className="text-sm text-gray-500">
              Updated:{" "}
              {job.updated_at
                ? formatDistanceToNow(new Date(job.updated_at), {
                    addSuffix: true,
                  })
                : "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex mt-4 md:mt-0">
          <button
            onClick={() => navigate(`${UrlMapping.job_found}/${job.id}`)}
            className="w-36 rounded-full bg-yellow-500 py-2 px-4 text-white transition-all duration-300 hover:bg-yellow-600"
          >
            View Job
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl">
      <h2 className="mb-6 text-center text-xl font-extrabold text-blue-800">
        Find Jobs
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

export default FindJobTab;
