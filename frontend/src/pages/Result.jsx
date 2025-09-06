import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import html2canvas from "html2canvas";
import logo from "/Image.png";
import { motion } from "framer-motion";

const ResultPage = () => {
  const location = useLocation();
  const [teacher, setTeacher] = useState();
  const [isDownloading, setIsDownloading] = useState(false);
  const ip = window.location.hostname;
  const { score, totalQuestions, name } = location.state || {
    score: 0,
    totalQuestions: 0,
    name: "Student",
  };
  const percentage = (score / totalQuestions) * 100;
  const certificateRef = useRef(null);

  const downloadCertificate = async () => {
    if (certificateRef.current) {
      setIsDownloading(true);
      try {
        const canvas = await html2canvas(certificateRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `Certificate_${name}.png`;
        link.click();
      } catch (error) {
        console.error("Error generating certificate:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  useEffect(() => {
    fetch(`http://${ip}:3000/api/get/teacher`)
      .then((e) => e.json())
      .then((e) => {
        setTeacher(e.teacher);
      });
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center justify-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Result Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl p-8 text-center w-full max-w-md shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Exam Completed!
          </h2>
          <p className="text-gray-600">
            Congratulations on finishing your test
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl mb-6">
          <p className="text-gray-700 font-medium mb-1">Your Score</p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-4xl font-bold text-blue-600">{score}</span>
            <span className="text-gray-500">/</span>
            <span className="text-2xl text-gray-600">{totalQuestions}</span>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {percentage.toFixed(1)}% correct answers
          </p>
        </div>

        {percentage >= 80 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-green-600 font-medium flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            You qualified for a certificate!
          </motion.p>
        )}
      </motion.div>

      {/* Certificate Section */}
      {/* Certificate Section - Royal Design */}
{percentage >= 80 && (
  <motion.div
    variants={itemVariants}
    className="flex flex-col items-center mt-10 w-full max-w-3xl"
  >
    {/* Royal Certificate Container */}
    <motion.div
      ref={certificateRef}
      className="relative bg-gradient-to-b from-blue-900 to-blue-950 rounded-3xl p-10 text-center w-full border-4 border-amber-200 shadow-2xl shadow-amber-900/20 overflow-hidden"
      whileHover={{ scale: 1.01 }}
    >
      {/* Golden Crown Header */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <svg className="w-24 h-24 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
        </svg>
      </div>

      {/* Golden Border Accents */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>

      {/* Certificate Content - Arabic */}
      <div className="relative z-10" dir="rtl">
        {/* Logo and Title */}
        <div className="flex justify-center items-center mb-8 gap-6">
          <img src={logo} alt="الشعار" className="w-20 h-20 object-contain" />
          <div>
            <h3 className="text-4xl font-bold text-amber-300 mb-2">شهادة امتياز</h3>
            <p className="text-blue-200">تمنح للأفراد المتميزين في أدائهم</p>
          </div>
        </div>

        {/* Golden Divider */}
        <div className="w-full h-1 bg-gradient-to-l from-amber-500 to-amber-300 my-8 rounded-full"></div>

        {/* Recipient Name */}
        <div className="my-12 px-8 py-10 bg-blue-800/30 rounded-xl border border-amber-200/20 backdrop-blur-sm">
          <h2 className="text-5xl font-bold text-amber-100 tracking-wider font-arabic">
            {name}
          </h2>
          <div className="w-40 h-1 bg-gradient-to-l from-amber-400 to-blue-300 mx-auto my-6 rounded-full opacity-70"></div>
          <p className="text-xl text-blue-200">
            لتميزك في إتمام متطلبات الاختبار بنجاح باهر
          </p>
        </div>

        {/* Score and Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-700">
            <p className="text-blue-300 mb-2">النسبة المئوية</p>
            <p className="text-3xl font-bold text-amber-300">{percentage}%</p>
          </div>
          <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-700">
            <p className="text-blue-300 mb-2">الدرجة الكاملة</p>
            <p className="text-3xl font-bold text-amber-300">{score}/{totalQuestions}</p>
          </div>
          <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-700">
            <p className="text-blue-300 mb-2">التاريخ</p>
            <p className="text-2xl text-amber-300">
              {new Date().toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>

        {/* Footer with Seal and Signature */}
        <div className="mt-12 pt-8 border-t border-blue-700 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-right">
            <p className="text-blue-300 mb-1">مصدرة من قبل:</p>
            <p className="text-xl text-amber-200 font-semibold">
              {teacher || "المجلس العلمي الموقر"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-800 border-2 border-amber-400 flex items-center justify-center">
                <svg className="w-10 h-10 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="absolute -inset-2 border border-amber-400 rounded-full opacity-50"></div>
            </div>
            <div className="text-left">
              <p className="text-blue-300 mb-1">ختم رسمي</p>
              <p className="text-amber-200">معتمد</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Islamic Pattern */}
      <div className="absolute inset-0 opacity-10 pattern-islamic pattern-blue-400 pattern-size-16 pattern-opacity-20"></div>
    </motion.div>

    {/* Golden Download Button */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="mt-8 px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-600 text-blue-900 font-bold rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all"
      onClick={() => downloadCertificate()}
    >
      <span className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        تنزيل الشهادة
      </span>
    </motion.button>
  </motion.div>
)}

    </motion.div>
  );
};

export default ResultPage;
