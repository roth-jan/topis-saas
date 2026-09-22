import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { ANBIETER } from '@/lib/kontakt';

export const metadata: Metadata = { title: 'Datenschutzerklärung · TOPIS' };

// Aufbau wie roth-logistikberatung.de/datenschutz, beschreibt NUR den tatsächlichen Stack
// (Stand 22.09.2026, per grep geprüft): statischer Export auf Hetzner (Nürnberg), keine Cookies,
// kein Tracking, Schriften selbst gehostet (next/font), Hallen-Check ohne Netzwerkaufruf.
// Externe Dienste nur: Supabase (Login/Cloud, eu-central-1) und OpenAI gpt-4o-mini über die
// Edge Function nl-to-layout (KI-Hallenbau). Kommt ein Dienst dazu → hier ergänzen.
export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung" stand="September 2026">
      <h2 className="!mt-0">1. Verantwortliche Stelle</h2>
      <p>Verantwortlich für die Datenverarbeitung in dieser Anwendung im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
      <p>
        {ANBIETER.name}<br />
        {ANBIETER.strasse}<br />
        {ANBIETER.ort}<br />
        Telefon: {ANBIETER.telefon}<br />
        E-Mail: <a href={`mailto:${ANBIETER.email}`}>{ANBIETER.email}</a>
      </p>
      <p>Vertreten durch die Geschäftsführer {ANBIETER.geschaeftsfuehrer}.</p>

      <h2>2. Das Wichtigste in Kürze</h2>
      <ul>
        <li><strong>Hallen-Check, Prozessmodell und Hallenplan laufen vollständig in Ihrem Browser.</strong> Hochgeladene Scandaten, Eckdaten und Hallenpläne werden nicht an uns übertragen.</li>
        <li>Es werden <strong>keine Cookies</strong> gesetzt und <strong>keine Analyse-, Tracking- oder Werbedienste</strong> eingesetzt.</li>
        <li>Personenbezogene Daten verarbeiten wir nur, wenn Sie ein <strong>Benutzerkonto</strong> anlegen, die <strong>KI-Beschreibung</strong> einer Halle nutzen oder uns <strong>per E-Mail</strong> schreiben – sowie in Form technisch notwendiger Server-Logfiles.</li>
      </ul>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>
        Diese Anwendung wird bei der Hetzner Online GmbH, Industriestraße 25, 91710 Gunzenhausen, auf Servern in
        Deutschland (Nürnberg) betrieben. Beim Aufruf erhebt der Webserver automatisch Informationen, die Ihr Browser
        übermittelt (Server-Logfiles):
      </p>
      <ul>
        <li>IP-Adresse des zugreifenden Geräts</li>
        <li>Browsertyp und Browserversion, verwendetes Betriebssystem</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>aufgerufene Seite bzw. Datei und Referrer-URL</li>
      </ul>
      <p>
        Diese Daten werden nicht mit anderen Datenquellen zusammengeführt und nicht zur Identifizierung einzelner
        Personen verwendet. Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO; unser berechtigtes
        Interesse liegt in einem stabilen und sicheren Betrieb. Die Logfiles werden nur so lange gespeichert, wie es
        für Betrieb und Sicherheit erforderlich ist, und anschließend gelöscht.
      </p>

      <h2>4. SSL- bzw. TLS-Verschlüsselung</h2>
      <p>
        Die Anwendung nutzt eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie am
        „https://“ und am Schloss-Symbol in der Adresszeile Ihres Browsers. Daten, die Sie übermitteln, können dann
        nicht von Dritten mitgelesen werden.
      </p>

      <h2>5. Speicherung in Ihrem Browser</h2>
      <p>
        Damit Ihre Arbeit einen Seitenwechsel oder Neustart übersteht, speichert TOPIS Hallenpläne, Betriebsdaten,
        Prozessmodell-Einstellungen und die gewählte Darstellung (hell/dunkel) im lokalen Speicher Ihres Browsers
        (localStorage). Diese Daten verlassen Ihr Gerät nicht und sind für uns nicht einsehbar. Die Speicherung ist
        für die von Ihnen gewünschte Funktion unbedingt erforderlich (§&nbsp;25 Abs.&nbsp;2 Nr.&nbsp;2 TDDDG). Sie
        können die Daten jederzeit über die Einstellungen Ihres Browsers („Websitedaten löschen“) entfernen.
      </p>

      <h2>6. Benutzerkonto und Cloud-Speicherung (freiwillig)</h2>
      <p>
        Für die Nutzung von TOPIS ist kein Konto nötig. Wenn Sie freiwillig ein Konto anlegen, um Hallen in der Cloud
        zu speichern oder mit Kollegen zu teilen, verarbeiten wir Ihre E-Mail-Adresse, ein verschlüsseltes Passwort,
        optional Ihren Anzeigenamen sowie die von Ihnen gespeicherten Hallenpläne und Freigaben. Nach der Anmeldung
        legt der Login-Dienst ein Anmelde-Token im lokalen Speicher Ihres Browsers ab.
      </p>
      <p>
        Dafür setzen wir den Dienst Supabase (Supabase Inc., USA) als Auftragsverarbeiter ein. Die Daten werden in
        einem Rechenzentrum in Frankfurt am Main gespeichert. Soweit dabei ein Zugriff aus den USA nicht
        ausgeschlossen werden kann, erfolgt dieser auf Grundlage der EU-Standardvertragsklauseln.
      </p>
      <p>
        Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO (Bereitstellung des von Ihnen gewünschten
        Kontos). Die Daten bleiben gespeichert, bis Sie Ihr Konto löschen lassen; eine formlose E-Mail an{' '}
        <a href={`mailto:${ANBIETER.email}`}>{ANBIETER.email}</a> genügt.
      </p>

      <h2>7. Halle per Beschreibung bauen (KI-Funktion, freiwillig)</h2>
      <p>
        Im Hallenplan können Sie eine Halle in eigenen Worten beschreiben (z.&nbsp;B. „Halle 120 × 40 m, 30 Tore
        Nordseite“). Nur wenn Sie diese Funktion nutzen, wird der eingegebene Text über unseren Server bei Supabase
        an die OpenAI Ireland Ltd., 1st Floor, The Liffey Trust Centre, 117–126 Sheriff Street Upper, Dublin 1,
        Irland, übermittelt. Das KI-Modell liefert daraus nur die Maße der Halle zurück; der Hallenplan selbst wird
        in Ihrem Browser erzeugt. Eine Verarbeitung durch die Muttergesellschaft in den USA kann nicht
        ausgeschlossen werden; sie erfolgt auf Grundlage der EU-Standardvertragsklauseln.
      </p>
      <p>
        Bitte geben Sie in dieses Feld <strong>keine personenbezogenen Daten</strong> ein. Rechtsgrundlage ist
        Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO; unser berechtigtes Interesse liegt darin, Ihnen die gewünschte
        Funktion bereitzustellen.
      </p>

      <h2>8. Kontakt per E-Mail</h2>
      <p>
        Wenn Sie uns per E-Mail schreiben, verarbeiten wir Ihre Angaben, um Ihre Anfrage zu beantworten. Der Knopf
        „Gespräch anfragen“ im Hallen-Check öffnet lediglich Ihr eigenes E-Mail-Programm mit einem vorausgefüllten
        Text (inklusive der Kurzbewertung Ihrer Halle); ob und was Sie senden, entscheiden Sie selbst. Weitere
        Ergebnisse werden nicht übertragen. Für den Empfang nutzen wir Microsoft&nbsp;365 der Microsoft
        Ireland Operations Limited als Auftragsverarbeiter. Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b
        DSGVO bei vertragsbezogenen Anfragen, sonst Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO. Wir löschen die
        Daten, wenn die Anfrage erledigt ist und keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
      </p>

      <h2>9. Keine Cookies, kein Tracking, keine externen Dienste beim Aufruf</h2>
      <ul>
        <li>Es werden <strong>keine Cookies</strong> gesetzt; ein Cookie-Banner ist daher nicht erforderlich.</li>
        <li>Es kommen <strong>keine Webanalyse-Dienste</strong> (z.&nbsp;B. Google Analytics), <strong>keine Tag-Manager</strong> und <strong>kein Profiling</strong> zum Einsatz.</li>
        <li>Schriftarten werden von unserem eigenen Server ausgeliefert; es werden <strong>keine externen Schriftarten-, Karten- oder Captcha-Dienste</strong> nachgeladen.</li>
      </ul>

      <h2>10. Ihre Rechte</h2>
      <p>Im Rahmen der gesetzlichen Bestimmungen haben Sie jederzeit das Recht auf:</p>
      <ul>
        <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art.&nbsp;15 DSGVO)</li>
        <li><strong>Berichtigung</strong> unrichtiger Daten (Art.&nbsp;16 DSGVO)</li>
        <li><strong>Löschung</strong>, soweit keine Aufbewahrungspflichten entgegenstehen (Art.&nbsp;17 DSGVO)</li>
        <li><strong>Einschränkung der Verarbeitung</strong> (Art.&nbsp;18 DSGVO)</li>
        <li><strong>Datenübertragbarkeit</strong> (Art.&nbsp;20 DSGVO)</li>
        <li><strong>Widerspruch</strong> gegen Verarbeitungen auf Grundlage von Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (Art.&nbsp;21 DSGVO)</li>
      </ul>
      <p>
        Wenden Sie sich dazu an die oben genannte verantwortliche Stelle. Außerdem haben Sie das Recht, sich bei
        einer Datenschutz-Aufsichtsbehörde zu beschweren. Für uns zuständig ist die Landesbeauftragte für
        Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2–4, 40213 Düsseldorf.
      </p>

      <h2>11. Aktualität</h2>
      <p>
        Es gilt die jeweils aktuelle, in dieser Anwendung veröffentlichte Fassung. Wenn wir TOPIS weiterentwickeln
        oder sich rechtliche Vorgaben ändern, passen wir diese Datenschutzerklärung an.
        Siehe auch unser <Link href="/impressum">Impressum</Link>.
      </p>
    </LegalPage>
  );
}
