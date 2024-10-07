import { createThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
const secretKey = import.meta.env.VITE_THIRDWEB_SECRET_KEY;

if (!clientId) {
    throw new Error("Missing clientId");
}
const client = createThirdwebClient({ clientId: clientId });

export default client;
