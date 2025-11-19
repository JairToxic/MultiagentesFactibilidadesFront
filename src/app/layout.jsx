// app/layout.jsx
import "./globals.css"; // o el CSS global que tengas
import Providers from "./providers";

export const metadata = {
  title: "Multiagentes",
  description: "Sistema de tickets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
