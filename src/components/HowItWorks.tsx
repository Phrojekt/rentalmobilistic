export default function HowItWorks() {
  const steps = [
    {
      icon: "user",
      title: "Create your account",
      description: "Sign up for free on the platform in just a few minutes.",
    },
    {
      icon: "car",
      title: "Choose a car",
      description: "Browse available cars and find the ideal one for you.",
    },
    {
      icon: "check",
      title: "Confirm the reservation",
      description:
        "Make the reservation and arrange pickup directly with the owner.",
    },
  ];

  return (
    <div className="flex w-full h-[474px] pt-10 pb-2.5 px-2.5 flex-col items-center gap-10 bg-[#F8FAFC] max-lg:h-auto" id="how-it-works">
      <div className="flex px-[101px] flex-col justify-center items-center gap-0.5">
        <h2 className="text-black font-geist text-3xl font-extrabold">
          How it Works
        </h2>
        <p className="text-[#676773] font-inter text-xl font-normal">
          Renting or listing a car has never been easier
        </p>
      </div>
      <div className="flex w-[1200px] h-[246px] p-2.5 justify-center items-center gap-[30px] max-lg:w-full max-lg:h-auto max-lg:flex-wrap">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex w-[360px] h-[200px] p-[20px_10px_10px] flex-col items-center gap-5 rounded-lg bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] max-lg:w-[calc(50%-15px)] max-sm:w-full"
          >
            <div className="flex w-[50px] h-[50px] p-2.5 flex-col justify-center items-center gap-2.5 rounded-[30px] bg-[#FFF7ED]">
              {index === 0 && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.3773 27.8758C22.3773 28.0588 22.3037 28.2343 22.1726 28.3641C22.0415 28.494 21.8635 28.5676 21.6775 28.5689H16.3225C16.1356 28.5689 15.9563 28.4959 15.8241 28.3659C15.6919 28.2359 15.6176 28.0596 15.6176 27.8758C15.6176 27.692 15.6919 27.5157 15.8241 27.3857C15.9563 27.2557 16.1356 27.1827 16.3225 27.1827H21.6775C21.7698 27.1827 21.8612 27.2006 21.9465 27.2355C22.0317 27.2704 22.1091 27.3216 22.1741 27.386C22.2392 27.4504 22.2906 27.5269 22.3255 27.6109C22.3603 27.695 22.3779 27.785 22.3773 27.8758Z"
                    fill="#EA580C"
                  />
                </svg>
              )}
              {index === 1 && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M37.5244 32.7656V34.7627C37.5244 35.4499 36.9824 36.002 36.3091 36L34.733 35.9899C34.5718 35.9886 34.4124 35.9554 34.264 35.892C34.1156 35.8287 33.981 35.7366 33.868 35.6209C33.7551 35.5052 33.6659 35.3683 33.6056 35.2179C33.5453 35.0675 33.5151 34.9067 33.5167 34.7446V32.9147"
                    fill="#EA580C"
                  />
                </svg>
              )}
              {index === 2 && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M35 13C31.8174 13 28.7652 14.2643 26.5147 16.5147C24.2643 18.7652 23 21.8174 23 25C23 28.1826 24.2643 31.2348 26.5147 33.4853C28.7652 35.7357 31.8174 37 35 37C38.1826 37 41.2348 35.7357 43.4853 33.4853C45.7357 31.2348 47 28.1826 47 25C47 21.8174 45.7357 18.7652 43.4853 16.5147C41.2348 14.2643 38.1826 13 35 13ZM33.5 31L28.25 25.75L30.5 23.5L33.5 26.5L39.563 20.437L41.75 22.75L33.5 31Z"
                    fill="#EA580C"
                  />
                </svg>
              )}
            </div>
            <div className="flex w-[308px] h-[72px] px-2.5 flex-col items-center gap-0.5">
              <h3 className="text-black font-geist text-2xl font-bold">
                {step.title}
              </h3>
              <p className="h-[39px] text-[#676773] text-center font-inter text-base font-normal">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
