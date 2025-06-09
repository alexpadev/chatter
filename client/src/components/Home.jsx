export const Home = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="flex items-center text-6xl font-bold text-blue-500 mb-6">
          chatter
          <svg
            className="ml-3"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="60"
            height="60"
            viewBox="0 0 256 256"
          >
            <g
              fill="#3b82f6"
              fillRule="nonzero"
              stroke="none"
              strokeWidth="1"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
              strokeDasharray=""
              strokeDashoffset="0"
              fontFamily="none"
              fontWeight="none"
              fontSize="none"
              textAnchor="none"
            >
              <g transform="scale(5.12,5.12)">
                <path d="M25,4c-12.68359,0 -23,8.97266 -23,20c0,6.1875 3.33594,12.06641 8.94922,15.83984c-0.13281,1.05078 -0.66406,3.60156 -2.76562,6.58594l-1.10547,1.56641l1.97656,0.00781c5.42969,0 9.10156,-3.32812 10.30859,-4.60547c1.83203,0.40234 3.72656,0.60547 5.63672,0.60547c12.68359,0 23,-8.97266 23,-20c0,-11.02734 -10.31641,-20 -23,-20z"></path>
              </g>
            </g>
          </svg>
        </h1>
        <p className="text-lg text-gray-700 mb-4 mr-5">
          The chattiest chat of all chats
        </p>
        <p className="text-lg text-gray-700 mb-4 mr-5">
          If you want to chat, you must log in. If you don't have an account, you can create one.
        </p>
        <p className="text-lg text-gray-700 mr-5">
          If you already have an account, log in and start{" "}
          <a href="/chat/list" className="text-blue-500 hover:text-blue-800 tansition font-bold">
            chatting
          </a>
          !
        </p>
      </div>
    );
  };
  