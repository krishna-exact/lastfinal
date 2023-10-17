
import React, { useState } from 'react';
import ApiSelector from './components/ApiSelector';
import Table from './components/Table';
import './App.css';

const App = () => {
  

  return (
    <div>
      <ApiSelector />
      
    </div>
  );
};

export default App;

// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
// import ApiSelector from './components/ApiSelector';
// // import DataTagIdGeneratorPage from './pages/DataTagIdGeneratorPage';
// import './App.css';

// const App = () => {
//   return (
//     <Router>
//       <div>
//         <Routes> 
//           <Route path="/" element={<ApiSelector />} /> 
//           {/* <Route path="/pages/DataTagIdGeneratorPage" element={<DataTagIdGeneratorPage />} />  */}

//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default App;
