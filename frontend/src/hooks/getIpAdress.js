import { useEffect, useState } from "react";

const useLocalIPAddress = () => {
    const [ipAddress, setIpAddress] = useState(null);

    useEffect(() => {
        const getLocalIP = async () => {
            let localIP = null;

            const pc = new RTCPeerConnection();
            pc.createDataChannel("");

            // Handle ICE candidate event
            pc.onicecandidate = (event) => {
                if (!event || !event.candidate) return;

                const candidate = event.candidate.candidate;

                // Extract the IP address using regex
                const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
                const match = ipRegex.exec(candidate);
                if (match) {
                    const ip = match[0];

                    // Filter out non-primary IPs like 192.168.137.x or local IP ranges
                    if (!ip.startsWith("192.168.137.") && !ip.startsWith("169.254.")) {
                        localIP = ip;
                        setIpAddress(localIP);

                        // Close the connection once IP is retrieved
                        pc.close();
                    }
                }
            };

            // Trigger ICE candidate generation by creating an offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
        };

        getLocalIP();
    }, []);

    return ipAddress;
};

export default useLocalIPAddress;