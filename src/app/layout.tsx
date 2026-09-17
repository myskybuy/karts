import type { Metadata } from "next";
import AppToaster from "@/components/AppToaster";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karts — Fashion, Footwear & Accessories",
  description:
    "Your one-stop shop for fashion, footwear & accessories — men's & women's clothing, shoes, bags, jewellery and more, with INR pricing and Cash on Delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body>
        <CartProvider>
          <WishlistProvider>
            {children}
            <AppToaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
