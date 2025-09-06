export default function ResultCard({ name, score, totalQuestions }) {
    // Function to determine the background and text color based on the score percentage
    const getResultColor = () => {
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (percentage >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    return (
        <div
            className={`p-6 shadow-lg rounded-lg border-2 ${getResultColor()} transition-transform transform hover:scale-105 hover:shadow-xl`}
        >
            <h2 className="text-2xl font-bold mb-3">{name}</h2>
            <p className="text-lg font-semibold">
                Score: <span className="font-bold">{score}</span> / {totalQuestions}
            </p>
        </div>
    );
}