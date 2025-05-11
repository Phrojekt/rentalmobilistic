import Link from "next/link";

export default function FeaturedCars() {
  const cars = Array(4).fill({
    name: "Car Name and Year",
    price: "$150/day",
    city: "City",
    seats: "Number of Seats",
    availability: "Availability",
  });

  return (
    <div className="flex w-full h-[590px] p-2.5 flex-col items-center gap-[30px] max-lg:h-auto" id="featured-cars">
      <div className="flex w-full h-20 px-2.5 flex-col items-center gap-2.5">
        <h2 className="text-black font-geist text-4xl font-extrabold">
          Featured Cars
        </h2>
        <p className="text-[#676773] font-geist text-sm font-medium">
          Check out some of the best vehicles available for rent
        </p>
      </div>
      <div className="flex w-[1392px] h-[346px] justify-between items-center gap-5 px-5 max-lg:w-full max-lg:h-auto max-lg:flex-wrap">
        {cars.map((car, index) => (
          <div
            key={index}
            className="flex w-[322px] h-[346px] p-0 px-2.5 flex-col items-center gap-2.5 rounded-lg border-[0.75px] border-[#D4D4D4] bg-white max-lg:w-[calc(50%-10px)] max-sm:w-full"
          >
            <div className="w-full h-40 bg-[#B5B2B2]" />
            <div className="flex w-full h-[30px] px-[10px_10px_10px_20px] justify-between items-center">
              <h3 className="text-black font-geist text-base font-bold">
                {car.name}
              </h3>
              <span className="text-[#EA580C] font-geist text-[10px] font-medium w-[60px] h-5 p-2.5 gap-2.5 rounded-[30px] bg-[#FFF7ED]">
                {car.price}
              </span>
            </div>
            <div className="flex w-full h-[75px] px-[10px_10px_10px_20px] flex-col justify-between items-start">
              <div className="flex items-center gap-1 text-[#676773]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 2C7.55228 2 8 2.44772 8 3C8 3.55228 7.55228 4 7 4C6.44772 4 6 3.55228 6 3C6 2.44772 6.44772 2 7 2Z" />
                </svg>
                <span className="font-inter text-sm font-medium">
                  {car.city}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#676773]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 2C8.10457 2 9 2.89543 9 4C9 5.10457 8.10457 6 7 6C5.89543 6 5 5.10457 5 4C5 2.89543 5.89543 2 7 2Z" />
                </svg>
                <span className="font-inter text-sm font-medium">
                  {car.seats}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#676773]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 1V2H3C2.44772 2 2 2.44772 2 3V11C2 11.5523 2.44772 12 3 12H11C11.5523 12 12 11.5523 12 11V3C12 2.44772 11.5523 2 11 2H10V1H4Z" />
                </svg>
                <span className="font-inter text-sm font-medium">
                  {car.availability}
                </span>
              </div>
            </div>
            <Link
              href={`/cars/${index + 1}`}
              className="text-white font-geist text-sm font-bold w-[282px] h-9 p-2.5 gap-2.5 rounded bg-[#EA580C] flex items-center justify-center"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
      <button className="text-black font-geist text-sm font-bold w-[180px] h-10 p-2.5 gap-2.5 rounded border-[0.75px] border-[#676773]">
        View All Cars
      </button>
    </div>
  );
}
