import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetUserDetailsQuery, useUpdateUserMutation } from "../../../redux/api/usersApiSlice";
import { PencilLine, Check, X, User, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import { setCredentials } from "../../../redux/features/auth/authSlice";

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: user, isLoading, refetch } = useGetUserDetailsQuery(userInfo?._id);
  const [updateUser] = useUpdateUserMutation();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    address: "",
  });

  // Image handling
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize editedUser state when user data is loaded
  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });

      // Ensure the latest image is shown with cache invalidation
      if (user.image) {
        setImagePreview(`${user.image}?t=${Date.now()}`);
      }
    }
  }, [user]);

  // Handle image selection
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle save
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("username", editedUser.username);
      formData.append("email", editedUser.email);
      formData.append("fullName", editedUser.fullName);
      formData.append("phone", editedUser.phone);
      formData.append("address", editedUser.address);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await updateUser(formData).unwrap();
      console.log("Update response:", response);

      if (response) {
        if (response.image) {
          response.image = `${response.image}?t=${Date.now()}`;
        }

        const updatedUserInfo = {
          ...userInfo,
          ...response.user, // Ensure Redux store gets the updated user info
        };

        dispatch(setCredentials(updatedUserInfo)); // Update Redux store
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        refetch();
      } else {
        toast.error("Server response missing required data");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err.data?.message || "Failed to update profile.");
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current user data
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });

      // Reset image preview
      setSelectedImage(null);
      if (user.image) {
        setImagePreview(`${user.image}?t=${Date.now()}`);
      } else {
        setImagePreview(null);
      }
    }
  };

  // Toggle optional details section
  const toggleOptionalDetails = () => {
    setShowOptionalDetails(!showOptionalDetails);
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Show error if user data is not found
  if (!user) {
    return <div className="flex justify-center items-center h-64">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6 bg-blue-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 dark:text-blue-400 flex items-center gap-2"
              >
                <PencilLine size={18} />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-6 mb-6">
            {/* Profile image section */}
            <div className="flex-shrink-0 size-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={user.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User size={40} className="text-gray-500 dark:text-gray-400" />
              )}

              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <PencilLine size={20} className="text-white" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>
            {/* Confirmation of image selection */}
            {isEditing && selectedImage && (
              <p className="text-green-500 text-sm mt-1">New image selected</p>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {user.fullName || user.username}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              {user.phone && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedUser.email}
                      disabled
                      className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editedUser.fullName}
                      onChange={(e) => setEditedUser({ ...editedUser, fullName: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={toggleOptionalDetails}
                    className="flex items-center text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {showOptionalDetails ? (
                      <>
                        <ChevronUp size={16} className="mr-1" />
                        Hide Optional Details
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-1" />
                        Show Optional Details
                      </>
                    )}
                  </button>

                  {showOptionalDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={editedUser.phone}
                          onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={editedUser.address}
                          onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <X size={16} />
                      <span>Cancel</span>
                    </div>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 border border-blue-600 rounded-lg text-white hover:bg-blue-700"
                  >
                    <div className="flex items-center gap-2">
                      <Check size={16} />
                      <span>Save Changes</span>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{user.username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{user.fullName || "Not provided"}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={toggleOptionalDetails}
                    className="flex items-center text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {showOptionalDetails ? (
                      <>
                        <ChevronUp size={16} className="mr-1" />
                        Hide Optional Details
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-1" />
                        Show Optional Details
                      </>
                    )}
                  </button>

                  {showOptionalDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</h4>
                        <p className="mt-1 text-gray-900 dark:text-white">{user.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h4>
                        <p className="mt-1 text-gray-900 dark:text-white">{user.address || "Not provided"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;