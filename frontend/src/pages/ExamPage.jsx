import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useBlocker, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { socket } from '../socket';
import { toast, ToastContainer } from 'react-toastify';

export default function ExamPage() {
    const [data, setData] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const ip = window.location.hostname;
    const questionsRefs = useRef([]);
    const funRef = useRef();
    const bypass = useRef(false);
    const [stopped, setStopped] = useState(() => {
        return JSON.parse(localStorage.getItem("stopped")) || false; // ✅ Load from storage
    });

    useEffect(() => {

        localStorage.setItem("stopped", JSON.stringify(stopped)); // ✅ Save `stopped` state to storage

    }, [stopped]);



    useEffect(() => {
        if (location.state?.exam) {
            console.log(location.state?.exam)
            let questions = location.state.exam.questions;

            if (location.state.exam.random) {
                // Shuffle the questions array
                questions = [...questions].sort(() => Math.random() - 0.5);
            }

            setData(questions);
        }
        const storedStopped = JSON.parse(localStorage.getItem("stopped"));
        if (storedStopped) {
            setStopped(true);
        }
        if (!socket.connected) {
            socket.connect();
        }

        socket.off("exm_finish").on("exm_finish", () => {
            funRef.current(true);
            setStopped(false)
        });
        socket.off("std_finish_id").on("std_finish_id", (e) => {
            if (e.id === params.id) {
                funRef.current(true);
                setStopped(false)
            }
        })
        socket.off("std_leave_id").on("std_leave_id", (e) => {
            if (e.id === params.id) {
                bypass.current = true;
                navigate("/", { replace: true });
                setStopped(false)
            }
        });
        socket.off("std_stop_id").on("std_stop_id", e => {
            if (e.id === params.id) {
                localStorage.setItem("stopped", JSON.stringify(!stopped));
                setStopped(prev => !prev);
            }
        })

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                socket.emit("std_leave_page", { id: params.id, name: location.state.name });
            } else if (document.visibilityState === 'visible') {
                console.log('Page is in the foreground');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleSelectAnswer = (questionIndex, answerId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionIndex]: answerId,
        }));
    };

    const handleSubmit = (exm_end) => {
        let err = false;
        let idx = -1;
        let score = 0;

        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            const selectedAnswer = selectedAnswers[index];

            if ((!selectedAnswer || selectedAnswer.length === 0) && (!exm_end)) {
                err = true;
                idx = index;
                break;
            }

            if (selectedAnswer === item.correctAnswer) {
                score++;
            }
        }

        if (err) {
            toast("توجد اسئلة لم يتم حلها", { className: "hello", type: "warning", autoClose: 1500 });
            questionsRefs.current[idx]?.scrollIntoView({ behavior: "smooth" });
            return;
        }

        const submition = new Promise((resolve) => {
            socket.emit("std_result", { id: params.id, score, total: data.length }, ({ done }) => {
                if (done) {
                    setTimeout(() => {
                        navigate('resultpage', {
                            state: { score, totalQuestions: data.length, name: location.state.name },
                            replace: true,
                        });
                    }, 1000);
                    resolve();
                } else {
                    resolve();
                }
            });
        });

        toast.promise(
            submition,
            {
                pending: "الرجاء الانتظار",
                success: "تم التسليم",
                error: "Promise rejected 🤯",
            },
            { draggable: false, className: "hello", autoClose: 1000 }
        );
    };

    // Block navigation when the user tries to leave the page
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (nextLocation.pathname.includes('/exampage/resultpage')) {
            return false;
        }
        if (bypass.current) {
            socket.emit("std_leave", { id: params.id, name: location.state?.name });
            return false;
        }
        if (stopped) {
            return true;
        }
        const userConfirmed = window.confirm(
            'Are you sure you want to leave the exam? Your progress will be lost.'
        );
        if (userConfirmed) {
            socket.emit("std_leave", { id: params.id, name: location.state?.name });
        }

        return !userConfirmed;
    });

    useEffect(() => {
        return () => blocker.reset?.();
    }, [blocker]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const questionVariants = {
        hidden: { opacity: 0, x: 0 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };
    funRef.current = handleSubmit;

    return (
        <div aria-disabled={stopped} className="min-h-screen  bg-gray-200 overflow-hidden flex flex-col items-center p-6">
            {stopped &&
                <div aria-disabled className='bg-white fixed top-0 h-screen w-screen flex items-center justify-center flex-col '>
                    <h1 className='text-center text-2xl font-bold'>أنت موقوف حالياً</h1>
                    <h2 className='text-center'>Do not leave the page, or you will lose your progress</h2>
                </div>}
            <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-lg">
                <h1 className="text-2xl font-bold text-gray-800">
                    {location.state?.name || 'Exam'}
                </h1>
                <button
                    onClick={() => handleSubmit(false)}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Submit Exam
                </button>
            </header>

            {data.length === 0 ? (
                <p className="mt-12 text-lg text-gray-600">Loading exam questions...</p>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(false);
                    }}
                    className="w-full max-w-4xl mt-8 space-y-8"
                >
                    {data.map((item, index) => (
                        <motion.div
                            key={index}
                            variants={questionVariants}
                            initial="hidden"
                            ref={(el) => (questionsRefs.current[index] = el)}
                            whileInView="visible"
                            viewport={{ once: false }}
                            className="p-6 bg-white shadow-lg rounded-lg border border-gray-200"
                        >
                            {item.image && <img src={`http://${ip}:3000${item.image}`} className='rounded-md shadow-lg mb-4 ' />}
                            <pre className="text-xl text-wrap max-w-full break-words font-semibold text-gray-700 mb-4">
                                {item.title}
                            </pre>
                            <div className="grid gap-4">
                                {item.answers.map((el) => (
                                    <label
                                        key={el.id}
                                        className="flex items-center gap-4 p-4 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                                            checked={selectedAnswers[index] === el.id}
                                            onChange={() => handleSelectAnswer(index, el.id)}
                                        />
                                        <span className="text-gray-700 font-medium">{el.text}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 transition-all"
                    >
                        Submit Answers
                    </button>
                </form>
            )}
            <ToastContainer
                className={"hello"}
                hideProgressBar
                position={"top-center"}
            />
        </div>
    );
}