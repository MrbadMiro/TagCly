import React, { useState } from "react";
import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation } from "../../../redux/api/usersApiSlice";
import { useSelector } from "react-redux";
import { PencilLine, Trash, Check, X } from "lucide-react";
import { toast } from "react-toastify";

function AllUsers() {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: users, isLoading, isError, error, refetch } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // State for editable fields
  const [editableUserId, setEditableUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({
    username: "",
    email: "",
    role: "",
    profile: {
      firstName: "",
      lastName: ""
    }
  });

  // Check user roles
  const isAdmin = userInfo && userInfo.isAdmin;
  const hasViewAccess = isAdmin;
  const hasDeleteAccess = isAdmin;

  // Only allow Admins to access this page
  if (!hasViewAccess) {
    return <div>You do not have permission to access this page.</div>;
  }

  // Handle delete user
  const handleDelete = async (userId) => {
    if (!hasDeleteAccess) {
      toast.error("Only administrators can delete users.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap();
        toast.success("User deleted successfully!");
        refetch();
      } catch (err) {
        console.error("Failed to delete user:", err);
        const errorMessage = err.data?.message || err.error || "Unknown error occurred";
        toast.error(`Failed to delete user: ${errorMessage}`);
      }
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    const firstName = user.profile?.firstName || "";
    const lastName = user.profile?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || user.username;
    
    setEditableUserId(user._id);
    setEditedUser({
      username: user.username,
      email: user.email,
      role: user.role || "user",
      isAdmin: user.isAdmin,
      profile: {
        firstName,
        lastName
      },
      fullName
    });
  };

  // Handle save edited user
  const handleSave = async (userId) => {
    try {
      if (editedUser.fullName) {
        const nameParts = editedUser.fullName.split(" ");
        editedUser.profile = {
          ...editedUser.profile,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || ""
        };
      }
      
      editedUser.isAdmin = editedUser.role === "admin";
      
      await updateUser({ userId, ...editedUser }).unwrap();
      toast.success("User updated successfully!");
      setEditableUserId(null);
      refetch();
    } catch (err) {
      console.error("Failed to update user:", err);
      const errorMessage = err.data?.message || err.error || "Unknown error occurred";
      toast.error(`Failed to update user: ${errorMessage}`);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditableUserId(null);
  };

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="relative h-[500px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Username</th>
                <th className="table-head">Full Name</th>
                <th className="table-head">Email</th>
                <th className="table-head">Role</th>
                <th className="table-head">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {users?.map((user, index) => {
                const firstName = user.profile?.firstName || "";
                const lastName = user.profile?.lastName || "";
                const fullName = `${firstName} ${lastName}`.trim() || user.username;
                
                return (
                  <tr key={user._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">
                      {editableUserId === user._id ? (
                        <input
                          type="text"
                          value={editedUser.username}
                          onChange={(e) =>
                            setEditedUser({ ...editedUser, username: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        <div className="flex w-max gap-x-4">
                          <div className="size-14 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-lg font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <p>{user.username}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {editableUserId === user._id ? (
                        <input
                          type="text"
                          value={editedUser.fullName}
                          onChange={(e) =>
                            setEditedUser({ ...editedUser, fullName: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        fullName
                      )}
                    </td>
                    <td className="table-cell">
                      {editableUserId === user._id ? (
                        <span>{editedUser.email}</span>
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="table-cell">
                      {editableUserId === user._id ? (
                        <select
                          value={editedUser.role}
                          onChange={(e) =>
                            setEditedUser({ 
                              ...editedUser, 
                              role: e.target.value,
                              isAdmin: e.target.value === "admin"
                            })
                          }
                          className="w-full p-2 border rounded"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-4">
                        {editableUserId === user._id ? (
                          <>
                            <button
                              onClick={() => handleSave(user._id)}
                              className="text-green-500"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-500"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-500 dark:text-blue-600"
                            >
                              <PencilLine size={20} />
                            </button>
                            {hasDeleteAccess ? (
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="text-red-500"
                                disabled={user._id === userInfo._id}
                                title={user._id === userInfo._id ? "Cannot delete yourself" : ""}
                              >
                                <Trash size={20} className={user._id === userInfo._id ? "opacity-40" : ""} />
                              </button>
                            ) : (
                              <span title="Only administrators can delete users" className="text-gray-400 cursor-not-allowed">
                                <Trash size={20} />
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AllUsers;