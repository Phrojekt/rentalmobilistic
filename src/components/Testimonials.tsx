export default function Testimonials() {
  const testimonials = [
    {
      name: "Charles Smith",
      role: "Owner",
      content:
        "I earned extra income by renting my car on weekends. The platform is very easy to use and the support is excellent!",
    },
    {
      name: "Anna Johnson",
      role: "Renter",
      content:
        "I rented a car for a weekend trip and it was an amazing experience. Simple process and fair prices.",
    },
    {
      name: "Mark Williams",
      role: "Owner",
      content:
        "I've rented my car several times and never had any problems. The platform takes care of everything and payments are always on time.",
    },
  ];

  return (
    <div className="flex w-full h-[447px] pt-10 pb-2.5 px-2.5 flex-col items-center gap-10 bg-white max-lg:h-auto" id="testimonials">
      <div className="flex px-[101px] flex-col justify-center items-center gap-0.5">
        <h2 className="text-black font-geist text-3xl font-extrabold">
          What our users say
        </h2>
        <p className="text-[#676773] font-inter text-xl font-normal">
          See the experiences of those who already use our platform
        </p>
      </div>
      <div className="flex w-[1200px] h-[246px] p-2.5 justify-center items-center gap-[30px] max-lg:w-full max-lg:h-auto max-lg:flex-wrap">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex w-[360px] h-[200px] p-[20px_20px_10px] flex-col items-start gap-2.5 rounded-lg border border-[#676773] bg-white max-lg:w-[calc(50%-15px)] max-sm:w-full"
          >
            <div className="flex h-10 items-start gap-2.5 w-full">
              <div className="w-10 h-10 rounded-[30px] bg-[#676773]" />
              <div className="flex w-[200px] h-10 flex-col items-start gap-1">
                <h3 className="w-[109px] h-[17px] text-black font-geist text-base font-semibold">
                  {testimonial.name}
                </h3>
                <p className="w-[109px] h-3 text-[#676773] font-geist text-xs font-normal">
                  {testimonial.role}
                </p>
              </div>
            </div>
            <div className="flex h-[94px] flex-col items-start gap-1.5 w-full">
              <div className="flex w-[230px] h-[25px] py-[10px] items-center gap-[1px]">
                {/* 5 star rating */}
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-[#EA580C]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
              </div>
              <p className="text-[#676773] font-inter text-base font-normal">
                {testimonial.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
