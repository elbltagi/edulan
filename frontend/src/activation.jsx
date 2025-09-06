import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const ActivationContext = createContext();

// Provider component
export const ActivationProvider = ({ children }) => {
    const [isActivated, setIsActivated] = useState(false);
    const [machineId, setMachineId] = useState("");

    // Function to check activation status from the server
    const checkActivationStatus = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/is_app_activated"); // Replace with actual endpoint
            const data = await response.json();
            setIsActivated(data.activated);
            setMachineId(data.machineId);
        } catch (error) {
            console.error("Failed to check activation status", error);
        }
    };

    useEffect(() => {
        checkActivationStatus();
    }, []);

    // Function to activate the app (you can modify this logic as needed)
    const activateApp = () => {
        setIsActivated(true);
    };

    // Function to deactivate the app (optional)
    const deactivateApp = () => {
        setIsActivated(false);
    };

    return (
        <ActivationContext.Provider value={{ isActivated, activateApp, deactivateApp, machineId }}>
            {children}
        </ActivationContext.Provider>
    );
};

// Custom hook to use the activation context
export const useActivation = () => {
    const context = useContext(ActivationContext);
    if (!context) {
        throw new Error("useActivation must be used within an ActivationProvider");
    }
    return context;
};

// Export functions explicitly for auto-complete support

