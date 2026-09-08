import { permanentRedirect } from 'next/navigation';

/** Legacy — canonical hub is /kripto */
export default function LegacyCryptoHub() {
  permanentRedirect('/kripto');
}
