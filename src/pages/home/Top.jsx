import React, { useEffect, useState } from "react";
import small from "../images/logosmall.png";
import "./styles/Top.css";
import { CircleAlert, CircleCheckBig, Plus, X } from "lucide-react";
import {
  faAngleDown,
  faAngleUp,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { auth, database, storage } from "../firebase/firebase";
import { ref, set, push } from "firebase/database";
import { ref as storageRef, uploadBytes } from "firebase/storage";

function Top({ popup }) {
  const navigate = useNavigate();
  const [dropdown, setDropDown] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const isImage = (file) => {
    const acceptedExtensions = ["jpg", "jpeg", "png", "gif"];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();
    return acceptedExtensions.includes(fileExtension);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (uploadFile && isImage(uploadFile)) {
        const fileData = {
          user: auth.currentUser.uid,
        };
        const newFileKey = push(ref(database, "files")).key;
        await set(ref(database, `files/${newFileKey}`), fileData);
        const storageRefPath = storageRef(storage, `files/${newFileKey}`);
        await uploadBytes(storageRefPath, uploadFile);
        localStorage.setItem("hasSubmittedBefore", "true");
        popup("popup__success");
        event.target.reset();
        closeUpdate();
      } else {
        popup("popup__fail");
        console.error("Error: Please upload an image file.");
      }
    } catch (error) {
      console.log("Error uploading data:", error);
    }
  };

  const closeUpdate = () => {
    document.querySelector(".upload__modal").style.display = "none";
    document.querySelector(".upload__dark").style.display = "none";
  };

  const openUpdate = () => {
    document.querySelector(".upload__modal").style.display = "block";
    document.querySelector(".upload__dark").style.display = "block";
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigate("/login");
        return;
      })
      .catch((error) => {
        return;
      });
  };

  useEffect(() => {
    if (dropdown === true) {
      document.querySelector(".dropdown").style.display = "block";
    } else {
      document.querySelector(".dropdown").style.display = "none";
    }
  }, [dropdown]);

  return (
    <>
      <nav id="top">
        <div className="top__container">
          <div className="top__flex">
            <Link to="/">
              <img src={small} alt="Logo" className="top__logo" />
            </Link>

            <p className="top__selected">Home</p>
          </div>
          <div className="top__profile" onClick={() => setDropDown(!dropdown)}>
            <div className="top__avatar">
              {auth.currentUser.email[0].toUpperCase()}
            </div>
            <FontAwesomeIcon icon={dropdown ? faAngleUp : faAngleDown} />
          </div>
        </div>
      </nav>
      <button className="upload" onClick={openUpdate}>
        <Plus />
      </button>

      <div className="dropdown__div">
        <div className="dropdown">
          <div className="dropdown__item" onClick={handleSignOut}>
            <p>Sign Out</p>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </div>
        </div>
      </div>

      <div className="upload__modal">
        <div className="upload__top">
          <p>Upload your file here</p>
          <X className="upload__close" onClick={closeUpdate} />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="upload__div"></div>
          <div className="upload__div">
            <label htmlFor="file">File</label>
            <input
              type="file"
              placeholder="Title"
              className="upload__input"
              id="file"
              required
              onChange={(event) => setUploadFile(event.target.files[0])}
            />
          </div>
          <button className="upload__button" type="submit">
            Submit
          </button>
        </form>
      </div>
      <div className="upload__dark"></div>

      <div className="popup__success">
        <CircleCheckBig />
        <p>File Added</p>
      </div>
      <div className="popup__fail">
        <CircleAlert />
        <p>File Rejected</p>
      </div>
    </>
  );
}

export default Top;
