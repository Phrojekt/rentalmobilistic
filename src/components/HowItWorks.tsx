import Image from "next/image";

export default function HowItWorks() {
  const steps = [
    {
      icon: "/Add_user_icon.png", // Caminho para o ícone de usuário
      title: "Create your account",
      description: "Sign up for free on the platform in just a few minutes.",
    },
    {
      icon: "/CarIcon.png", // Caminho para o ícone de carro
      title: "Choose a car",
      description: "Browse available cars and find the ideal one for you.",
    },
    {
      icon: "/Confirm_Icon.png", // Caminho para o ícone de confirmação
      title: "Confirm the reservation",
      description:
        "Make the reservation and arrange pickup directly with the owner.",
    },
  ];

  return (
    <div
      className="flex w-full h-[474px] pt-10 pb-2.5 px-2.5 flex-col items-center gap-10 bg-[#F8FAFC] max-lg:h-auto"
      id="how-it-works"
    >
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
              <Image
                src={step.icon}
                alt={step.title}
                width={24}
                height={24}
                className="object-contain"
              />
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
