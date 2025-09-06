import { useEffect, useState } from "react";
import "./App.css";
import image from "./assets/Student stress-rafiki.svg";
import { useNavigate } from "react-router";
import { useAlert } from "react-alert";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import axios from "axios";
import { v4 as uuid4 } from "uuid";

function App() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const alert = useAlert();
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const ip = window.location.hostname;


  const onSubmit = (e) => {
    e.preventDefault();
    const id = uuid4();

    setButtonDisabled(true);
    const resolveAfter3Sec = new Promise((resolve, reject) => {
      // Send a POST request with the name to the server
      axios
        .post(`http://${ip}:3000/api/get/exam`, { name, id }) // Include the name in the request body
        .then((res) => {
          if (res?.finished) {
            setButtonDisabled(false);
            return reject();
          }
          const examData = res.data.exam; // Extract exam data from the response

          // Navigate to the exam page after a delay
          setTimeout(() => {
            navigate(id + "/exampage", { state: { name: name, exam: examData } });
          }, 1000);

          console.log(examData); // Log the exam data
          resolve(); // Resolve the promise
        })
        .catch((err) => {
          console.error("Error fetching exam data:", err); // Log any errors
          setTimeout(() => {

            setButtonDisabled(false);
          }, 1300)
          reject(); // Resolve the promise even if there's an error (optional)
        });
    });
    toast.promise(
      resolveAfter3Sec,
      {
        pending: "الرجاء الانتظار",
        success: "تم التوصيل",
        error: "حدث خطأ",
      },
      { draggable: false, className: "hello", autoClose: 1000, }
    );
  };
  const questionVariants = {
    hidden: { opacity: 0, x: 50 }, // Start off-screen to the left
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }, // Slide in to the center
  };
  const questionVariants1 = {
    hidden: { opacity: 0, x: -100 }, // Start off-screen to the left
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }, // Slide in to the center
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br overflow-hidden from-cyan-500 to-blue-900 text-white flex items-center justify-center p-6"
    >
      {/* Form Section */}
      {/* Form Section */}
      <div className="lg:flex-[0.7] flex-1 justify-center">
        <motion.form
          variants={questionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }} // Only animate once
          className="max-w-md mx-auto bg-white backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 text-gray-800"
          onSubmit={onSubmit}
        >
          {/* ✅ Logo Section */}
          <motion.div
            className="flex items-center flex-row-reverse gap-2"
            initial={{ x: 50, opacity: 0 }} // Move in from the right
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
          >
            {/* Heading */}
            <motion.h1 initial={{ x: 50, opacity: 0 }} // Move in from the right
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.8 }} className="text-3xl font-bold text-gray-900">مرحباً بك!</motion.h1>

            {/* Logo */}
            <img
              src="/logo.png" // Change to your actual logo path
              alt="Logo"
              className="w-14 h-14 z-50 object-contain bg-white border-l-2 border-gray-200"
            />
          </motion.div>

          {/* Heading */}


          {/* Subheading */}
          <p className="text-gray-600 text-center text-lg">
            يرجى إدخال اسمك لتأكيد تسجيل الدخول
          </p>

          {/* Input Field */}
          <input
            className="bg-gray-100 border border-gray-300 rounded-xl w-full p-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            type="text"
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={buttonDisabled}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={buttonDisabled}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white font-semibold py-3 px-6 w-full rounded-xl shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            تأكيد
          </button>

          {/* Footer */}
          <footer dir="ltr" className="mt-6">
            <p className="text-sm text-gray-500">
              developed by{" "}
              <span className="font-bold text-gray-800">
                {"< Youssef Salah Elbltagi />"}
              </span>
            </p>
          </footer>
        </motion.form>
      </div>


      {/* Illustration Section */}
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <motion.img
          src={image}
          className="w-3/4 max-w-md drop-shadow-2xl"
          alt="Student Illustration"
          variants={questionVariants1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }} // Only animate once
        />
      </div>

      {/* Toast Container */}
      <ToastContainer
        className={"hello"}
        hideProgressBar
        position={"top-center"}
      />
    </div>
  );
}

export default App;