import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { EllipsisVertical } from "lucide-react";
import StdCard from "../components/StdCard";
import { useLocation, useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import { socket } from "../socket";
import useLocalIPAddress from "../hooks/getIpAdress";

export default function HostingPage() {
  const [students, setStudents] = useState([]);
  const examTitle = "Math Exam"; // Example exam title
  const location = useLocation();
  const [ip, setIp] = useState("");
  const [finished, setFinished] = useState(false);
  const navigate = useNavigate();

  // Fetch IP address
  useEffect(() => {
    fetch("http://localhost:3000/api/ip")
      .then((response) => response.json())
      .then((data) => setIp(data.ip))
      .catch((error) => console.error("Error fetching IP:", error));
  }, []);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.off("std_join").on("std_join", (data) => {
      setStudents((stds) => [
        ...stds,
        { name: data.name, result: null, isInExam: true, id: data.id, stopped: false },
      ]);
      toast.success(`${data.name} joined`);
    });

    socket.off("std_leave_page").on("std_leave_page", (data) => {
      toast.warn(`${data.name} left the page`, { theme: "colored" });
    });

    socket.on("std_result", (data) => {
      setStudents((stds) =>
        stds.map((std) =>
          std.id === data.id ? { ...std, result: data.score, isInExam: false } : std
        )
      );
    });

    socket.off("std_leave").on("std_leave", (e) => {
      toast.error(`${e.name} left`, { autoClose: 800 });
      setTimeout(() => {
        setStudents((stds) => stds.filter((std) => std.id !== e.id));
      }, 800);
    });

    return () => {
      socket.close();
    };
  }, []);

  const finish = () => {
    if (confirm("Are you sure you want to finish the exam?")) {
      socket.emit("exm_finish");
      setFinished(true);
    }
  };

  const handleStdFinish = (id) => {
    socket.emit("std_finish_id", { id });
  };

  const handleStdLeave = (id) => {
    socket.emit("std_leave_id", { id });
  };

  const handleStdStop = (id) => {
    socket.emit("std_stop_id", { id });
    setStudents((prev) =>
      prev.map((std) =>
        std.id === id ? { ...std, stopped: !std.stopped } : std
      )
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col items-center py-10 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Exam Info</h2>
        <p className="text-lg font-semibold">{location.state.title || examTitle}</p>

        <div className="mt-4 p-2 bg-white rounded-lg text-indigo-700 font-bold text-center">
          {ip ? `http://${ip}:3000/` : "Loading..."}
        </div>

        {ip && (
          <div className="mt-4 p-2 bg-white rounded-xl shadow-md">
            <QRCodeCanvas
              value={`http://${ip}:3000/`}
              size={150}
              bgColor="#ffffff"
              fgColor="#000000"
              className="rounded-lg"
            />
          </div>
        )}
        {!finished ?
          <button
            onClick={finish}
            className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 transition-all"
          >
            Finish Exam
          </button> : <button
            onClick={() => navigate("/admin/createnew")}
            className="mt-6 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-blue-300 transition-all"
          >
            Go to Dashboard
          </button>
        }
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-scroll p-10">
        <div className="max-w-6xl mx-auto">
          <div className="shadow-lg bg-white ">
            <table className="min-w-full divide-y  divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-medium uppercase">#</th>
                  <th className="py-3 px-6 text-left text-sm font-medium uppercase">
                    Student Name
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium uppercase">
                    Result
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium uppercase">
                    Status
                  </th>

                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-gray-600 text-lg font-medium"
                    >
                      Waiting for students...
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <StdCard
                      key={student.id}
                      student={student}
                      onSubmit={handleStdFinish}
                      onLeave={handleStdLeave}
                      onStop={handleStdStop}
                      index={index}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer
        hideProgressBar
        position="bottom-right"
        theme="colored"
        className="hello"
      />
    </div>
  );
}