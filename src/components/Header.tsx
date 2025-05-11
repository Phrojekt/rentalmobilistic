"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="flex w-full h-[82px] px-20 justify-between items-center border-[0.25px] border-black max-lg:px-10 max-sm:px-5">
      <div className="flex items-center">
        <svg
          width="327"
          height="58"
          viewBox="0 0 327 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex w-[327px] max-lg:w-[200px] max-sm:w-[150px] h-[58px] p-[10px] items-center gap-[10px]"
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

      <nav className="flex w-[743px] justify-between items-center gap-[30px] max-lg:w-auto max-sm:hidden">
        {[
          { name: "Home", href: "/" },
          { name: "Cars", href: "/cars" },
          { name: "How it Works", href: "#how-it-works" },
          { name: "About Us", href: "#testimonials" },
          { name: "Contact", href: "#" },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-black font-inter text-lg font-medium"
          >
            {item.name}
          </Link>
        ))}

        <div className="flex items-center gap-2.5">
          <button className="flex w-[38px] p-[8px_4px] justify-center items-center gap-2.5 rounded border-[0.6px] border-[#E4E4E7]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C10.8954 22 10 21.1046 10 20H14C14 21.1046 13.1046 22 12 22ZM20 19H4V17L6 16V11C6 7.68629 8.68629 5 12 5C15.3137 5 18 7.68629 18 11V16L20 17V19ZM12 3C12.5523 3 13 3.44772 13 4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3Z"
                fill="#0F0F0F"
              />
            </svg>
          </button>
          <Link
            href="/login" // Conectando o botão de Login à rota de login
            className="flex w-[100px] h-[38px] p-2.5 justify-center items-center gap-2.5"
          >
            <span className="text-black font-inter text-base font-black">
              Login
            </span>
          </Link>
          <Link
            href="/register"
            className="flex w-[126px] h-[38px] p-2.5 justify-center items-center gap-2.5 rounded bg-[#EA580C]"
          >
            <span className="text-white font-inter text-base font-medium">
              Register
            </span>
          </Link>
        </div>
      </nav>

      <button className="hidden max-sm:block">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M4 6h16"></path>
          <path d="M4 12h16"></path>
          <path d="M4 18h16"></path>
        </svg>
      </button>
    </header>
  );
}
