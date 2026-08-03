import { permanentRedirect } from 'next/navigation';

/** Legacy path — Balina & Takas artık /whales */
export default function SmartMoneyRedirect() {
  permanentRedirect('/whales');
}
