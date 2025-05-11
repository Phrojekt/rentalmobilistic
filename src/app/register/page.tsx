"use client";

import  Header  from "../../components/Header";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex flex-1 justify-center items-center p-10 max-sm:p-5">
        <RegisterForm />
      </main>
      <footer className="flex w-full p-5 justify-between bg-[#F8FAFC] max-lg:flex-wrap max-sm:flex-col max-sm:gap-8">
        <div className="flex flex-col gap-2.5 w-[280px] max-sm:w-full">
          <div>
            <svg
              width="280"
              height="58"
              viewBox="0 0 280 58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex h-[58px] py-2.5 items-center gap-2.5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.204 12.4883C4.454 12.4883 3.834 13.0863 3.834 13.8123V32.8473C3.834 33.1433 4.121 33.3943 4.427 33.3943H17.847C17.7221 33.1716 17.6593 32.9195 17.665 32.6643V30.8843H6.345V15.0443H34.005V21.5263H36.288V13.8123C36.288 13.0863 35.668 12.4883 34.918 12.4883H5.204ZM0 35.6623V38.0363H0.0450001C0.213 38.2463 2.151 38.4013 4.473 38.4013H18.03V36.5753C18.03 36.1953 18.224 35.8873 18.44 35.6623H0Z"
                fill="#EA580C"
              />
              <path
                d="M23.5204 23.3701C22.8054 23.3701 22.5754 24.0451 22.5754 24.0451L21.0224 28.8381V27.3531H18.5254V29.2091H20.8884L20.7194 29.6821C20.4974 30.3621 19.8094 30.3911 19.8094 30.3911H19.6064C18.8914 30.3911 18.8964 31.0991 18.8964 31.0991V33.8671C18.8964 34.5831 19.5384 34.5761 19.5384 34.5761C20.1704 34.5761 20.1794 35.3191 20.1794 35.3191V35.3861C20.1794 35.5181 20.1694 35.6021 20.2134 35.6901H20.0104C20.0104 35.6901 19.2684 35.7181 19.2684 36.4321V44.8031C19.2684 44.8031 19.2954 45.5121 20.0104 45.5121H22.7104C22.7104 45.5121 23.4204 45.5191 23.4204 44.8031V41.9681H28.1784V42.1031C28.1784 42.1031 28.1684 42.8121 28.8884 42.8121H36.3474C36.3474 42.8121 37.0554 42.8191 37.0554 42.1021C37.0554 42.1021 37.0364 42.0451 37.0224 41.9681H41.6804V44.8021C41.6804 44.8021 41.6694 45.5111 42.3894 45.5111H45.1234C45.1234 45.5111 45.8324 45.5181 45.8324 44.8021V36.4321C45.8324 36.4321 45.8324 35.6891 45.1224 35.6891H44.9544C45.0304 35.5211 45.0214 35.3851 45.0214 35.3851V35.2161C45.0214 34.5021 45.4604 34.5071 45.4604 34.5071C45.8914 34.5071 45.8654 33.7991 45.8654 33.7991V30.4921C45.8654 29.7771 45.1554 29.7831 45.1554 29.7831H44.9874C44.4484 29.7831 44.2034 29.4001 44.1104 29.2091H46.5064V27.3531H44.0084V28.9051L42.4894 24.0451C42.2754 23.3631 41.5444 23.3701 41.5444 23.3701H23.5194H23.5204ZM24.5324 25.4631H40.0594L41.0714 29.1761H23.5874L24.5324 25.4631ZM25.1064 31.0321C25.8464 31.0321 26.4564 31.6421 26.4564 32.3821C26.4564 33.1221 25.8464 33.6981 25.1064 33.6981C24.3664 33.6981 23.7564 33.1231 23.7564 32.3821C23.7564 31.6421 24.3664 31.0321 25.1064 31.0321ZM39.8564 31.0321C40.5964 31.0321 41.1734 31.6421 41.1734 32.3821C41.1755 32.5556 41.1429 32.7278 41.0775 32.8885C41.0121 33.0492 40.9151 33.1952 40.7924 33.3178C40.6696 33.4405 40.5236 33.5373 40.3628 33.6026C40.2021 33.6679 40.0299 33.7004 39.8564 33.6981C39.1164 33.6981 38.5064 33.1231 38.5064 32.3821C38.5064 31.6421 39.1164 31.0321 39.8564 31.0321ZM20.5834 31.6401H22.5074V33.0901H20.5834V31.6401ZM42.5574 31.6401H44.4804V33.0901H42.5574V31.6401Z"
                fill="#EA580C"
              />
              <path
                d="M23.2549 35.5322H41.6649V39.3322H23.2549V35.5322ZM26.1329 35.6402V39.3332V35.6402ZM29.2629 35.6402V39.3332V35.6402ZM32.3929 35.6402V39.3332V35.6402ZM35.5219 35.6402V39.3332V35.6402ZM38.6519 35.6402V39.3332V35.6402Z"
                fill="#EA580C"
              />
              <text
                fill="black"
                xmlSpace="preserve"
                style={{ whiteSpace: "pre" }}
                fontFamily="Roboto"
                fontSize="24"
                fontWeight="900"
                letterSpacing="0em"
              >
                <tspan x="56.5068" y="37.2031">
                  Rental Mobilistic
                </tspan>
              </text>
            </svg>
          </div>
          <p className="text-[#676773] font-inter text-base leading-[110%]">
            Complete platform for third-party car rentals. Rent a vehicle or
            list yours for rent in a simple and secure way.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-[280px] max-sm:w-full">
          <h2 className="text-black font-roboto text-base font-black h-[58px] py-2.5">
            Navigation
          </h2>
          <nav className="flex flex-col gap-2.5">
            {["Home", "Cars", "How it Works", "About Us", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[#676773] font-inter text-base leading-[110%]"
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-2.5 w-[280px] max-sm:w-full">
          <h2 className="text-black font-roboto text-base font-black h-[58px] py-2.5">
            Services
          </h2>
          <nav className="flex flex-col gap-2.5">
            {["Register Car", "Rent Car", "My Account", "FAQ"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[#676773] font-inter text-base leading-[110%]"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2.5 w-[280px] max-sm:w-full">
          <h2 className="text-black font-roboto text-base font-black h-[58px] py-2.5">
            Legal
          </h2>
          <nav className="flex flex-col gap-2.5">
            {["Terms of Use", "Privacy Policy", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[#676773] font-inter text-base leading-[110%]"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
