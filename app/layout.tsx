import type { Metadata } from "next";
import { Baloo_2, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { CartProvider } from "@/lib/cart/CartContext";
import { headers } from "next/headers";
import { getContactInfo } from "@/lib/queries";
import { getCurrentCustomer } from "@/lib/customer/auth";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", weight: ["500", "600", "700", "800"] });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-worksans", weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plexmono", weight: ["400", "500", "600"] });

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContactInfo();

  return {
    title: "Engineer Bhai'r Dokan — Engineer Approved, Customer Loved",
    description:
      "Gadgets, smart solutions and everyday useful products — trusted quality, fast delivery across Bangladesh. Cash on delivery.",
    icons: contact?.logo_url
      ? { icon: contact.logo_url, shortcut: contact.logo_url, apple: contact.logo_url }
      : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const contact = await getContactInfo();
  const customer = await getCurrentCustomer();
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="en" className={`${baloo.variable} ${workSans.variable} ${plexMono.variable}`}>
      <body className="font-body antialiased flex min-h-screen flex-col">
        <CartProvider>
          {!isAdminRoute && <Header contact={contact} customerName={customer?.name ?? null} />}
          <main className="flex-1">{children}</main>
          {!isAdminRoute && <Footer contact={contact} />}
          {!isAdminRoute && <WhatsAppFloatButton whatsapp={contact?.whatsapp ?? null} />}
        </CartProvider>
      </body>
    </html>
  );
}
