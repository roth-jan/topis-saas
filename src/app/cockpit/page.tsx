import type { Metadata } from 'next';
import { CockpitWorkspace } from '@/components/cockpit/CockpitWorkspace';

export const metadata: Metadata = {
  title: 'Prozessmodell-Cockpit — TOPIS',
  description:
    'Prozessmodell live rechnen und pflegen: Excel laden, Mengen und Parameter editieren, MA-Stundenbedarf und Trend im Blick — mit Excel-Roundtrip.',
};

export default function CockpitPage() {
  return <CockpitWorkspace />;
}
