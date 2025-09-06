import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router";
import axios from "axios";
import { useActivation } from "../activation";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useExam } from "../ExamProvider";

export default function CreateExam() {
    const { questions, setQuestions } = useExam(); // استخدم الـ Context
    const [validationErrors, setValidationErrors] = useState({}); // State for validation errors
    const [modalImage, setModalImage] = useState(null); // State for modal image
    const questionRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    const activation = useActivation();
    const navigationType = useNavigationType();

    useEffect(() => {

        if (location.state?.exam && navigationType !== "POP") {
            setQuestions(location.state.exam.questions);
        }
        const handleBeforeUnload = (event) => {
            if (true) {
                event.preventDefault();
                event.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
    const validateExam = () => {
        const errors = {};

        questions.forEach((question, qIndex) => {
            // Validate question title
            if (!question.title.trim()) {
                errors[`question-${qIndex}-title`] = "يجب إدخال نص السؤال.";
            }

            // Validate answers
            question.answers.forEach((answer, aIndex) => {
                if (!answer.text.trim()) {
                    errors[`question-${qIndex}-answer-${aIndex}`] = "يجب إدخال نص الإجابة.";
                }
            });

            // Validate correct answer
            if (question.correctAnswer === null) {
                errors[`question-${qIndex}-correctAnswer`] = "يجب اختيار إجابة صحيحة.";
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    };
    const handlePublishExam = async () => {
        if (!validateExam()) {
            alert("يوجد أخطاء في البيانات. يرجى مراجعة الأسئلة والإجابات.");
            return;
        }
        await publishExam();
    };

    const addQuestion = () => {
        if (!activation.isActivated && questions.length >= 5) {
            alert("يُسمح فقط بإضافة 5 أسئلة عند عدم تفعيل التطبيق.");
            return;
        }

        setQuestions([
            ...questions,
            {
                title: "",
                answers: [
                    { text: "", id: Math.random().toString() },
                    { text: "", id: Math.random().toString() },
                    { text: "", id: Math.random().toString() },
                    { text: "", id: Math.random().toString() },
                ],
                correctAnswer: null,
                image: null,
            },
        ]);

        setTimeout(() => {
            scrollToQuestion(questions.length);
        }, 400);
    };


    const removeQuestion = (index) => {
        const updatedQuestions = questions.filter((_, qIndex) => qIndex !== index);
        setQuestions(updatedQuestions);
    };

    const handleQuestionChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].title = value;
        setQuestions(updatedQuestions);

        // Clear validation error for this question
        setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`question-${index}-title`];
            return newErrors;
        });
    };

    // Handle answer text change
    const handleAnswerChange = (qIndex, aIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].answers[aIndex].text = value;
        setQuestions(updatedQuestions);

        // Clear validation error for this answer
        setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`question-${qIndex}-answer-${aIndex}`];
            return newErrors;
        });
    };

    // Handle correct answer change
    const handleCorrectAnswerChange = (qIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].correctAnswer = value;
        setQuestions(updatedQuestions);

        // Clear validation error for correct answer
        setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`question-${qIndex}-correctAnswer`];
            return newErrors;
        });
    };
    const handleImageUpload = async (qIndex, file) => {
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await axios.post("http://localhost:3000/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setQuestions((prevQuestions) =>
                prevQuestions.map((q, questionIndex) =>
                    questionIndex === qIndex ? { ...q, image: response.data.imageUrl } : q
                )
            );
        } catch (error) {
            console.error("Image upload failed", error);
        }
    };

    const scrollToQuestion = (index) => {
        questionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
    };

    const publishExam = async () => {
        const zip = new JSZip();
        const examData = {
            title: "My Exam",
            machineId: activation.machineId,
            questions: questions,
        };

        // Add exam data as a JSON file inside the ZIP
        zip.file("exam.json", JSON.stringify(examData, null, 2));

        // Download images and add them to a folder inside the ZIP
        const imageFolder = zip.folder("images");
        for (const question of questions) {
            if (question.image) {
                const imageUrl = question.image;
                try {
                    const response = await fetch(`http://localhost:3000${imageUrl}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${response.statusText}`);
                    }

                    // Get the image blob and its MIME type
                    const blob = await response.blob();
                    const fileName = imageUrl.split('/').pop(); // Ensure the file name includes the extension
                    const mimeType = response.headers.get('content-type'); // Get the MIME type from the response

                    // Add the image to the ZIP folder with the correct MIME type
                    imageFolder.file(fileName, blob, { binary: true });
                } catch (error) {
                    console.error("Failed to download image:", error);
                }
            }
        }

        // Generate the ZIP file and save it with a `.exam` extension
        zip.generateAsync({ type: "blob" }).then((blob) => {
            saveAs(blob, `Exam_${new Date().toISOString().split("T")[0]}.exam`);
        });
    };
    const handleLiveExam = () => {
        if (!validateExam()) {
            alert("يوجد أخطاء في البيانات. يرجى مراجعة الأسئلة والإجابات.");
            return;
        }
        navigate("prepare-live-exam", { state: { questions } });
    };


    const openImageModal = (image) => {
        setModalImage(image);
    };

    const closeImageModal = () => {
        setModalImage(null);
    };

    return (
        <div className="flex min-h-screen pr-16 bg-gradient-to-b from-gray-50 to-gray-200">
            {/* Sidebar */}
            <div className="w-20 bg-gray-800 text-white fixed overflow-y-auto h-screen flex-shrink-0">
                <ul className="space-y-2 p-2">
                    {questions.map((_, index) => (
                        <li key={index}>
                            <button
                                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded text-center font-semibold text-sm"
                                onClick={() => scrollToQuestion(index)}
                            >
                                Q{index + 1}
                            </button>
                        </li>
                    ))}
                    <button
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded text-center font-semibold text-sm"
                        onClick={addQuestion}
                    >
                        +
                    </button>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow ml-20 p-8 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()} // Navigate back in history
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    رجوع
                </button>

                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">إنشاء امتحان</h1>
                {questions.map((question, qIndex) => (
                    <div
                        key={qIndex}
                        className="relative p-6 bg-white shadow-lg rounded-lg border border-gray-300"
                        ref={(el) => (questionRefs.current[qIndex] = el)}
                    >
                        <button
                            onClick={() => removeQuestion(qIndex)}
                            className="absolute top-0 right-2 text-red-600 hover:text-red-800 font-bold text-lg"
                        >
                            ×
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
                            className="mt-2"
                        />
                        <textarea
                            placeholder="السؤال"
                            className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            value={question.title}
                            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        />
                        {validationErrors[`question-${qIndex}-title`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`question-${qIndex}-title`]}</p>
                        )}
                        {question.image && (
                            <div className="mt-4">
                                <img
                                    src={"http://localhost:3000" + question.image}
                                    alt="Question"
                                    className="w-32 h-32 object-cover rounded cursor-pointer"
                                    onClick={() => openImageModal("http://localhost:3000" + question.image)}
                                />
                            </div>
                        )}
                        <ul className="list-none">
                            {question.answers.map((answer, aIndex) => (
                                <li key={aIndex} className="mb-3 flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`correctAnswer-${qIndex}`}
                                        className="ml-2"
                                        checked={question.correctAnswer === answer.id}
                                        onChange={() => handleCorrectAnswerChange(qIndex, answer.id)}
                                    />
                                    <input
                                        type="text"
                                        placeholder={`الإجابة ${aIndex + 1}`}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                        value={answer.text}
                                        onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                                    />
                                    {validationErrors[`question-${qIndex}-answer-${aIndex}`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {validationErrors[`question-${qIndex}-answer-${aIndex}`]}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {validationErrors[`question-${qIndex}-correctAnswer`] && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors[`question-${qIndex}-correctAnswer`]}
                            </p>
                        )}
                    </div>
                ))}

                {/* Modal */}
                {modalImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center top-0 m-0 justify-center z-50"
                        onClick={closeImageModal}
                    >
                        <img
                            src={modalImage}
                            alt="Full View"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                    </div>
                )}

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={handlePublishExam}
                        disabled={!activation.isActivated}
                        className="px-6 py-3 bg-green-500 disabled:bg-gray-400  text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
                    >
                        حفظ الملف
                    </button>
                    <button
                        onClick={handleLiveExam}
                        className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-green-300"
                    >
                        بث الامتحان
                    </button>
                </div>
            </div>
        </div>
    );
}
