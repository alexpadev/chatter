import { Outlet, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Bios = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQueryFromURL = searchParams.get("search") || "";

  const [inputValue, setInputValue] = useState(searchQueryFromURL);

  useEffect(() => {
    setInputValue(searchQueryFromURL);
  }, [searchQueryFromURL]);

  const handleSearch = () => {
    if (inputValue.trim() === "") {
      setSearchParams({});
    } else {
      setSearchParams({ search: inputValue });
    }
  };

  return (
    <>
      <div className="border border-gray-300 max-w-xl mx-auto my-8 p-4 bg-white rounded-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4 ml-1">Bios</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search bios"
            className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="cursor-pointer rounded-full bg-blue-500 hover:bg-blue-800 transition text-white px-4 py-2 font-bold"
          >
            Search
          </button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        <Outlet context={{ searchQuery: searchQueryFromURL }} />
      </div>
    </>
  );
};
