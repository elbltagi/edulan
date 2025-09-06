import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";
import { useExam } from "../ExamProvider";

export default function PrepareLiveExam() {
    const navigate = useNavigate();
    const location = useLocation();
    const [randomize, setRandomize] = useState(false);
    const [teacherName, setTeacherName] = useState("");
    const questions = location.state?.questions || [];
    const exam = useExam();

    const startLiveExam = () => {
        localStorage.setItem("teacher_name", teacherName);
        axios.post("http://localhost:3000/api/add/exam", {
            exam: {
                questions: questions,
                random: randomize,
                teacher: teacherName
            }
        })
            .then(() => navigate("/admin/hosting", { state: { title: "My Exam" } }))
            .catch(error => console.error("Error starting live exam:", error));
    };
    useEffect(() => {
        const name = localStorage.getItem("teacher_name");
        if (name?.trim().length) {
            setTeacherName(name)
        }
    }, [])



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-6">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <button
                    onClick={() => window.history.back()} // Navigate back in history
                    className="flex items-center  text-gray-600 hover:text-gray-800 mb-4"
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
                <h1 className="text-2xl font-bold text-center mb-6">إعداد الامتحان </h1>

                <div dir="rtl" className="mb-4">
                    <label htmlFor="teacherName" className="block text-lg font-semibold mb-2">اسم المعلم:</label>
                    <input
                        type="text"
                        id="teacherName"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="أدخل اسم المعلم"
                    />
                </div>

                <div dir="rtl" className="flex items-center gap-2 mb-6">
                    <input
                        type="checkbox"
                        id="randomize"
                        checked={randomize}
                        onChange={() => setRandomize(!randomize)}
                        className="mr-2 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    <label htmlFor="randomize" className="text-lg font-semibold"> ترتيب الأسئلة بشكل عشوائي </label>
                </div>

                <button
                    onClick={startLiveExam}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md transition hover:bg-blue-700"
                >
                    بدء الامتحان
                </button>
            </div>
        </div>
    );
}
