import { useState, useEffect, useRef } from "react";
import { EllipsisVertical } from "lucide-react";

export default function StdCard({ student, index, onSubmit, onLeave, onStop }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null); // Ref for the menu
    const dotsRef = useRef(null); // Ref for the three dots button

    // Toggle menu visibility
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the menu and the three dots button
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                dotsRef.current &&
                !dotsRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        // Add event listener when the menu is open
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup the event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]); // Re-run effect when isMenuOpen changes

    return (
        <tr
            key={index}
            className={`${index % 2 !== 0 ? "bg-[#f7fcfd]" : "bg-white"} relative`}
        >
            <td className="py-4 px-6 text-sm font-medium text-gray-800">
                <div
                    ref={dotsRef} // Attach ref to the three dots button
                    className="rounded-full w-[30px] h-[30px] hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-all"
                    onClick={toggleMenu}
                >
                    <EllipsisVertical />
                </div>
            </td>
            <td className="py-4 px-6 text-sm text-gray-700">
                {student.name}
            </td>
            <td className="py-4 px-6 text-sm text-gray-700">
                {student.result ?? "Not Available"}
            </td>
            <td className="py-4 px-6">
                <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold tracking-wide ${student.isInExam
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {student.isInExam ? "In Exam" : "Finished"}
                </span>
            </td>

            {/* Menu */}

            {isMenuOpen && (
                <div
                    ref={menuRef} // Attach ref to the menu
                    className="absolute p-3 bg-white rounded-lg shadow-lg top-10 left-10 flex flex-col gap-2 z-50 border border-gray-100"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside the menu from closing it
                >
                    <button
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                        onClick={() => {
                            onSubmit(student.id)
                            setIsMenuOpen(false); // Close the menu
                        }}
                    >
                        Submit
                    </button>
                    <button
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                        onClick={() => {
                            onLeave(student.id);
                            setIsMenuOpen(false); // Close the menu
                        }}
                    >
                        Leave
                    </button>
                    <button
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                        onClick={() => {
                            onStop(student.id);
                            setIsMenuOpen(false); // Close the menu
                        }}
                    >
                        {student.stopped ? "Cancel Stopping" : "Stop"}
                    </button>
                </div>
            )}

        </tr>
    );
}