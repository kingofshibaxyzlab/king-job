import { UrlMapping } from "@/commons/url-mapping.common";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useJobs, useJobTypes } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { JOB_STATUSES } from "@/utils/const";
import { formatDistanceToNow } from "date-fns";
import { formatEther, parseEther } from "ethers";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";

interface FilterValues {
  job_type_id?: number;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

// Update Job interface: amount is now a string to match API output.
interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  amount: string;
}

interface FilterPanelProps {
  filterValues: FilterValues;
  onFilterChange: (
    field: keyof FilterValues,
    value: string | number | undefined
  ) => void;
  jobTypes: any[];
  isJobTypesLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterValues,
  onFilterChange,
  jobTypes,
  isJobTypesLoading,
}) => (
  <aside className="w-full max-w-xs bg-white p-6 rounded-lg shadow-md sticky top-4">
    <h3 className="text-xl font-bold text-blue-800 mb-4">Filters</h3>
    {/* Search Filter */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Search Title/Description
      </label>
      <input
        type="text"
        className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filterValues.search || ""}
        onChange={(e) => onFilterChange("search", e.target.value)}
      />
    </div>
    {/* Job Type Filter */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Job Type
      </label>
      <select
        className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filterValues.job_type_id || ""}
        onChange={(e) =>
          onFilterChange(
            "job_type_id",
            e.target.value ? Number(e.target.value) : undefined
          )
        }
        disabled={isJobTypesLoading}
      >
        <option value="">All</option>
        {!isJobTypesLoading &&
          jobTypes.map((type: any) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
      </select>
    </div>
    {/* Min Amount Filter */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Min Amount (BNB)
      </label>
      <input
        type="number"
        className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) =>
          onFilterChange("min_amount", e.target.value || undefined)
        }
      />
    </div>
    {/* Max Amount Filter */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Max Amount (BNB)
      </label>
      <input
        type="number"
        className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) =>
          onFilterChange("max_amount", e.target.value || undefined)
        }
      />
    </div>
    {/* Status Filter */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700">Status</label>
      <select
        className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filterValues.status || ""}
        onChange={(e) => onFilterChange("status", e.target.value || undefined)}
      >
        {JOB_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  </aside>
);

const AllJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: jobTypes, isLoading: isJobTypesLoading } = useJobTypes();

  // Filter state with pagination keys
  const [filterValues, setFilterValues] = useState<FilterValues>({
    job_type_id: undefined,
    min_amount: undefined,
    max_amount: undefined,
    search: "",
    status: "",
    page: 1,
    per_page: 10,
  });

  const [allJobs, setAllJobs] = useState<Job[]>([]);

  const {
    data: paginatedJobs,
    isLoading,
    error,
  } = useJobs({ variables: filterValues });

  const hasNext =
    paginatedJobs?.has_next !== undefined ? paginatedJobs.has_next : true;

  useEffect(() => {
    if (paginatedJobs?.data) {
      const transformedJobs: Job[] = paginatedJobs.data.map((job) => ({
        ...job,
        amount: Number(job.amount).toLocaleString("fullwide", {
          useGrouping: false,
          maximumFractionDigits: 0,
        }),
      }));
      if (filterValues.page === 1) {
        setAllJobs(transformedJobs);
      } else {
        setAllJobs((prev) => [...prev, ...transformedJobs]);
      }
    }
  }, [paginatedJobs, filterValues.page]);

  const handleFilterChange = (
    field: keyof FilterValues,
    value: string | number | undefined
  ) => {
    let parsedValue: number | undefined;
    if (field === "min_amount" || field === "max_amount") {
      parsedValue = value ? Number(parseEther(value.toString())) : undefined;
    } else if (field === "job_type_id") {
      parsedValue = value ? Number(value) : undefined;
    } else {
      parsedValue = value as number | undefined;
    }
    setFilterValues((prev) => ({
      ...prev,
      [field]: parsedValue ?? value,
      page: 1,
    }));
    setAllJobs([]);
  };

  const fetchMoreData = () => {
    if (hasNext) {
      setFilterValues((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavigationBar />
      <main className="container mx-auto py-16 px-4 md:px-8 flex flex-col md:flex-row gap-8">
        {/* Filter Panel */}
        <div className="order-1 w-full md:w-auto">
          <FilterPanel
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            jobTypes={jobTypes || []}
            isJobTypesLoading={isJobTypesLoading}
          />
        </div>
        {/* Job List Panel */}
        <section className="flex-1 order-2">
          <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center md:text-left">
            All Jobs
          </h2>
          {error ? (
            <p className="text-center text-red-600 text-xl mb-4">
              Failed to load jobs.
            </p>
          ) : (
            <>
              {isLoading && filterValues.page === 1 ? (
                <p className="text-center text-gray-600">Loading jobs...</p>
              ) : (
                <InfiniteScroll
                  dataLength={allJobs.length}
                  next={fetchMoreData}
                  hasMore={hasNext}
                  loader={
                    <p className="text-center text-gray-600 mt-3">
                      Loading more jobs...
                    </p>
                  }
                  endMessage={
                    <p className="text-center text-gray-600 text-base mt-3">
                      {hasNext
                        ? "Scroll down to load more."
                        : "No more jobs available."}
                    </p>
                  }
                >
                  <ul className="space-y-6">
                    {allJobs.map((job) => (
                      <li
                        key={job.id}
                        className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center border border-gray-200 cursor-pointer"
                        onClick={() =>
                          navigate(`${UrlMapping.detail}/${job.id}`)
                        }
                      >
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-blue-700">
                            {job.title}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-2 items-center">
                            <span
                              className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(
                                job.status
                              )}`}
                            >
                              {job.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              Created:{" "}
                              {formatDistanceToNow(new Date(job.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-700 font-semibold text-xl">
                            {formatEther(job.amount)} BNB
                          </div>
                          <button
                            onClick={() =>
                              navigate(`${UrlMapping.detail}/${job.id}`)
                            }
                            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700 transition duration-300"
                          >
                            View
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </InfiniteScroll>
              )}
              {!isLoading && allJobs.length === 0 && (
                <p className="text-center text-gray-600 text-base mt-3">
                  No jobs available.
                </p>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AllJobsPage;
