"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userService } from "@/services/userService";
import Image from "next/image";
import { imageService } from "@/services/imageService";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required").optional(),
  profilePicture: z.string().optional(),
}).partial();

type ProfileFormType = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData?: {
    fullName: string;
    email: string;
    profilePicture?: string;
  } | null;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.profilePicture || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormType>({
    defaultValues: {
      fullName: initialData?.fullName || "",
      profilePicture: initialData?.profilePicture || "",
    },
    resolver: zodResolver(profileFormSchema),
  });
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert the file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;
        try {
          const imageUrl = await imageService.uploadImage(base64Image);
          setValue("profilePicture", imageUrl);
          setImagePreview(imageUrl);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          setError("Failed to upload image. Please try again.");
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setError("Failed to read image file. Please try again.");
      };
    } catch (err) {
      console.error("Error handling image upload:", err);
      setError("Failed to process image. Please try again.");
    }
  };  const onSubmit = async (data: ProfileFormType) => {
    setError("");
    setLoading(true);

    try {
      const changedFields: Partial<ProfileFormType> = {};
      
      if (data.fullName !== undefined && data.fullName !== initialData?.fullName) {
        changedFields.fullName = data.fullName;
      }
      if (data.profilePicture !== undefined && data.profilePicture !== initialData?.profilePicture) {
        changedFields.profilePicture = data.profilePicture;
      }

      if (Object.keys(changedFields).length > 0) {
        await userService.updateProfile(changedFields);
        // Add a small delay before refreshing to ensure the update is complete
        setTimeout(() => {
          router.refresh();
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-[500px] h-auto p-6 flex flex-col gap-5 rounded-lg border-[0.75px] border-[#676773] bg-white max-sm:w-full">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-black font-geist text-3xl font-bold">
          Your Profile
        </h1>
        <p className="text-[#676773] font-inter text-base">
          Update your profile information and profile picture
        </p>
      </div>

      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center gap-4 py-4 border-b border-gray-200">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-[#EA580C]">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#EA580C] flex items-center justify-center text-white text-4xl">
                {initialData?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <label
            htmlFor="profile-picture"
            className="absolute bottom-0 right-0 bg-[#EA580C] text-white p-2 rounded-full cursor-pointer hover:bg-[#D45207] transition-colors shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <p className="text-sm text-gray-500">
          Click the edit button to change your profile picture
        </p>
      </div>

      {/* Profile Information */}
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="fullName" className="text-black font-geist text-sm font-bold">
            Full Name
          </label>
          <input
            id="fullName"
            {...register("fullName")}
            className="mt-1 h-[41px] w-full rounded-lg border-[0.75px] border-[#676773] bg-[#F8FAFC] px-3 text-[#222]"
            placeholder="Your full name"
          />
          {errors.fullName && (
            <span className="text-red-500 text-xs mt-1">{errors.fullName.message}</span>
          )}
        </div>

        <div>
          <label className="text-black font-geist text-sm font-bold">
            Email
          </label>
          <input
            type="email"
            value={initialData?.email || ""}
            disabled
            className="mt-1 h-[41px] w-full rounded-lg border-[0.75px] border-[#676773] bg-[#F1F1F1] px-3 text-[#666] cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-[41px] w-full rounded bg-[#EA580C] text-white font-geist text-base font-bold hover:bg-[#D45207] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg 
              className="animate-spin h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving changes...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
