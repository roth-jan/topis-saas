import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { ANBIETER } from '@/lib/kontakt';

export const metadata: Metadata = { title: 'Impressum · TOPIS' };

// Angaben gemäß § 5 DDG — Firmendaten aus dem Impressum auf ntc.software.
export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <h2 className="!mt-0">Anbieter</h2>
      <p>
        <strong>{ANBIETER.name}</strong><br />
        {ANBIETER.strasse}<br />
        {ANBIETER.ort}<br />
        Deutschland
      </p>

      <h2>Vertreten durch</h2>
      <p>Die Geschäftsführer {ANBIETER.geschaeftsfuehrer}</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={ANBIETER.telefonHref}>{ANBIETER.telefon}</a><br />
        E-Mail: <a href={`mailto:${ANBIETER.email}`}>{ANBIETER.email}</a><br />
        Web: <a href={`https://${ANBIETER.web}`}>{ANBIETER.web}</a>
      </p>

      <h2>Registereintrag</h2>
      <p>
        Registergericht: {ANBIETER.registergericht}<br />
        Registernummer: {ANBIETER.hrb}
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
        {ANBIETER.ustId}
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>Jan Hendrik Roth, Anschrift wie oben</p>

      <h2>Fachliche Methodik</h2>
      <p>
        Das Prozessmodell, die Kennzahlen und die Vergleichswerte in TOPIS stammen aus der Projektarbeit der
        ROTH Logistikberatung &amp; Software GmbH, Lanterstraße 9, 46539 Dinslaken.
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Haftung für Inhalte und Links</h2>
      <p>
        Die Ergebnisse in TOPIS (z.&nbsp;B. Minuten pro Colli, Personalbedarf, Vergleich mit anderen Hallen)
        sind Modellrechnungen auf Grundlage Ihrer Eingaben. Sie ersetzen keine Beratung im Einzelfall.
        Für die Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine Gewähr.
      </p>
      <p>
        Für die Inhalte von Internetseiten, auf die diese Anwendung direkt oder indirekt verweist, übernehmen wir
        keine Haftung. Für den Inhalt verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Texte, Grafiken, Berechnungsmodelle und die Software TOPIS unterliegen dem Urheberrecht und anderen
        Schutzgesetzen. Vervielfältigung, Bearbeitung, Verbreitung und jede Verwertung außerhalb der Grenzen des
        Urheberrechts bedürfen der vorherigen schriftlichen Zustimmung der {ANBIETER.name}.
      </p>
    </LegalPage>
  );
}
