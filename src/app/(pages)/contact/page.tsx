import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact — ZGNAL.AI',
  description: 'Get in touch with the ZGNAL.AI team.',
};

export default function ContactPage() {
  return <ContactClient />;
}
