import { Outlet } from "react-router-dom";

export const MessageFilter = ({ searchQuery, setSearchQuery, inline }) => {
  return (
    <>
      <div className={inline ? "ml-2" : "max-w-2xl mx-auto my-8 p-4 rounded-md"}>
        <input
          type="text"
          placeholder="Search messages"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="py-1 px-3 border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      {!inline && <Outlet context={{ searchQuery }} />}
    </>
  );
};

export default MessageFilter;
