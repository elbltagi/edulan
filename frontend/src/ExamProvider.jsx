import React, { createContext, useContext, useState } from "react";

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]); // تخزين الأسئلة بشكل مستمر

    return (
        <ExamContext.Provider value={{ questions, setQuestions }}>
            {children}
        </ExamContext.Provider>
    );
};

export const useExam = () => useContext(ExamContext);
