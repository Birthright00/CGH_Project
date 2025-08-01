import "../styles/staffdetailpage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert"; // Import the confirmation alert library
import "react-confirm-alert/src/react-confirm-alert.css";
import API_BASE_URL from '../apiConfig';
import React from "react";

const StaffDetails = () => {
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Generic Constants
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const { mcr_number } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedYears, setSelectedYears] = useState([]);
  const [postings, setPostings] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [editHistory, setEditHistory] = useState([]); // Add a state to store the edit history

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day} @ ${hours}${minutes}H`;
  };

  // useState to hold new staff details
  const [staffDetails, setStaffDetails] = useState({
    mcr_number: "",
    first_name: "",
    last_name: "",
    department: "",
    designation: "",
    fte: "",
    email: "",
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // State and Functions for Edit History
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false);

  const toggleEditHistory = () => {
    setIsEditHistoryOpen(!isEditHistoryOpen);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // HR Read-only mode check - Fetch user role from token on initial load
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { role } = JSON.parse(atob(token.split(".")[1])); // Decode JWT to get role
      setUserRole(role);
    }
  }, []);
  const handleRestrictedAction = () => {
    toast.error("Access Denied: Please contact management to make changes.");
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Fetch staff details
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/staff/${mcr_number}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data;

        setStaffDetails(data);

        // Check if update_history is already an array or needs to be parsed
        if (typeof data.update_history === "string") {
          console.log("Parsing update_history as JSON...");
          const parsedHistory = JSON.parse(data.update_history);
          setEditHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
        } else if (Array.isArray(data.update_history)) {
          setEditHistory(data.update_history);
        } else {
          console.warn(
            "Unexpected format for update_history:",
            data.update_history
          );
          setEditHistory([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching staff details:", error);
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [mcr_number]);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function to handle form submission
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        return;
      }

      const dataToSubmit = {
        ...staffDetails,
      };

      await axios.put(
        `${API_BASE_URL}/staff/${mcr_number}`,
        dataToSubmit,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Staff details updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(
        "Error updating staff details:",
        error.response ? error.response.data : error
      );
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
        navigate("/login"); // Redirect to login page
      } else {
        toast.error("Failed to update staff details");
      }
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function to handle Delete Staff with confirmation
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleDelete = () => {
    confirmAlert({
      title: "❗Confirm Deletion❗",
      message: (
        <div>
          <p>Are you sure you want to delete this staff?</p>
          <p
            style={{ fontWeight: "bold", color: "#ca4700", marginTop: "10px" }}
          ></p>
        </div>
      ),
      buttons: [
        {
          label: "Yes, Delete it!",
          onClick: async () => {
            try {
              const token = localStorage.getItem("token");
              await axios.delete(`${API_BASE_URL}/staff/${mcr_number}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              toast.success("Staff details deleted successfully!");
              setTimeout(() => {
                navigate("/management-home");
              }, 1000);
            } catch (error) {
              console.error(
                "Error deleting staff details:",
                error.response ? error.response.data : error
              );
              toast.error("Failed to delete staff details");
            }
          },
          style: {
            backgroundColor: "#ca4700", // Red background
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            margin: "0 10px",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
          style: {
            backgroundColor: "#cccccc", // Light grey background
            color: "black",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            margin: "0 10px",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }, // Grey button styling
        },
      ],
    });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function to Restore Staff Details with Confirmation
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleRestore = () => {
    confirmAlert({
      title: "Confirm Restoration",
      message: `Are you sure you want to restore this staff?`,
      buttons: [
        {
          label: "Yes, Restore it!",
          onClick: async () => {
            try {
              const token = localStorage.getItem("token");
              await axios.put(
                `${API_BASE_URL}/restore/${mcr_number}`,
                {},
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              toast.success("Staff details restored successfully!");
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } catch (error) {
              console.error("Error restoring staff details:", error);
              toast.error("Failed to restore staff details");
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
  };
  const filteredPostings =
    selectedYears.length > 0
      ? postings.filter((posting) =>
          selectedYears.includes(posting.academic_year.toString())
        )
      : [];

  // Remove any early return statements that would prevent the useEffect hook from executing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!staffDetails) {
    return <div>No staff data found</div>;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Render
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <>
      <ToastContainer />
      <motion.div
        className="staff-info-container"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>General Details {staffDetails.deleted === 1 ? "(Deleted)" : ""}</h2>
        <table className="staff-detail-table">
          <tbody>
            <tr>
              <th>MCR Number</th>
              <td>
                <input
                  type="text"
                  name="mcr_number"
                  value={staffDetails.mcr_number}
                  onChange={handleInputChange}
                  disabled
                  className="staff-detail-input"
                />
              </td>
            </tr>
            <tr>
              <th>First Name</th>
              <td>
                <input
                  type="text"
                  name="first_name"
                  value={staffDetails.first_name}
                  onChange={handleInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>
                <input
                  type="text"
                  name="last_name"
                  value={staffDetails.last_name}
                  onChange={handleInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>Department</th>
              <td>
                <input
                  type="text"
                  name="department"
                  value={staffDetails.department}
                  onChange={handleInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>Designation</th>
              <td>
                <input
                  type="text"
                  name="designation"
                  value={staffDetails.designation}
                  onChange={handleInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>Email Address</th>
              <td>
                <input
                  type="email"
                  name="email"
                  value={staffDetails.email}
                  onChange={handleInputChange}
                />
              </td>
            </tr>
          </tbody>
        </table>{" "}
        {/* Update Details Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="update-button"
          onClick={userRole === "hr" ? handleRestrictedAction : handleSubmit}
        >
          <FaEdit /> Update Details
        </motion.button>
        {/* Edit History Section */}
        <button onClick={toggleEditHistory} className="view-edit-button">
          {isEditHistoryOpen ? "Hide Edit History" : "View Edit History"}
        </button>
        {isEditHistoryOpen && (
          <div className="view-edit-container">
            <h2>Edit History</h2>
            <table className="posting-detail-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Updated By</th>
                  <th>Updated At</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(editHistory) && editHistory.length > 0 ? (
                  editHistory.map((entry, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{entry.updated_by || "N/A"}</td>
                      <td>{new Date(entry.updated_at).toLocaleString()}</td>
                      <td>
                        {entry.details
                          ? Object.entries(entry.details).map(
                              ([key, value]) => (
                                <div key={key}>
                                  <strong>{key}:</strong> {value}
                                </div>
                              )
                            )
                          : "No details available"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No edit history found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {staffDetails.deleted === 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="restore-button"
            onClick={handleRestore}
          >
            Restore
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="delete-button"
            onClick={userRole === "hr" ? handleRestrictedAction : handleDelete}
          >
            <FaTrash /> Delete This Staff
          </motion.button>
        )}
      </motion.div>
    </>
  );
};

export default StaffDetails;
