import { getSiteSettings, whatsappDigits } from "@/lib/site/settings";

import ContactForm from "./contact-form";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { store } = settings;
  return <ContactForm email={store.contactEmail} phone={store.contactPhone} whatsapp={whatsappDigits(settings)} address={store.address} />;
}
