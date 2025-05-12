export default function Footer() {
  return (
    <div className="flex w-full h-[281px] p-[20px_24px] justify-between items-start flex-wrap gap-5 bg-[#F8FAFC] max-lg:h-auto">
      <div className="flex w-[280px] h-[210px] pb-5 flex-col items-start gap-2.5 max-lg:w-[calc(50%-10px)] max-sm:w-full">
        <div className="flex h-[58px] py-[10px] items-center gap-2.5 w-full">
          {/* Substituindo o SVG pelo RentalIcon.png */}
          <img
            src="/RentalIcon.png"
            alt="Rental Mobilistic Icon"
            className="w-[50px] h-[50px] object-contain"
          />
          <h1 className="text-black font-geist text-2xl font-bold">
            Rental Mobilistic
          </h1>
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
        {[
          { name: "Home", href: "/" },
          { name: "Cars", href: "/cars" },
          { name: "How it Works", href: "#how-it-works" },
          { name: "About Us", href: "#testimonials" },
          { name: "Contact", href: "#" }, // Placeholder
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-[#676773] font-inter text-base font-normal leading-[110%] w-full"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Services Links */}
      <div className="flex w-[280px] h-[210px] pb-5 flex-col items-start gap-2.5 max-lg:w-[calc(50%-10px)] max-sm:w-full">
        <h3 className="text-black font-roboto text-base font-black h-[58px] py-[10px] gap-2.5 w-full">
          Services
        </h3>
        {[
          { name: "Register Car", href: "#" }, // Placeholder
          { name: "Rent Car", href: "#" }, // Placeholder
          { name: "My Account", href: "#" }, // Placeholder
          { name: "FAQ", href: "#" }, // Placeholder
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-[#676773] font-inter text-base font-normal leading-[110%] w-full"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Legal Links */}
      <div className="flex w-[280px] h-[210px] pb-5 flex-col items-start gap-2.5 max-lg:w-[calc(50%-10px)] max-sm:w-full">
        <h3 className="text-black font-roboto text-base font-black h-[58px] py-[10px] gap-2.5 w-full">
          Legal
        </h3>
        {[
          { name: "Terms of Use", href: "#" }, // Placeholder
          { name: "Privacy Policy", href: "#" }, // Placeholder
          { name: "Cookie Policy", href: "#" }, // Placeholder
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-[#676773] font-inter text-base font-normal leading-[110%] w-full"
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
}
