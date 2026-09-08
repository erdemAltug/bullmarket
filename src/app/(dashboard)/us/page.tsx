import { permanentRedirect } from 'next/navigation';

/** Legacy — canonical hub is /nasdaq */
export default function LegacyUsHub() {
  permanentRedirect('/nasdaq');
}
