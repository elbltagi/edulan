import React, { useEffect, useState } from "react";
import { useNavigate, useNavigationType } from "react-router";
import { useActivation } from "../activation";
import { useExam } from "../ExamProvider";
import axios from "axios";

function FileActions() {
    const navigate = useNavigate();
    const [isDragging, setIsDragging] = useState(false);
    const [text, setText] = useState("");
    const activated = useActivation();
    const navigatationTyp = useNavigationType();
    const exam = useExam()
    const handleCreateFile = () => {
        exam.setQuestions([]);
        navigate("createnew");
    };

    useEffect(() => {
        if (navigatationTyp === "POP") {
            exam.setQuestions([]);
        }
    }, [])

    const handleUploadFile = (files) => {
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append("examFile", file);
        });

        fetch("http://localhost:3000/api/upload/exam", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then((data) => {
                if (data.exam) {
                    navigate("createnew", {
                        state: {
                            exam: data.exam, // Pass the received exam JSON data
                        }
                    });
                } else {
                    console.error("Invalid server response:", data);
                }
            })
            .catch((error) => {
                console.error("Error uploading file:", error);
            });
    };
    const handleActive = async () => {
        try {
            const response = await axios.post("https://beakup-server-for-students.onrender.com/check/activation_code", {
                code: text,
                deviceId: activated.machineId,
            });
            console.log(response.data);
            if (response.data.success) {
                axios.post("http://localhost:3000/api/active", { key: text }).then((e) => {
                    if (e.data.success) {
                        alert("the App is activated now");
                        activated.activateApp();

                    }
                })
            }
        } catch (err) {
            console.error(err);
        }
    }


    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleUploadFile(files);
    };

    return (
        <div
            className={`h-screen bg-gradient-to-r from-cyan-500 to-blue-500 flex justify-center flex-col gap-3 items-center relative ${isDragging ? "bg-opacity-90" : ""
                }`}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {/* Drag-and-Drop Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-blue-200 bg-opacity-50 flex items-center justify-center">
                    <p className="text-2xl font-semibold text-blue-800">Drop your files here!</p>
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 w-11/12 max-w-md text-center space-y-6 z-10">
                <h1 className="text-2xl font-bold text-gray-800">Manage Your Files</h1>
                <p className="text-gray-600">Choose an option to get started:</p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleCreateFile}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                    >
                        Create File
                    </button>
                    <button
                        onClick={() => alert("Upload File action triggered!")}
                        className="px-6 py-3 bg-gray-100 text-blue-600 rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                    >
                        Upload File
                    </button>
                </div>
                {!activated.isActivated &&
                    <p>
                        this app is not activated
                    </p>
                }
            </div>
            {!activated.isActivated &&
                <div className="bg-white rounded-xl shadow-lg p-4 w-11/12 max-w-md text-center  z-10 flex gap-4 items-center">
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="border-b text-center text-lg outline-none flex-1" placeholder="Activation Code" />
                    <button onClick={handleActive} className="px-3 bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all rounded-lg py-3 ">
                        Active App
                    </button>
                </div>
            }
        </div>
    );
}

export default FileActions;
