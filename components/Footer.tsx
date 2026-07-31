import Link from "next/link";
import { Facebook, Instagram, Youtube, MapPin, Mail, Phone, Clock } from "lucide-react";
import type { ContactInformation } from "@/lib/types";

export default function Footer({ contact }: { contact: ContactInformation | null }) {
  return (
    <footer className="mt-16 bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display font-bold text-lg mb-2">
            <span className="text-cream">Engineer</span> <span className="text-gold">Bhai&apos;r</span> <span className="brand-dokan">Dokan</span>
          </h3>
          <p className="text-cream/70 text-sm leading-relaxed">
            Engineer approved, customer loved. Gadgets & accessories, smart solutions, and useful products for everyday life — delivered across Bangladesh.
          </p>
        </div>

        <div>
          <h4 className="spec-readout text-xs text-gold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/products" className="hover:text-gold">All Products</Link></li>
            <li><Link href="/products?sort=newest" className="hover:text-gold">New Arrivals</Link></li>
            <li><Link href="/products?featured=1" className="hover:text-gold">Featured</Link></li>
          </ul>
        </div>

        <div id="contact">
          <h4 className="spec-readout text-xs text-gold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            {contact?.phone && (
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 mt-0.5" />
                <a href={`tel:${contact.phone}`} className="hover:text-gold">{contact.phone}</a>
              </li>
            )}
            {contact?.address && (
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {contact.address}</li>
            )}
            {contact?.email && (
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                <a href={`mailto:${contact.email}`} className="hover:text-gold">{contact.email}</a>
              </li>
            )}
            {contact?.business_hours && Object.keys(contact.business_hours).length > 0 && (
              <li className="flex gap-2">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {Object.entries(contact.business_hours).map(([day, hours]) => (
                    <span key={day} className="block">{day}: {hours}</span>
                  ))}
                </span>
              </li>
            )}
            {!contact?.phone && !contact?.address && !contact?.email && (
              <li className="text-cream/40 text-xs italic">Add your contact details in Admin → Settings</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="spec-readout text-xs text-gold mb-3">Follow Us</h4>
          <div className="flex gap-3">
            {contact?.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cream/10 p-2 hover:bg-gold hover:text-ink transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {contact?.instagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cream/10 p-2 hover:bg-gold hover:text-ink transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {contact?.youtube && (
              <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cream/10 p-2 hover:bg-gold hover:text-ink transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {!contact?.facebook && !contact?.instagram && !contact?.youtube && (
              <p className="text-cream/40 text-xs italic">Add your social links in Admin → Settings</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {contact?.business_name ?? "Engineer Bhai'r Dokan"}. Cash on delivery, nationwide.
      </div>
    </footer>
  );
}
