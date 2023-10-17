

import React, { useState } from "react";
import axios from "axios";
import Papa from "papaparse"; // Import PapaParse for CSV parsing


const AddNew = ({ apiUrl, maxKeysObject, onDataUpdate, fetchData }) => {
const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  
  const handleAddClick = () => {
    setShowForm(true);
    setSuccessMessage(null);
    setShowSuccessMessage(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl, formData);
      console.log("Data posted successfully:", response.data);
      setSuccessMessage("Data posted successfully!");
      setFormData({});
      setShowForm(false);
      fetchData();
  
      if (onDataUpdate) {
        onDataUpdate();
      }
  
      setShowSuccessMessage(true);
  
      // Hide the success message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage(null); // Reset the success message
      }, 2000);
  
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const handleFileUpload = async (fileData) => {
    try {
      // Send the file data to the API endpoint
      const response = await axios.post(apiUrl, fileData);
      console.log("Data posted successfully:", response.data);
      setSuccessMessage("Data posted successfully!");
      setFormData({});
      setShowForm(false);
      fetchData();

      if (onDataUpdate) {
        onDataUpdate();
      }

      setShowSuccessMessage(true);
  
      // Hide the success message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage(null); // Reset the success message
      }, 4000);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const handleJsonImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parsedJsonData = JSON.parse(e.target.result);
        console.log(parsedJsonData);
        handleFileUpload(parsedJsonData);
      };
      reader.readAsText(file);
    }
  };

  
  

  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Parse the CSV data using PapaParse
        Papa.parse(e.target.result, {
          header: true, // Treat the first row as headers
          skipEmptyLines: true, // Skip empty lines
          complete: function (results) {
            // Handle the parsed CSV data
            const parsedCsvData = results.data;
            console.log(parsedCsvData);
            handleFileUpload(parsedCsvData);
          },
          error: function (error) {
            console.error("Error parsing CSV:", error.message);
          },
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <button className="button-add" onClick={handleAddClick}>
        Add New
      </button>

     

<div className="file-input-dropdown">
  <button className="file-input-button">Import</button>
  <div className="file-input-options">
    <label>
      <span>Select JSON File</span>
      <input type="file" accept=".json" onChange={handleJsonImport} />
    </label>
    <label>
      <span>Select CSV File</span>
      <input type="file" accept=".csv" onChange={handleCsvImport} />
    </label>
  </div>
</div>



      {showForm && (
        <div className="EditFormOverlay">
          <div className="EditForm">
            <div className="EditFormHeader">
              <h2>ADD NEW ITEM</h2>
            </div>
            <form className="EditFormFields" onSubmit={handleFormSubmit}>
              {Object.keys(maxKeysObject).map((field) => (
                <div className="FormField" key={field}>
                  <label htmlFor={field}>{field}</label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleFormChange}
                    readOnly={field === 'id'}
                  />
                </div>
              ))}
              <div className="ButtonGroup">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && <p className="success-message">{successMessage}</p>}
    </>
  );
};

export default AddNew;



