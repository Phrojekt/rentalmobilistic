export default function SearchBar() {
  return (
    <div className="flex w-full h-[211px] pt-[50px] pb-2.5 px-2.5 justify-center items-start gap-2.5 bg-white max-lg:h-auto">
      <div className="flex w-[1096px] h-[124px] p-2.5 flex-col items-center gap-5 rounded-b-lg bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25),1px_8px_4px_0px_rgba(0,0,0,0.18)] max-lg:w-full max-lg:h-auto">
        <h2 className="text-black font-geist text-2xl font-bold">
          Find the ideal car for you
        </h2>
        <div className="flex h-[58px] px-5 items-end gap-[55px] w-full max-lg:h-auto max-lg:flex-col max-lg:gap-5">
          <input
            type="text"
            placeholder="Brand, model or city"
            className="text-[#676773] font-inter text-sm font-normal w-[811px] h-[45px] px-2.5 gap-2.5 rounded-lg border border-[#E4E4E7] max-lg:w-full"
          />
          <button className="flex w-[170px] max-lg:w-full h-[45px] p-[5px_15px] justify-center items-center gap-1 rounded-lg bg-[#EA580C]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.6148 13.6148C13.1013 14.1284 12.2688 14.1284 11.7552 13.6148L9.43477 11.2943C8.48081 11.9064 7.35307 12.271 6.13547 12.271C2.74722 12.271 0 9.52422 0 6.13547C0 2.74722 2.74722 0 6.13547 0C9.52422 0 12.271 2.74672 12.271 6.13547C12.271 7.35267 11.9059 8.48081 11.2943 9.43517L13.6148 11.7557C14.1284 12.2693 14.1284 13.1013 13.6148 13.6148Z"
                fill="white"
              />
            </svg>
            <span className="text-white font-inter text-sm font-bold">
              Search
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
