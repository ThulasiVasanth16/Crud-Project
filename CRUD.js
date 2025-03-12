// Dom Declaration
const userData = {
  userPhotoFile: document.getElementById("uploadButton"),
  userProfilePhoto: document.getElementById("photoId"),
  userName: document.getElementById("name"),
  userCompanyName: document.getElementById("company"),
  userDesignation: document.getElementById("designation"),
  userMobileNo: document.getElementById("phoneNumber"),
  userEmail: document.getElementById("email"),
  userAddress: document.getElementById("address"),
  userCountry: document.getElementById("country"),
  userState: document.getElementById("state"),
  userPinCode: document.getElementById("pinCode"),
};
// Restrict for Phone Number & Pin Code
const avoidKey = (event, maxLength) => {
  const value = event.target.value;
  if (
    event.key === "e" ||
    event.key === "E" ||
    (value.length >= maxLength &&
      event.key !== "Backspace" &&
      event.key !== "Delete" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight")
  ) {
    event.preventDefault();
  }
};
//Api Data
const countriesApiData =
  "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/countries%2Bstates%2Bcities.json";
//const Declaration
const errorSpans = document.querySelectorAll(".error");
const userDetailsTable = document.getElementById("resultTable");

//button
const actionButton = document.getElementById("actionButton");
const resetBtn = document.getElementById("reset");
// Select all input fields with the userData class
const inputs = document.querySelectorAll(".userData");
const imageValidate = document.getElementById("userProfilePhotoError");
let countryData = [];
let editIndexNo;
// Array of placeholder texts
const placeholders = {
  userName: "Enter a Name *",
  userDesignation: "Designation *",
  userMobileNo: "Personal Number *",
  userAddress: "Address *",
  userEmail: "Email *",
  userPinCode: "Pin Code *",
};

// Update placeholders dynamically
Object.entries(userData).forEach(([key, element]) => {
  if (element && placeholders[key]) {
    element.setAttribute("placeholder", placeholders[key]);
  }
});

//Error Messages
const errorMessages = {
  userName: "Enter a valid name (2-4 characters).",
  userMobileNo: "Enter a valid 10-digit mobile number.",
  userEmail: "Enter a valid email address.",
  userPinCode: "Enter a valid 6-digit pin code.",
  userProfilePhoto: "Invalid Image",
  userCompanyName: "Select the Company",
  userDesignation: "Select the Designation",
  userAddress: "Enter a address",
  userCountry: "Select the Country",
  userState: "Select the State",
};
//Form Validation
const validationRules = {
  userName: /^[A-Za-z]{3,20}(\s[A-Za-z]{1,20})?$/, //only space and alphabet
  userMobileNo: /^\d{10}$/, // phone Number exactly 10 digits
  userEmail: /^\w+@\w+\.\w{2,}$/, //[A-Za-z0-9_] w means metaCharacter
  userPinCode: /^\d{6}$/,
};
//Alert Messages
const validateForm = () => {
  let isValid = true;

  // errorMessages or userData if the UserData is using that warning is needed
  Object.keys(errorMessages).forEach((key) => {
    const errorField = document.getElementById(`${key}Error`);
    let error = false;
    const value = userData[key]?.value;

    if (key === "userProfilePhoto") {
      error = userData[key].src.includes("girl.png");
    } else if (validationRules[key]) {
      error = !validationRules[key].test(value) || !value;
    } else if (key === "userState" && value === "No States") {
      error = false;
    } else {
      error = !value || userData[key]?.selectedIndex === 0;
    }

    errorField.textContent = error ? errorMessages[key] : "";
    if (error) isValid = false;
  });

  return isValid;
};
Object.values(userData).forEach((element) => {
  if (element) {
    element.addEventListener("change", validateForm);
  }
});
//Photo upload
userData.userPhotoFile.addEventListener("change", () => {
  const imageFile = userData.userPhotoFile.files[0];
  const imageReader = new FileReader();

  imageReader.onload = () => {
    userData.userProfilePhoto.src = imageReader.result;
  };
  imageReader.readAsDataURL(imageFile);
});
const resetDropdowns = () => {
  Object.entries(userData).forEach(
    ([key, element]) =>
      element &&
      (element.tagName === "IMG"
        ? (element.src = "girl.png")
        : (element.value = ""))
  ); // Reset input fields
  userData.userCountry.innerHTML = `<option disabled selected>Select Country *</option>`;
  userData.userState.innerHTML = `<option disabled selected>Select State</option>`;
};
//FetchData
const fetchData = async () => {
  try {
    let response = await fetch(countriesApiData);
    countryData = await response.json();
    let storeCountryData = "";
    //country data
    countryData.forEach( (countryName) =>storeCountryData += `<option value="${countryName.name}">${countryName.name}</option>`);
    // select country data list
    userData.userCountry.innerHTML += storeCountryData;
    //state Data
  } catch (error) {
    console.error("Error", error);
  }
};
fetchData();

userData.userCountry.addEventListener("change", () => {
  let storeStateData = `<option disabled selected>Select State</option>`;
  //user Selected Country
  const selectedCountry = userData.userCountry.value;
  //using find method get the country name
  const selectedCountryDetails = countryData.find(
    (country) => country.name === selectedCountry
  );
  //print state data
  selectedCountryDetails && selectedCountryDetails.states.length > 0
    ? selectedCountryDetails.states.forEach(
        (state) =>
          (storeStateData += `<option value="${state.name}">${state.name}</option>`)
      )
    : (storeStateData = `<option disabled selected value="No States"> No states available </option>`); //no states available

  userData.userState.innerHTML = storeStateData;
});
//register button
const handleRegister = () => {
  if (!validateForm()) return;

  // Extracting the values into an object
  // fromEntries  returns array to object & entries  returns array of array
  // Object.entries(userData).map(([key, element]) => [key, element.value])
  const userValues = Object.fromEntries(
    Object.entries(userData).map(([key, element]) => {
      if (element.tagName === "IMG") {
        return [key, element.src];
      }
      return [key, element.value];
    })
  );

  const existingUsers = JSON.parse(localStorage.getItem("userDetails"));
  // const editIndex = localStorage.getItem("editIndex");

  // editIndex !== null && !isNaN(editIndex)// using localstorage
  //   ? ((existingUsers[editIndex] = userValues),
  //     localStorage.removeItem("editIndex")) // Clear edit index after update
  //   : existingUsers.push(userValues)// Add the new user to the array | no edit index is found

  console.log("edit index in register", editIndexNo);

  editIndexNo !== null && !isNaN(editIndexNo)
    ? (existingUsers[editIndexNo] = userValues)
    : existingUsers.push(userValues); // Add the new user to the array | no edit index is found

  localStorage.setItem("userDetails", JSON.stringify(existingUsers)); // Store the updated array in localStorage

  userTable();
  fetchData();
  resetDropdowns(); // Reset the dropdowns and other fields
};
//update button
const handleUpdate = () => {
  if (!validateForm()) return;
  handleRegister();
  actionButton.textContent = "Register";
};
//register to update button
actionButton.addEventListener("click", () => {
  if (actionButton.textContent.trim() === "Register") {
    handleRegister();
  } else {
    handleUpdate();
  }
});
const editRow = (event, index) => {
  const allButton = document.querySelectorAll(".editBtn,.deleteBtn");
  allButton.forEach((button) => {
    if (button !== event.target) {
      event.preventDefault();
      button.disabled = true;
    }
  });

  const getUserDetails = JSON.parse(localStorage.getItem("userDetails")) || [];
  const userToEdit = getUserDetails[index];

  userData.userProfilePhoto.src = userToEdit.userProfilePhoto;
  userData.userName.value = userToEdit.userName;
  userData.userCompanyName.value = userToEdit.userCompanyName;
  userData.userDesignation.value = userToEdit.userDesignation;
  userData.userMobileNo.value = userToEdit.userMobileNo;
  userData.userCountry.value = userToEdit.userCountry;
  userData.userState.value = userToEdit.userState;
  userData.userAddress.value = userToEdit.userAddress;
  userData.userEmail.value = userToEdit.userEmail;
  userData.userPinCode.value = userToEdit.userPinCode;

  Object.entries(userData).forEach(([key, element]) => {
    if (element.tagName === "SELECT" && element.id === "state") {
      if (
        ![...element.options].some((option) => {
          option.value === userToEdit[key];
        })
      ) {
        // option.value === userToEdit[key] false vandha, atha ! vecha true aagum (option illa nu artham) so, namma atha add panni vitrom
        element.innerHTML += `<option selected value="${userToEdit[key]}">${userToEdit[key]}</option>`;
      }
    }
  });
  actionButton.textContent = "Update";
  // store the index in localStorage
  editIndexNo = index;
  console.log("edit index", editIndexNo);
  // localStorage.setItem("editIndex", index);

  errorSpans.forEach((label) => (label.textContent = ""));
};
// Delete function
const deleteRow = (index) => {
  // Retrieve the current user data from localStorage
  const getUserDetails = JSON.parse(localStorage.getItem("userDetails"));

  const updatedUserDetails = [];
  getUserDetails.forEach((user, i) => {
    // !== user id match ilana atha array la store pannuthu hu
    // === user id iruthuchu na atha ha dlt panuthu
    if (i !== index) {
      updatedUserDetails.push(user);
    }
  });

  localStorage.setItem("userDetails", JSON.stringify(updatedUserDetails));
  // Re-render the user table after deletion
  userTable();
};
const userTable = () => {
  const getUserDetails = JSON.parse(localStorage.getItem("userDetails")) || [];

  if (Object.keys(getUserDetails).length === 0) {
    userDetailsTable.innerHTML = `<p> No Users Found. Please Register a User..</p>`;
    return;
  }

  let createUserTable = `<table style="border-collapse: collapse; width: 100%; text-align: center; margin-top:10px;" border="1" >
  <tr>
  <th> User Profile</th>
  <th> User Name </th>
  <th> Company Name </th>
  <th> Designation </th>
  <th> Mobile Number </th>
  <th> Email </th>
  <th> Action </th>
  </tr>`;
  for (let index in getUserDetails) {
    const details = getUserDetails[index];
    createUserTable += `<tr>
   <td><img src="${details.userProfilePhoto}" width="70"/> </td>
  <td>${details.userName}</td>
  <td>${details.userCompanyName}</td>
  <td>${details.userDesignation}</td>
  <td>${details.userMobileNo}</td>
  <td>${details.userEmail}</td>
  <td>
   <button class="editBtn" data-index="${index}" onclick="editRow(event,${index})">Edit</button>
   <button class="deleteBtn" data-index="${index}"onclick="deleteRow(${index})">Delete</button>
  </td>
  </tr>`;
  }

  createUserTable += `</table>`;

  userDetailsTable.innerHTML = createUserTable;
};
userTable();
// Reset Function or register after clear all inputs
const clearFields = () => {
  // Iterate  all the span elements
  errorSpans.forEach((label) => (label.textContent = "")); // Reset visibility to hidden
  actionButton.textContent = "Register";
  //reset the dropdowns
  resetDropdowns();
  fetchData();
};
resetBtn.addEventListener("click", clearFields);
