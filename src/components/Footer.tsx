export default function Footer() {
  return (
    <div className="flex w-full h-[281px] p-[20px_24px] justify-between items-start flex-wrap gap-5 bg-[#F8FAFC] max-lg:h-auto">
      <div className="flex w-[280px] h-[210px] pb-5 flex-col items-start gap-2.5 max-lg:w-[calc(50%-10px)] max-sm:w-full">
        <div className="flex h-[58px] py-[10px] items-center gap-2.5 w-full">
          <svg
            width="327"
            height="58"
            viewBox="0 0 327 58"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.204 12.4883C14.454 12.4883 13.834 13.0863 13.834 13.8123V32.8473C13.834 33.1433 14.121 33.3943 14.427 33.3943H27.847C27.7221 33.1716 27.6593 32.9195 27.665 32.6643V30.8843H16.345V15.0443H44.005V21.5263H46.288V13.8123C46.288 13.0863 45.668 12.4883 44.918 12.4883H15.204ZM10 35.6623V38.0363H10.045C10.213 38.2463 12.151 38.4013 14.473 38.4013H28.03V36.5753C28.03 36.1953 28.224 35.8873 28.44 35.6623H10Z"
              fill="#EA580C"
            />
            <path
              d="M33.5204 23.3701C32.8054 23.3701 32.5754 24.0451 32.5754 24.0451L31.0224 28.8381V27.3531H28.5254V29.2091H30.8884L30.7194 29.6821C30.4974 30.3621 29.8094 30.3911 29.8094 30.3911H29.6064C28.8914 30.3911 28.8964 31.0991 28.8964 31.0991V33.8671C28.8964 34.5831 29.5384 34.5761 29.5384 34.5761C30.1704 34.5761 30.1794 35.3191 30.1794 35.3191V35.3861C30.1794 35.5181 30.1694 35.6021 30.2134 35.6901H30.0104C30.0104 35.6901 29.2684 35.7181 29.2684 36.4321V44.8031C29.2684 44.8031 29.2954 45.5121 30.0104 45.5121H32.7104C32.7104 45.5121 33.4204 45.5191 33.4204 44.8031V41.9681H38.1784V42.1031C38.1784 42.1031 38.1684 42.8121 38.8884 42.8121H46.3474C46.3474 42.8121 47.0554 42.8191 47.0554 42.1021C47.0554 42.1021 47.0364 42.0451 47.0224 41.9681H51.6804V44.8021C51.6804 44.8021 51.6694 45.5111 52.3894 45.5111H55.1234C55.1234 45.5111 55.8324 45.5181 55.8324 44.8021V36.4321C55.8324 36.4321 55.8324 35.6891 55.1224 35.6891H54.9544C55.0304 35.5211 55.0214 35.3851 55.0214 35.3851V35.2161C55.0214 34.5021 55.4604 34.5071 55.4604 34.5071C55.8914 34.5071 55.8654 33.7991 55.8654 33.7991V30.4921C55.8654 29.7771 55.1554 29.7831 55.1554 29.7831H54.9874C54.4484 29.7831 54.2034 29.4001 54.1104 29.2091H56.5064V27.3531H54.0084V28.9051L52.4894 24.0451C52.2754 23.3631 51.5444 23.3701 51.5444 23.3701H33.5194H33.5204Z"
              fill="#EA580C"
            />
            <text
              fill="black"
              xmlSpace="preserve"
              style={{ whiteSpace: "pre" }}
              fontFamily="Geist"
              fontSize="24"
              fontWeight="900"
              letterSpacing="0em"
            >
              <tspan x="66.5063" y="37.52">
                Rental Mobilistic
              </tspan>
            </text>
          </svg>
        </div>
        <p className="w-[250px] text-[#676773] font-inter text-base font-normal leading-[110%]">
          Complete platform for third-party car rentals. Rent a vehicle or list
          yours for rent in a simple and secure way.
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex w-[280px] h-[210px] pb-5 flex-col items-start gap-2.5 max-lg:w-[calc(50%-10px)] max-sm:w-full">
        <h3 className="text-black font-roboto text-base font-black h-[58px] py-[10px] gap-2.5 w-full">
          Navigation
        </h3>
        {["Home", "Cars", "How it Works", "About Us", "Contact"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-[#676773] font-inter text-base font-normal leading-[110%] w-full"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Services Links */}
      <div className="flex w-[280px] h-[210px] pb-5 flex-col items-start gap-2.5 max-lg:w-[calc(50%-10px)] max-sm:w-full">
        <h3 className="text-black font-roboto text-base font-black h-[58px] py-[10px] gap-2.5 w-full">
          Services
        </h3>
        {["Register Car", "Rent Car", "My Account", "FAQ"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-[#676773] font-inter text-base font-normal leading-[110%] w-full"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Legal Links */}
      <div className="flex w-[280px] h-[210px] pb-5 flex-col items-start gap-2.5 max-lg:w-[calc(50%-10px)] max-sm:w-full">
        <h3 className="text-black font-roboto text-base font-black h-[58px] py-[10px] gap-2.5 w-full">
          Legal
        </h3>
        {["Terms of Use", "Privacy Policy", "Cookie Policy"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-[#676773] font-inter text-base font-normal leading-[110%] w-full"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}
