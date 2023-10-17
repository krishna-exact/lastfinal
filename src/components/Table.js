

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaFilter } from "react-icons/fa";
import EditForm from "./EditForm";
import AddNew from "./AddNew";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ExcelJS from "exceljs";
import Papa from "papaparse";

const Table = ({ headers, apiUrl, maxKeysObject, onDataUpdate }) => {
  const [data, setData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [numberOfRows, setNumberOfRows] = useState(0);
  const [refreshTable, setRefreshTable] = useState(false);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const [sortedData, setSortedData] = useState([]);
  const [isDataReversed, setIsDataReversed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [individualColumnFiltering, setIndividualColumnFiltering] =
    useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [columnSearchQueries, setColumnSearchQueries] = useState({});

  const [showSearchBoxes, setShowSearchBoxes] = useState(false);

  const [showExportOptions, setShowExportOptions] = useState(false);

  const [showColumnCheckboxes, setShowColumnCheckboxes] = useState(false);

  const [columnCheckboxes, setColumnCheckboxes] = useState(false);

  const [appearColumnCheckboxes, setappearColumnCheckboxes] = useState(false);

  const [selectedColumns, setSelectedColumns] = useState([...headers]);

  const [selectedExportOption, setSelectedExportOption] = useState(null);

  const [selectAllChecked, setSelectAllChecked] = useState(true);


  const highlightText = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, 'gi');
    return text.replace(regex, '<span class="highlighted">$1</span>');
  };

  

  const handleRefresh = () => {
    // Call fetchData to reload the original data
    // fetchData();

    // Optionally, reset other state variables as needed
    setColumnSearchQueries("");
    setSearchQuery(""); // Clear search query
    setCurrentPage(1); // Reset to the first page
    setSortColumn(null); // Clear sorting
    setSortOrder("asc");
    setSelectedColumns([...headers]); // Reset selected columns
    setSelectedExportOption(null); // Reset export option
    setappearColumnCheckboxes(false); // Hide column checkboxes
    setSelectAllChecked(true); // Reset select all checkbox
    setIndividualColumnFiltering(false);
    setShowColumnCheckboxes(false);
    setIsDataReversed(false);

  };

  const toggleAllColumnCheckboxes = () => {
    if (showColumnCheckboxes) {
      setSelectedColumns([]);
    }
    setShowColumnCheckboxes(!showColumnCheckboxes);
  };

  const toggleIndividualColumnFiltering = () => {
    setIndividualColumnFiltering(!individualColumnFiltering);
  };

  const toggleSelectAll = () => {
    if (selectedColumns.length === headers.length) {
      setSelectedColumns([]);
      setSelectAllChecked(false);
    } else {
      setSelectedColumns([...headers]);
      setSelectAllChecked(true);
    }
  };

  const exportSortedSelectedFilteredData = () => {
    if (selectedExportOption === "json") {
      // Export as JSON
      const dataToExport = filteredAndSortedData.map((item) => {
        const exportedItem = {};
        for (const header of selectedColumns) {
          if (item.hasOwnProperty(header)) {
            exportedItem[header] = item[header];
          }
        }
        return exportedItem;
      });
      const jsonBlob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(jsonBlob);
      downloadLink.download = "table-data.json";
      downloadLink.click();
    } else if (selectedExportOption === "csv") {
      // Export as CSV
      const dataToExport = filteredAndSortedData.map((item) => {
        const exportedItem = {};
        for (const header of selectedColumns) {
          if (item.hasOwnProperty(header)) {
            exportedItem[header] = item[header];
          }
        }
        return exportedItem;
      });
      const csvData = Papa.unparse(dataToExport);
      const csvBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(csvBlob);
      downloadLink.download = "table-data.csv";
      downloadLink.click();
    }
  };

  const toggleSelectAllColumns = () => {
    if (selectedColumns.length === headers.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns([...headers]);
    }
  };

  const toggleColumnCheckbox = (header) => {
    const updatedSelectedColumns = selectedColumns.includes(header)
      ? selectedColumns.filter((col) => col !== header)
      : [...selectedColumns, header];
    setSelectedColumns(updatedSelectedColumns);
  };

  const toggleExportOptions = () => {
    setShowExportOptions(!showExportOptions);
  };

  const toggleSearchBoxes = () => {
    setShowSearchBoxes(!showSearchBoxes);
  };

  const toggleColumnCheckboxes = () => {
    setShowColumnCheckboxes(!showColumnCheckboxes);
  };

  const appearCheckBoxes = () => {
    setShowColumnCheckboxes(!showColumnCheckboxes);
  };

  const handleColumnSearchChange = (column, value) => {
    setColumnSearchQueries({
      ...columnSearchQueries,
      [column]: value,
    });
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(apiUrl);
      setNumberOfRows(response.data.length);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const sortData = (unsortedData) => {
    let sortedDataCopy = [...unsortedData];

    if (sortColumn) {
      sortedDataCopy.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        const numAValue = parseFloat(aValue);
        const numBValue = parseFloat(bValue);

        if (!isNaN(numAValue) && !isNaN(numBValue)) {
          if (numAValue < numBValue) {
            return sortOrder === "asc" ? -1 : 1;
          }
          if (numAValue > numBValue) {
            return sortOrder === "asc" ? 1 : -1;
          }
          return 0;
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          if (aValue < bValue) {
            return sortOrder === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortOrder === "asc" ? 1 : -1;
          }
          return 0;
        } else if (typeof aValue !== "string") {
          return sortOrder === "asc" ? 1 : -1;
        } else {
          return sortOrder === "asc" ? -1 : 1;
        }
      });
    }

    if (isDataReversed) {
      sortedDataCopy = sortedDataCopy.reverse();
    }

    return sortedDataCopy;
  };

  useEffect(() => {
    const sortedAndSlicedData = sortData(data).slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
    setSortedData(sortedAndSlicedData);
  }, [data, sortColumn, sortOrder, isDataReversed, currentPage, rowsPerPage]);

  const handleSaveEdit = async (editedData) => {
    setEditingIndex(null);

    if (onDataUpdate) {
      onDataUpdate();
    }
    setRefreshTable(true);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);

    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to the first page when changing rows per page
  };

  // const handleDelete = (obj) => {
  //   setDeletingItem(obj);
  //   setShowDeleteModal(true);
  // };

  // const handleConfirmDelete = async () => {
  //   try {
  //     const objectId = deletingItem.id;
  //     const response = await axios.delete(`${apiUrl}/${deletingItem.id}`);

  //     console.log("API Response:", response.data);

  //     const newData = data.filter((item) => item.id !== objectId);
  //     setData(newData);

  //     // Close the delete modal and refresh the table
  //     setShowDeleteModal(false);
  //     setDeletingItem(null);
  //   } catch (error) {
  //     console.error("Error deleting data:", error);
  //   }
  // };

  // const handleCancelDelete = () => {
  //   setShowDeleteModal(false);
  //   setDeletingItem(null);
  // };

  const handleDelete = (obj) => {
    setDeletingItem(obj);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    // Perform the deletion logic here
    try {
      const objectId = deletingItem.id;
      const response = await axios.delete(`${apiUrl}/${deletingItem.id}`);

      console.log("API Response:", response.data);

      const newData = data.filter((item) => item.id !== objectId);
      setData(newData);

      // Close the delete modal and refresh the table
      setShowDeleteModal(false);
      setDeletingItem(null);
      setRefreshTable(true);
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingItem(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleLastPage = () => {
    const totalPages = Math.ceil(numberOfRows / rowsPerPage);

    setCurrentPage(totalPages);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // const totalRows = data.length;

  const totalPages = Math.ceil(numberOfRows / rowsPerPage);

  const filteredData = data.filter((item) => {
    return headers.every((header) => {
      const cellValue = item[header] || "";
      const columnQuery = columnSearchQueries[header] || "";

      return cellValue
        .toString()
        .toLowerCase()
        .includes(columnQuery.toLowerCase());
    });
  });

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const filteredAndSortedData = sortData(filteredData).filter((item) => {
    if (searchQuery) {
      for (const header of headers) {
        const cellValue = item[header] || "";
        if (
          cellValue.toString().toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return true;
        }
      }
      return false;
    }

    return headers.every((header) => {
      const cellValue = item[header] || "";
      const columnQuery = columnSearchQueries[header] || "";

      return cellValue
        .toString()
        .toLowerCase()
        .includes(columnQuery.toLowerCase());
    });
  });

  const itemsPerPage = rowsPerPage;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <>
      <div className="row">
        <AddNew
          apiUrl={apiUrl}
          maxKeysObject={maxKeysObject}
          fetchData={fetchData}
        />

        <div className="file-input-dropdown">
          <button
            className="file-input-button"
            onClick={toggleAllColumnCheckboxes}
          >
            Export
          </button>
          {showColumnCheckboxes && (
            <div className="file-input-options">
              <button
                className={`file-input-options ${
                  selectedColumns.length === 0 ? "disabled" : ""
                }`}
                onClick={exportSortedSelectedFilteredData}
                disabled={selectedColumns.length === 0}
              >
                Export Selected Columns
              </button>
              <label>
                <span>Export as JSON</span>
                <input
                  type="radio"
                  name="exportOption"
                  value="json"
                  checked={selectedExportOption === "json"}
                  onChange={() => setSelectedExportOption("json")}
                />
              </label>
              <label>
                <span>Export as CSV</span>
                <input
                  type="radio"
                  name="exportOption"
                  value="csv"
                  checked={selectedExportOption === "csv"}
                  onChange={() => setSelectedExportOption("csv")}
                />
              </label>
            </div>
          )}
        </div>

        <button
          className="button-reverse"
          onClick={() => {
            setIsDataReversed(!isDataReversed);
          }}
        >
          Reverse
        </button>

        <button className="button" onClick={handleRefresh}>
          Refresh
        </button>

        <div className="search-box">

        

          <FaFilter
            title="Show/Hide filters"
            style={{ cursor: "pointer" }}
            onClick={toggleIndividualColumnFiltering}
          >
            Filter
          </FaFilter>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)} // Update to global search
          />
        </div>
      </div>
      <div className="rows-per-page-selector">
        Rows per page:
        <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value={numberOfRows}>All</option>
        </select>
      </div>

      <div className="DataTableContainer">
        <table className="data-table">
          <thead className="sticky-header">
            {showColumnCheckboxes && (
              <tr>
                <th>
                  <label>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectAllChecked}
                    />
                    Select All
                  </label>
                </th>

                {headers.map((header) => (
                  <th>
                    <input
                      type="checkbox"
                      onChange={() => toggleColumnCheckbox(header)}
                      checked={selectedColumns.includes(header)}
                    />
                  </th>
                ))}
              </tr>
            )}

            <tr>
              <th>Actions</th>
              {headers.map((header) => (
                <th key={header} onClick={() => handleSort(header)}>
                  {header}
                  {sortColumn === header && (
                    <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
              ))}
            </tr>

            {individualColumnFiltering && (
              <tr>
                <th></th>
                {headers.map((header) => (
                  <th key={`filter-${header}`} className="column-filter">
                    <input
                      type="text"
                      placeholder={`Search ${header}...`}
                      value={columnSearchQueries[header] || ""}
                      onChange={(e) =>
                        handleColumnSearchChange(header, e.target.value)
                      }
                      className="filter-input"
                    />
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody>
            {filteredAndSortedData
              .slice(startIndex, endIndex)
              .map((item, index) => (
                <tr key={index}>
                  <td>
                    {editingIndex === index ? (
                      <EditForm
                        data={item}
                        headers={headers}
                        onSave={handleSaveEdit}
                        onCancel={() => setEditingIndex(null)}
                        apiUrl={apiUrl}
                        maxKeysObject={maxKeysObject}
                        fetchData={fetchData}
                      />
                    ) : (
                      <>
                        <button onClick={() => setEditingIndex(index)}>
                          <FaEdit title="edit" style={{ color: "blue" }} />
                        </button>
                        <button onClick={() => handleDelete(item)}>
                          <FaTrash title="delete" style={{ color: "red" }} />
                        </button>
                      </>
                    )}
                  </td>

                  {headers.map((header) => (
                    <td key={header}>
                      {(() => {
                        const cellValue = item[header];

                        if (cellValue === null || cellValue === undefined) {
                          return null; // Return null for invalid values
                        }

                        if (cellValue === null || cellValue === undefined) {
                          return null; // Return null for invalid values
                        }

                        if (typeof cellValue === "object") {
                          // Handle objects
                          if (Object.keys(cellValue).length === 0) {
                            return null; // Return null for empty objects
                          }

                          if (
                            "metrics" in cellValue &&
                            "start_relative" in cellValue
                          ) {
                            // Handle the object with keys {metrics, start_relative} here
                            return (
                              <div>
                                <div>Metrics: {cellValue.metrics[0].name}</div>
                                <div>
                                  Start Relative:{" "}
                                  {cellValue.start_relative.value}{" "}
                                  {cellValue.start_relative.unit}
                                </div>
                              </div>
                            );
                          } else if ("name" in cellValue) {
                            // Handle the object with key {name} by rendering it as a string
                            return <div>Name: {cellValue.name.toString()}</div>;
                          } else if (
                            "value" in cellValue &&
                            "unit" in cellValue
                          ) {
                            // Handle the object with keys {value, unit} by rendering them as a string
                            return (
                              <div>
                                <div>Value: {cellValue.value}</div>
                                <div>Unit: {cellValue.unit}</div>
                              </div>
                            );
                          } else {
                            // Handle other objects by recursively rendering their properties
                            return (
                              <div>
                                {Object.entries(cellValue).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      <strong>{key}: </strong>
                                      {typeof value === "object"
                                        ? JSON.stringify(value)
                                        : value}
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          }
                        } else if (Array.isArray(cellValue)) {
                          // Handle arrays by joining their elements
                          return cellValue.join(", ");
                        
                        }else {
                        
                    
                        let highlightedText = cellValue.toString();

                        // Check if there's a global search query (searchQuery)
                        if (searchQuery) {
                          highlightedText = highlightText(highlightedText, searchQuery);
                        }
                    
                        // Check if there's a column-specific search query (columnSearchQueries[header])
                        if (columnSearchQueries[header]) {
                          highlightedText = highlightText(highlightedText, columnSearchQueries[header]);
                        }
                        return (
                          <>
                                  <span dangerouslySetInnerHTML={{ __html: highlightedText }} />

                            </>
                        );}

                        
                      })()}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button
          className="button"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
        >
          First
        </button>
        <button
          className="button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button
          className="button"
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Table;






// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { FaEdit, FaTrash, FaFilter } from "react-icons/fa";
// import EditForm from "./EditForm";
// import AddNew from "./AddNew";
// import DeleteConfirmationModal from "./DeleteConfirmationModal";
// // import ExcelJS from "exceljs";
// import Papa from "papaparse";

// const Table = ({ headers, apiUrl, maxKeysObject, onDataUpdate }) => {
//   const [data, setData] = useState([]);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deletingItem, setDeletingItem] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [numberOfRows, setNumberOfRows] = useState(0);
//   const [refreshTable, setRefreshTable] = useState(false);

//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");

//   const [sortedData, setSortedData] = useState([]);
//   const [isDataReversed, setIsDataReversed] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const [individualColumnFiltering, setIndividualColumnFiltering] =
//     useState(false);
//   const [columnSearchQueries, setColumnSearchQueries] = useState({});



//   const [showColumnCheckboxes, setShowColumnCheckboxes] = useState(false);


//   const [appearColumnCheckboxes, setappearColumnCheckboxes] = useState(false);

//   const [selectedColumns, setSelectedColumns] = useState([...headers]);

//   const [selectedExportOption, setSelectedExportOption] = useState(null);

//   const [selectAllChecked, setSelectAllChecked] = useState(true);


//   const highlightText = (text, query) => {
//     if (!query) return text;

//     const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, 'gi');
//     return text.replace(regex, '<span class="highlighted">$1</span>');
//   };

  

//   const handleRefresh = () => {
    
//     setColumnSearchQueries("");
//     setSearchQuery(""); // Clear search query
//     setCurrentPage(1); // Reset to the first page
//     setSortColumn(null); // Clear sorting
//     setSortOrder("asc");
//     setSelectedColumns([...headers]); // Reset selected columns
//     setSelectedExportOption(null); // Reset export option
//     setappearColumnCheckboxes(false); // Hide column checkboxes
//     setSelectAllChecked(true); // Reset select all checkbox
//     setIndividualColumnFiltering(false);
//     setShowColumnCheckboxes(false);
//   };

//   const toggleAllColumnCheckboxes = () => {
//     if (showColumnCheckboxes) {
//       setSelectedColumns([]);
//     }
//     setShowColumnCheckboxes(!showColumnCheckboxes);
//   };

//   const toggleIndividualColumnFiltering = () => {
//     setIndividualColumnFiltering(!individualColumnFiltering);
//   };

//   const toggleSelectAll = () => {
//     if (selectedColumns.length === headers.length) {
//       setSelectedColumns([]);
//       setSelectAllChecked(false);
//     } else {
//       setSelectedColumns([...headers]);
//       setSelectAllChecked(true);
//     }
//   };

//   const exportSortedSelectedFilteredData = () => {
//     if (selectedExportOption === "json") {
//       // Export as JSON
//       const dataToExport = filteredAndSortedData.map((item) => {
//         const exportedItem = {};
//         for (const header of selectedColumns) {
//           if (item.hasOwnProperty(header)) {
//             exportedItem[header] = item[header];
//           }
//         }
//         return exportedItem;
//       });
//       const jsonBlob = new Blob([JSON.stringify(dataToExport, null, 2)], {
//         type: "application/json",
//       });
//       const downloadLink = document.createElement("a");
//       downloadLink.href = URL.createObjectURL(jsonBlob);
//       downloadLink.download = "table-data.json";
//       downloadLink.click();
//     } else if (selectedExportOption === "csv") {
//       // Export as CSV
//       const dataToExport = filteredAndSortedData.map((item) => {
//         const exportedItem = {};
//         for (const header of selectedColumns) {
//           if (item.hasOwnProperty(header)) {
//             exportedItem[header] = item[header];
//           }
//         }
//         return exportedItem;
//       });
//       const csvData = Papa.unparse(dataToExport);
//       const csvBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
//       const downloadLink = document.createElement("a");
//       downloadLink.href = URL.createObjectURL(csvBlob);
//       downloadLink.download = "table-data.csv";
//       downloadLink.click();
//     }
//   };

  

//   const toggleColumnCheckbox = (header) => {
//     const updatedSelectedColumns = selectedColumns.includes(header)
//       ? selectedColumns.filter((col) => col !== header)
//       : [...selectedColumns, header];
//     setSelectedColumns(updatedSelectedColumns);
//   };

  

//   const handleColumnSearchChange = (column, value) => {
//     setColumnSearchQueries({
//       ...columnSearchQueries,
//       [column]: value,
//     });
//   };

//   const fetchData = async () => {
//     try {
//       const response = await axios.get(apiUrl);
//       setNumberOfRows(response.data.length);
//       setData(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [apiUrl]);

//   const sortData = (unsortedData) => {
//     let sortedDataCopy = [...unsortedData];

//     if (sortColumn) {
//       sortedDataCopy.sort((a, b) => {
//         const aValue = a[sortColumn];
//         const bValue = b[sortColumn];

//         const numAValue = parseFloat(aValue);
//         const numBValue = parseFloat(bValue);

//         if (!isNaN(numAValue) && !isNaN(numBValue)) {
//           if (numAValue < numBValue) {
//             return sortOrder === "asc" ? -1 : 1;
//           }
//           if (numAValue > numBValue) {
//             return sortOrder === "asc" ? 1 : -1;
//           }
//           return 0;
//         } else if (typeof aValue === "string" && typeof bValue === "string") {
//           if (aValue < bValue) {
//             return sortOrder === "asc" ? -1 : 1;
//           }
//           if (aValue > bValue) {
//             return sortOrder === "asc" ? 1 : -1;
//           }
//           return 0;
//         } else if (typeof aValue !== "string") {
//           return sortOrder === "asc" ? 1 : -1;
//         } else {
//           return sortOrder === "asc" ? -1 : 1;
//         }
//       });
//     }

//     if (isDataReversed) {
//       sortedDataCopy = sortedDataCopy.reverse();
//     }

//     return sortedDataCopy;
//   };

//   useEffect(() => {
//     const sortedAndSlicedData = sortData(data).slice(
//       (currentPage - 1) * rowsPerPage,
//       currentPage * rowsPerPage
//     );
//     setSortedData(sortedAndSlicedData);
//   }, [data, sortColumn, sortOrder, isDataReversed, currentPage, rowsPerPage]);

//   const handleSaveEdit = async (editedData) => {
//     setEditingIndex(null);

//     if (onDataUpdate) {
//       onDataUpdate();
//     }
//     setRefreshTable(true);
//   };

//   const handleRowsPerPageChange = (event) => {
//     const newRowsPerPage = parseInt(event.target.value, 10);

//     setRowsPerPage(newRowsPerPage);
//     setCurrentPage(1); // Reset to the first page when changing rows per page
//   };

//   const handleDelete = (obj) => {
//     setDeletingItem(obj);
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       const objectId = deletingItem.id;
//       const response = await axios.delete(`${apiUrl}/${deletingItem.id}`);

//       console.log("API Response:", response.data);

//       const newData = data.filter((item) => item.id !== objectId);
//       setData(newData);

//       // Close the delete modal and refresh the table
//       setShowDeleteModal(false);
//       setDeletingItem(null);
//     } catch (error) {
//       console.error("Error deleting data:", error);
//     }
//   };

//   const handleCancelDelete = () => {
//     setShowDeleteModal(false);
//     setDeletingItem(null);
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     setCurrentPage(currentPage + 1);
//   };

//   const handleLastPage = () => {
//     const totalPages = Math.ceil(numberOfRows / rowsPerPage);

//     setCurrentPage(totalPages);
//   };

//   const handleFirstPage = () => {
//     setCurrentPage(1);
//   };

//   const handleSort = (column) => {
//     if (sortColumn === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(column);
//       setSortOrder("asc");
//     }
//   };


//   const totalPages = Math.ceil(numberOfRows / rowsPerPage);

//   const filteredData = data.filter((item) => {
//     return headers.every((header) => {
//       const cellValue = item[header] || "";
//       const columnQuery = columnSearchQueries[header] || "";

//       return cellValue
//         .toString()
//         .toLowerCase()
//         .includes(columnQuery.toLowerCase());
//     });
//   });

//   const handleSearchChange = (value) => {
//     setSearchQuery(value);
//   };

//   const filteredAndSortedData = sortData(filteredData).filter((item) => {
//     if (searchQuery) {
//       for (const header of headers) {
//         const cellValue = item[header] || "";
//         if (
//           cellValue.toString().toLowerCase().includes(searchQuery.toLowerCase())
//         ) {
//           return true;
//         }
//       }
//       return false;
//     }

//     return headers.every((header) => {
//       const cellValue = item[header] || "";
//       const columnQuery = columnSearchQueries[header] || "";

//       return cellValue
//         .toString()
//         .toLowerCase()
//         .includes(columnQuery.toLowerCase());
//     });
//   });

//   const itemsPerPage = rowsPerPage;
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;

//   return (
//     <>
//       <div className="row">
//         <AddNew
//           apiUrl={apiUrl}
//           maxKeysObject={maxKeysObject}
//           fetchData={fetchData}
//         />

//         <div className="file-input-dropdown">
//           <button
//             className="file-input-button"
//             onClick={toggleAllColumnCheckboxes}
//           >
//             Export
//           </button>
//           {showColumnCheckboxes && (
//             <div className="file-input-options">
//               <button
//                 className={`file-input-options ${
//                   selectedColumns.length === 0 ? "disabled" : ""
//                 }`}
//                 onClick={exportSortedSelectedFilteredData}
//                 disabled={selectedColumns.length === 0}
//               >
//                 Export Selected Columns
//               </button>
//               <label>
//                 <span>Export as JSON</span>
//                 <input
//                   type="radio"
//                   name="exportOption"
//                   value="json"
//                   checked={selectedExportOption === "json"}
//                   onChange={() => setSelectedExportOption("json")}
//                 />
//               </label>
//               <label>
//                 <span>Export as CSV</span>
//                 <input
//                   type="radio"
//                   name="exportOption"
//                   value="csv"
//                   checked={selectedExportOption === "csv"}
//                   onChange={() => setSelectedExportOption("csv")}
//                 />
//               </label>
//             </div>
//           )}
//         </div>

//         <button
//           className="button-reverse"
//           onClick={() => {
//             setIsDataReversed(!isDataReversed);
//           }}
//         >
//           Reverse
//         </button>

//         <button className="button" onClick={handleRefresh}>
//           Refresh
//         </button>

//         <div className="search-box">

        

//           <FaFilter
//             title="Show/Hide filters"
//             style={{ cursor: "pointer" }}
//             onClick={toggleIndividualColumnFiltering}
//           >
//             Filter
//           </FaFilter>
//           <input
//             type="text"
//             placeholder="Search..."
//             value={searchQuery}
//             onChange={(e) => handleSearchChange(e.target.value)} // Update to global search
//           />
//         </div>
//       </div>
//       <div className="rows-per-page-selector">
//         Rows per page:
//         <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
//           <option value="10">10</option>
//           <option value="25">25</option>
//           <option value="50">50</option>
//           <option value={numberOfRows}>All</option>
//         </select>
//       </div>

//       <div className="DataTableContainer">
//         <table className="data-table">
//           <thead className="sticky-header">
//             {showColumnCheckboxes && (
//               <tr>
//                 <th>
//                   <label>
//                     <input
//                       type="checkbox"
//                       onChange={toggleSelectAll}
//                       checked={selectAllChecked}
//                     />
//                     Select All
//                   </label>
//                 </th>

//                 {headers.map((header) => (
//                   <th>
//                     <input
//                       type="checkbox"
//                       onChange={() => toggleColumnCheckbox(header)}
//                       checked={selectedColumns.includes(header)}
//                     />
//                   </th>
//                 ))}
//               </tr>
//             )}

//             <tr>
//               <th>Actions</th>
//               {headers.map((header) => (
//                 <th key={header} onClick={() => handleSort(header)}>
//                   {header}
//                   {sortColumn === header && (
//                     <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
//                   )}
//                 </th>
//               ))}
//             </tr>

//             {individualColumnFiltering && (
//               <tr>
//                 <th></th>
//                 {headers.map((header) => (
//                   <th key={`filter-${header}`} className="column-filter">
//                     <input
//                       type="text"
//                       placeholder={`Search ${header}...`}
//                       value={columnSearchQueries[header] || ""}
//                       onChange={(e) =>
//                         handleColumnSearchChange(header, e.target.value)
//                       }
//                       className="filter-input"
//                     />
//                   </th>
//                 ))}
//               </tr>
//             )}
//           </thead>

//           <tbody>
//             {filteredAndSortedData
//               .slice(startIndex, endIndex)
//               .map((item, index) => (
//                 <tr key={index}>
//                   <td>
//                     {editingIndex === index ? (
//                       <EditForm
//                         data={item}
//                         headers={headers}
//                         onSave={handleSaveEdit}
//                         onCancel={() => setEditingIndex(null)}
//                         apiUrl={apiUrl}
//                         maxKeysObject={maxKeysObject}
//                         fetchData={fetchData}
//                       />
//                     ) : (
//                       <>
//                         <button onClick={() => setEditingIndex(index)}>
//                           <FaEdit title="edit" style={{ color: "blue" }} />
//                         </button>
//                         <button onClick={() => handleDelete(item)}>
//                           <FaTrash title="delete" style={{ color: "red" }} />
//                         </button>
//                       </>
//                     )}
//                   </td>

//                   {headers.map((header) => (
//                     <td key={header}>
//                       {(() => {
//                         const cellValue = item[header];

//                         if (cellValue === null || cellValue === undefined) {
//                           return null; // Return null for invalid values
//                         }

//                         if (cellValue === null || cellValue === undefined) {
//                           return null; // Return null for invalid values
//                         }

//                         if (typeof cellValue === "object") {
//                           // Handle objects
//                           if (Object.keys(cellValue).length === 0) {
//                             return null; // Return null for empty objects
//                           }

//                           if (
//                             "metrics" in cellValue &&
//                             "start_relative" in cellValue
//                           ) {
//                             // Handle the object with keys {metrics, start_relative} here
//                             return (
//                               <div>
//                                 <div>Metrics: {cellValue.metrics[0].name}</div>
//                                 <div>
//                                   Start Relative:{" "}
//                                   {cellValue.start_relative.value}{" "}
//                                   {cellValue.start_relative.unit}
//                                 </div>
//                               </div>
//                             );
//                           } else if ("name" in cellValue) {
//                             // Handle the object with key {name} by rendering it as a string
//                             return <div>Name: {cellValue.name.toString()}</div>;
//                           } else if (
//                             "value" in cellValue &&
//                             "unit" in cellValue
//                           ) {
//                             // Handle the object with keys {value, unit} by rendering them as a string
//                             return (
//                               <div>
//                                 <div>Value: {cellValue.value}</div>
//                                 <div>Unit: {cellValue.unit}</div>
//                               </div>
//                             );
//                           } else {
//                             // Handle other objects by recursively rendering their properties
//                             return (
//                               <div>
//                                 {Object.entries(cellValue).map(
//                                   ([key, value]) => (
//                                     <div key={key}>
//                                       <strong>{key}: </strong>
//                                       {typeof value === "object"
//                                         ? JSON.stringify(value)
//                                         : value}
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             );
//                           }
//                         } else if (Array.isArray(cellValue)) {
//                           // Handle arrays by joining their elements
//                           return cellValue.join(", ");
                        
//                         }else {
                        
                    
//                         let highlightedText = cellValue.toString();

//                         // Check if there's a global search query (searchQuery)
//                         if (searchQuery) {
//                           highlightedText = highlightText(highlightedText, searchQuery);
//                         }
                    
//                         // Check if there's a column-specific search query (columnSearchQueries[header])
//                         if (columnSearchQueries[header]) {
//                           highlightedText = highlightText(highlightedText, columnSearchQueries[header]);
//                         }
//                         return (
//                           <>
//                                   <span dangerouslySetInnerHTML={{ __html: highlightedText }} />

//                             </>
//                         );}

                        
//                       })()}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="pagination-controls">
//         <button
//           className="button"
//           onClick={handleFirstPage}
//           disabled={currentPage === 1}
//         >
//           First
//         </button>
//         <button
//           className="button"
//           onClick={handlePreviousPage}
//           disabled={currentPage === 1}
//         >
//           Previous
//         </button>
//         <span>
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           className="button"
//           onClick={handleNextPage}
//           disabled={currentPage === totalPages}
//         >
//           Next
//         </button>
//         <button
//           className="button"
//           onClick={handleLastPage}
//           disabled={currentPage === totalPages}
//         >
//           Last
//         </button>
//       </div>

//       {showDeleteModal && (
//         <DeleteConfirmationModal
//           item={deletingItem}
//           onConfirm={handleConfirmDelete}
//           onCancel={handleCancelDelete}
//         />
//       )}
//     </>
//   );
// };

// export default Table;
