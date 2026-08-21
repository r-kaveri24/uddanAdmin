"use client";

import React, { useState } from "react";
import { Edit2, ArrowLeft, Camera, User } from "lucide-react";

interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    bio: string;
    country: string;
    cityState: string;
    pinCode: string;
    role: string;
    avatarUrl: string;
}

export default function ProfileContent() {
    const [isEditing, setIsEditing] = useState(false);


    // Active saved profile state
    const [profile, setProfile] = useState<ProfileData>({
        firstName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        bio: "",
        country: "",
        cityState: "",
        pinCode: "",
        role: "Admin",
        avatarUrl:
            "",
    });

    // Working state for active form inputs
    const [formData, setFormData] = useState<ProfileData>(profile);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle File Upload Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newImageUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, avatarUrl: newImageUrl }));
        }
    };

    const handleEditClick = () => {
        setFormData(profile);
        setIsEditing(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfile(formData); // Applies typed changes to live display state
        setIsEditing(false); // Returns to profile view
    };

    return (
        <div className="w-full max-w-4xl bg-[#FDF8FC] min-h-[600px] p-6 md:p-8 rounded-2xl border border-pink-100/50">
            {/* HEADER SECTION */}
            <div className="mb-6 flex items-center gap-3">
                {isEditing ? (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="p-1 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                    </div>
                ) : (
                    <h2 className="text-2xl font-bold text-[#E02424] drop-shadow-xs">
                        Profile
                    </h2>
                )}
            </div>

            <div className="flex flex-col gap-5">
                {/* TOP AVATAR CARD */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            {/* SHOW IMAGE IF AVAILABLE, ELSE SHOW DEFAULT USER ICON */}
                            {(isEditing ? formData.avatarUrl : profile.avatarUrl) ? (
                                <img
                                    src={isEditing ? formData.avatarUrl : profile.avatarUrl}
                                    alt="Profile Avatar"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-purple-50 border-2 border-gray-100 flex items-center justify-center shadow-sm text-[#6B46C1]">
                                    <User className="w-10 h-10 stroke-[1.5]" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {profile.firstName || profile.lastName
                                    ? `${profile.firstName} ${profile.lastName}`.trim()
                                    : "User Name"}
                            </h3>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                {profile.role}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {profile.cityState ? profile.cityState : "Location"}
                            </p>

                            {isEditing && (
                                <div className="mt-3">
                                    {/* NATIVE FILE INPUT LINKED DIRECTLY VIA LABEL */}
                                    <label
                                        htmlFor="profile-upload-input"
                                        className="inline-flex items-center gap-1.5 bg-[#6B46C1] hover:bg-[#5a39a7] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer select-none"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        <span>Upload Image</span>
                                    </label>

                                    <input
                                        id="profile-upload-input"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {!isEditing && (
                        <button
                            type="button"
                            onClick={handleEditClick}
                            className="self-start sm:self-auto border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                        </button>
                    )}
                </div>

                {/* EDIT FORM CONTAINER */}
                {isEditing ? (
                    <form onSubmit={handleSave} className="flex flex-col gap-5">
                        {/* PERSONAL INFORMATION CARD */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">
                                Personal Information
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        Mobile No
                                    </label>
                                    <input
                                        type="text"
                                        name="mobileNo"
                                        placeholder="Enter mobile number"
                                        value={formData.mobileNo}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        Bio
                                    </label>
                                    <input
                                        type="text"
                                        name="bio"
                                        placeholder="Enter bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ADDRESS CARD */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">Address</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        placeholder="Enter country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        City/State
                                    </label>
                                    <input
                                        type="text"
                                        name="cityState"
                                        placeholder="Enter city/state"
                                        value={formData.cityState}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        Pin Code
                                    </label>
                                    <input
                                        type="text"
                                        name="pinCode"
                                        placeholder="Enter pin code"
                                        value={formData.pinCode}
                                        onChange={handleChange}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B46C1] text-gray-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SAVE BUTTON */}
                        <div>
                            <button
                                type="submit"
                                className="bg-[#6B46C1] hover:bg-[#5a39a7] text-white font-semibold text-xs px-8 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                ) : (
                    /* DISPLAY MODE CONTAINER */
                    <>
                        {/* PERSONAL INFORMATION VIEW */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">
                                Personal Information
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                                <div>
                                    <span className="text-gray-400 block font-medium">
                                        First Name
                                    </span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.firstName || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400 block font-medium">
                                        Last Name
                                    </span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.lastName || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400 block font-medium">Email</span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.email || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400 block font-medium">
                                        Mobile No
                                    </span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.mobileNo || "-"}
                                    </span>
                                </div>

                                <div className="sm:col-span-2">
                                    <span className="text-gray-400 block font-medium">Bio</span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.bio || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ADDRESS VIEW */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">Address</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                                <div>
                                    <span className="text-gray-400 block font-medium">
                                        Country
                                    </span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.country || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400 block font-medium">
                                        City/State
                                    </span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.cityState || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400 block font-medium">
                                        Pin Code
                                    </span>
                                    <span className="font-semibold text-gray-800 mt-0.5 block">
                                        {profile.pinCode || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}