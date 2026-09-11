import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  MapPin,
  Edit3,
  Camera,
  Check,
  X,
  Loader2,
  Save,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const fileInputRef = useRef(null);

  const token = localStorage.getItem("ra_token");

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();

      setProfile(data);
      setEditData(data);
    } catch (error) {
      console.error("Profile loading error:", error);

      showMessage("Unable to load your profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================================================
  // MESSAGE
  // =========================================================

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = () => {
    setEditData({ ...profile });
    setIsEditing(true);
    setMessage("");
  };

  const handleCancel = () => {
    setEditData({ ...profile });
    setIsEditing(false);
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          name: editData.name,
          education: editData.education,
          experience: editData.experience,
          location: editData.location,
          degree: editData.degree,
          college: editData.college,
          graduation_year: editData.graduation_year,
        }),
      });

      if (!response.ok) {
        throw new Error("Profile update failed");
      }

      const updatedProfile = await response.json();

      setProfile(updatedProfile);
      setEditData(updatedProfile);
      setIsEditing(false);

      showMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      showMessage("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PROFILE PHOTO
  // =========================================================

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please select a valid image.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image must be less than 5MB.", "error");
      return;
    }

    try {
      setPhotoUploading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/profile/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Photo upload failed");
      }

      const data = await response.json();

      setProfile((prev) => ({
        ...prev,
        profile_photo_url: data.profile_photo_url,
      }));

      setEditData((prev) => ({
        ...prev,
        profile_photo_url: data.profile_photo_url,
      }));

      showMessage("Profile photo updated.");
    } catch (error) {
      console.error("Photo upload error:", error);

      showMessage("Failed to upload profile photo.", "error");
    } finally {
      setPhotoUploading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d24] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#111633] border border-[#263158] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>

          <p className="text-sm text-gray-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#080d24] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#111633] border border-[#1e2749] rounded-3xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
            <User className="w-7 h-7 text-indigo-400" />
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">
            Profile unavailable
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            We couldn't load your profile information.
          </p>

          <button
            onClick={fetchProfile}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // PHOTO
  // =========================================================

  const photoUrl = profile.profile_photo_url
  ? profile.profile_photo_url.startsWith("http")
    ? profile.profile_photo_url
    : `${API_BASE_URL}${profile.profile_photo_url}`
  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name || "User"
    )}&background=6366f1&color=fff&size=200`;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#080d24] px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-5xl mx-auto">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111633] border border-[#202b50] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />

              <span className="text-xs font-medium text-indigo-300">
                ACCOUNT SETTINGS
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Profile
            </h1>

            <p className="text-gray-500 mt-2 max-w-xl">
              Manage your personal details, education and learning preferences
              from one place.
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-600/10"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* =====================================================
            MESSAGE
        ===================================================== */}

        {message && (
          <div
            className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border ${
              messageType === "error"
                ? "border-red-500/20 bg-red-500/5 text-red-400"
                : "border-indigo-500/20 bg-indigo-500/5 text-indigo-300"
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />

            <span className="text-sm">
              {message}
            </span>
          </div>
        )}

        {/* =====================================================
            PROFILE HERO
        ===================================================== */}

        <div className="relative overflow-hidden bg-[#111633] border border-[#1e2749] rounded-3xl mb-6">

          {/* subtle background glow */}

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

          <div className="absolute top-0 left-0 right-0 h-px bg-indigo-500/30" />

          <div className="p-6 md:p-8">

            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {/* PROFILE IMAGE */}

              <div className="relative shrink-0">

                <div className="w-28 h-28 rounded-3xl p-1 bg-[#0b1028] border border-[#2a3560]">
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full rounded-[20px] object-cover"
                  />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute -right-2 -bottom-2 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-4 border-[#111633] flex items-center justify-center text-white transition disabled:opacity-60"
                >
                  {photoUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* USER DETAILS */}

              <div className="flex-1 min-w-0">

                <div className="flex flex-wrap items-center gap-3 mb-2">

                  <h2 className="text-2xl md:text-3xl font-bold text-white truncate">
                    {profile.name || "User"}
                  </h2>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">
                    {profile.email}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">

                  <ProfileBadge
                    icon={<Briefcase />}
                    text={profile.experience || "Experience not specified"}
                  />

                  <ProfileBadge
                    icon={<MapPin />}
                    text={profile.location || "Location not specified"}
                  />

                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-6">
              JPG, PNG or WEBP · Maximum 5MB
            </p>
          </div>
        </div>

        {/* =====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <SectionCard
          icon={<User />}
          title="Personal Information"
          description="Your basic account information"
        >
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <InputField
                label="Full Name"
                name="name"
                value={editData.name || ""}
                onChange={handleChange}
              />

              <InputField
                label="Email"
                name="email"
                value={editData.email || ""}
                disabled
              />

              <InputField
                label="Experience"
                name="experience"
                value={editData.experience || ""}
                onChange={handleChange}
              />

              <InputField
                label="Location"
                name="location"
                value={editData.location || ""}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">

              <InfoItem
                icon={<User />}
                label="Full Name"
                value={profile.name}
              />

              <InfoItem
                icon={<Mail />}
                label="Email Address"
                value={profile.email}
              />

              <InfoItem
                icon={<Briefcase />}
                label="Experience"
                value={profile.experience || "Not specified"}
              />

              <InfoItem
                icon={<MapPin />}
                label="Location"
                value={profile.location || "Not specified"}
              />
            </div>
          )}
        </SectionCard>

        {/* =====================================================
            EDUCATION
        ===================================================== */}

        <SectionCard
          icon={<GraduationCap />}
          title="Education"
          description="Your academic background"
        >
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <InputField
                label="Degree"
                name="degree"
                value={editData.degree || ""}
                onChange={handleChange}
              />

              <InputField
                label="Specialization"
                name="education"
                value={editData.education || ""}
                onChange={handleChange}
              />

              <InputField
                label="College"
                name="college"
                value={editData.college || ""}
                onChange={handleChange}
              />

              <InputField
                label="Graduation Year"
                name="graduation_year"
                value={editData.graduation_year || ""}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">

              <InfoItem
                icon={<GraduationCap />}
                label="Degree"
                value={profile.degree || "Not specified"}
              />

              <InfoItem
                icon={<BookOpen />}
                label="Specialization"
                value={profile.education || "Not specified"}
              />

              <InfoItem
                icon={<Briefcase />}
                label="College"
                value={profile.college || "Not specified"}
              />

              <InfoItem
                icon={<Check />}
                label="Graduation Year"
                value={profile.graduation_year || "Not specified"}
              />
            </div>
          )}
        </SectionCard>

        {/* =====================================================
            SAVE / CANCEL
        ===================================================== */}

        {isEditing && (
          <div className="bg-[#111633] border border-[#1e2749] rounded-3xl p-4 mb-6">

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">

              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-3 rounded-xl border border-[#2a3560] text-gray-300 hover:bg-white/[0.03] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            LEARNING PREFERENCES
        ===================================================== */}

        <SectionCard
          icon={<BookOpen />}
          title="Learning Preferences"
          description="Personalize your learning experience"
        >
          <div className="space-y-3">

            <Preference
              title="Video content"
              description="Learn through tutorials and video lessons"
              defaultChecked
            />

            <Preference
              title="Interactive exercises"
              description="Practice through hands-on exercises"
              defaultChecked
            />

            <Preference
              title="Reading materials"
              description="Prefer documentation and written resources"
            />
          </div>
        </SectionCard>

        {/* =====================================================
            FOOTER NOTE
        ===================================================== */}

        <div className="pb-8 pt-2 text-center">
          <p className="text-xs text-gray-600">
            Your profile information helps personalize your career journey.
          </p>
        </div>

      </div>
    </div>
  );
};

// =============================================================
// SECTION CARD
// =============================================================

const SectionCard = ({ icon, title, description, children }) => {
  return (
    <div className="bg-[#111633] border border-[#1e2749] rounded-3xl p-6 md:p-8 mb-6">

      <div className="flex items-start gap-4 mb-7">

        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          {React.cloneElement(icon, {
            className: "w-5 h-5",
          })}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
};

// =============================================================
// INPUT
// =============================================================

const InputField = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          w-full
          px-4 py-3
          rounded-xl
          bg-[#0b1028]
          border border-[#263158]
          text-white
          placeholder-gray-600
          outline-none
          focus:border-indigo-500
          focus:ring-2
          focus:ring-indigo-500/10
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      />
    </div>
  );
};

// =============================================================
// INFO ITEM
// =============================================================

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-4">

      <div className="w-10 h-10 rounded-xl bg-[#0b1028] border border-[#202b50] flex items-center justify-center text-indigo-400 shrink-0">
        {React.cloneElement(icon, {
          className: "w-4 h-4",
        })}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-1.5">
          {label}
        </p>

        <p className="text-sm md:text-base text-white font-medium break-words">
          {value}
        </p>
      </div>
    </div>
  );
};

// =============================================================
// PROFILE BADGE
// =============================================================

const ProfileBadge = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0b1028] border border-[#202b50]">
      {React.cloneElement(icon, {
        className: "w-3.5 h-3.5 text-indigo-400",
      })}

      <span className="text-xs text-gray-400">
        {text}
      </span>
    </div>
  );
};

// =============================================================
// PREFERENCE
// =============================================================

const Preference = ({
  title,
  description,
  defaultChecked = false,
}) => {
  return (
    <label className="flex items-center justify-between gap-5 p-4 rounded-2xl bg-[#0b1028] border border-[#202b50] hover:border-[#303c6b] transition cursor-pointer">

      <div className="min-w-0">

        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="text-xs md:text-sm text-gray-600 mt-1">
          {description}
        </p>

      </div>

      <div className="relative shrink-0">

        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />

        <div className="w-11 h-6 rounded-full bg-[#263158] peer-checked:bg-indigo-600 transition" />

        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-gray-400 peer-checked:bg-white peer-checked:translate-x-5 transition" />
      </div>

    </label>
  );
};

export default Profile;