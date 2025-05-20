import "../styles/staffdetailpage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTimes, FaPaperPlane } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import React from "react";

const AddNewNonInstitutionalActivity = () => {
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Generic Constants
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const { mcr_number } = useParams();
  const [isActivityFormOpen, setActivityFormOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [dateType, setDateType] = useState("academic_year");

  // useState to hold new activity details
  const [newActivity, setNewActivity] = useState({
    mcr_number: mcr_number,
    teaching_categories: "",
    role: "",
    activity_type: "",
    medium: "",
    host_country: "",
    honorarium: "",
    academic_year: "",
    academic_semester: "",
    training_hours: "", // Add this field
  });

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

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Options for each dropdown
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const teachingCategoriesOptions = [
    "Postgraduate Teaching",
    "Undergraduate Teaching",
    "Other Teaching",
    "Publication/ Research",
    "Non-Education",
  ];

  const roleOptions = [
    "Lecturer/ Instructor",
    "Speaker/ Presenter",
    "Examiner",
    "Mentor/ Proctor",
    "Author",
    "Reviewer",
    "Attendee/ Participant",
    "Others",
  ];

  const activityTypeOptions = [
    "Course/ Lecture/ Workshop",
    "Conference/ Seminar/ Symposium",
    "Journal Club/ Orientation/ Department Meeting/ Group Discussion",
    "Interview (Publicity/ Public Awareness)",
    "Award",
    "Appointment",
    "Promotion",
    "Publication",
    "Research",
    "Others",
  ];

  const mediumOptions = ["In-Person", "Virtual", "Pre-recorded"];

  const hostCountryOptions = ["Singapore", "Overseas"];

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function to handle input changes
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewActivity({
      ...newActivity,
      [name]: value,
    });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function to handle form submission
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleNewActivitySubmit = async () => {
    if (
      !newActivity.teaching_categories ||
      !newActivity.role ||
      !newActivity.activity_type ||
      !newActivity.medium ||
      !newActivity.host_country ||
      !newActivity.honorarium ||
      (dateType === "academic_year" && !newActivity.academic_year) ||
      (dateType === "academic_semester" && !newActivity.academic_semester) ||

      !newActivity.training_hours
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3001/non_institutional`,
        newActivity,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        toast.success("New non-institutional activity added successfully!");
        setNewActivity({
          mcr_number: mcr_number,
          teaching_categories: "",
          role: "",
          activity_type: "",
          medium: "",
          host_country: "",
          honorarium: "",
          academic_year: "",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error adding new activity:", error);
      toast.error("Failed to add activity");
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function to handle confirmation of submitting new contract
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleSubmitConfirmation = () => {
    if (
      !newActivity.academic_year ||
      !newActivity.teaching_categories ||
      !newActivity.role ||
      !newActivity.activity_type ||
      !newActivity.medium ||
      !newActivity.host_country ||
      !newActivity.honorarium ||
      !newActivity.training_hours
    ) {
      toast.error("Please fill all activity fields before submitting");
      return;
    }

    confirmAlert({
      title: "Confirm Submission",
      message: (
        <div>
          ⚠️Are you sure you want to submit this new activity?⚠️
          <br />
        </div>
      ),
      buttons: [
        {
          label: "Yes",
          onClick: handleNewActivitySubmit,
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Render
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div>
      <ToastContainer />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="toggle-add-contract-button"
        onClick={() => setActivityFormOpen((prev) => !prev)}
      >
        {isActivityFormOpen ? <FaTimes /> : <FaPlus />}
        {isActivityFormOpen ? "Close" : "Add New Non-Institutional Activity"}
      </motion.button>
      {isActivityFormOpen && (
        <div>
          <div className="contract-input-container">
            {" "}
            <div className="input-group">
              <label>
                <select
                value={dateType}
                onChange={(e) => {
                  setDateType(e.target.value);
                  setNewActivity({
                    ...newActivity,
                    academic_year: "",
                    academic_semester: "",
                  });
                }}
                style={{ fontWeight: "bold" }}
                >
                  <option value="academic_year">Academic Year</option>
                  <option value="academic_semester">Academic Semester</option>
                  </select>
                  :
                  </label>

  {dateType === "academic_year" ? (
    <select
      name="academic_year"
      value={newActivity.academic_year}
      onChange={handleInputChange}
    >
      <option value="">Select Academic Year</option>
      {Array.from({ length: 5 }, (_, index) => 2020 + index).map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  ) : (
    <input
      type="text"
      name="academic_semester"
      value={newActivity.academic_semester || ""}
      onChange={handleInputChange}
      placeholder="e.g. AY23/24 Sem 1"
    />
  )}
</div>
            <div className="input-group">
              <label>Teaching Categories:</label>
              <select
                name="teaching_categories"
                value={newActivity.teaching_categories}
                onChange={handleInputChange}
              >
                <option value="">Select Teaching Category</option>
                {teachingCategoriesOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Role:</label>
              <select
                name="role"
                value={newActivity.role}
                onChange={handleInputChange}
              >
                <option value="">Select Role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Activity Type:</label>
              <select
                name="activity_type"
                value={newActivity.activity_type}
                onChange={handleInputChange}
              >
                <option value="">Select Activity Type</option>
                {activityTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Medium:</label>
              <select
                name="medium"
                value={newActivity.medium}
                onChange={handleInputChange}
              >
                <option value="">Select Medium</option>
                {mediumOptions.map((medium) => (
                  <option key={medium} value={medium}>
                    {medium}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Host Country:</label>
              <select
                name="host_country"
                value={newActivity.host_country}
                onChange={handleInputChange}
              >
                <option value="">Select Host Country</option>
                {hostCountryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Honorarium:</label>
              <input
                type="number"
                name="honorarium"
                value={newActivity.honorarium}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label>Training Hours:</label>
              <input
                type="number"
                name="training_hours"
                value={newActivity.training_hours || ""}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={
                userRole === "hr"
                  ? handleRestrictedAction
                  : handleSubmitConfirmation
              }
              className="add-contract-button"
            >
              <FaPaperPlane /> Submit
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewNonInstitutionalActivity;
