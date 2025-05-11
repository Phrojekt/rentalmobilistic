export default function CarSpecifications() {
  const specifications = [
    { icon: "car", label: "Category", value: "Sedan" },
    { icon: "users", label: "Seats", value: "5" },
    { icon: "gear", label: "Transmission", value: "Automatic" },
    { icon: "fuel", label: "Fuel", value: "Flex" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-black font-inter text-xl font-semibold">
        Description
      </h2>
      <p className="text-[#676773] font-inter text-sm font-semibold max-w-[1241px]">
        Honda Civic 2022 in excellent condition. Fully equipped car with air
        conditioning, power steering, power windows and locks, multimedia center
        with Android Auto and Apple CarPlay.
      </p>

      <div className="flex flex-wrap gap-5 w-full max-lg:gap-2.5">
        {specifications.map((spec) => (
          <div
            key={spec.label}
            className="flex w-[299px] h-[84px] p-2.5 flex-col gap-2.5 bg-[#F8FAFC] max-sm:w-full"
          >
            <span className="text-black font-inter text-sm font-medium">
              {spec.label}
            </span>
            <span className="text-[#676773] font-inter text-sm">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
