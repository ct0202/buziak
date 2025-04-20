import { useTranslation } from "react-i18next";

export default function Policy() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="bg-[#1B1B1B] min-h-screen px-4 pt-[35px] pb-[80px] text-white text-[13px] leading-[18px] w-[100%] mx-auto">
      <div className="max-w-[348px]">
          <>
            <p className="mb-4 font-bold">1. Regulamin użytkowania</p>
            <p className="mt-2">1. Regulamin użytkowania</p>
            <p className="mb-2">
              Niniejszy regulamin określa zasady korzystania z aplikacji
              randkowej, skierowanej do użytkowników na terenie Polski.
              Korzystając z aplikacji, użytkownik akceptuje poniższe zasady.
            </p>
            <p className="mt-2 ">1.1. Opis aplikacji:</p>
            <p className="mb-2">
              - Aplikacja służy do nawiązywania kontaktów między użytkownikami w
              celach towarzyskich lub randkowych.
              <br />- Aplikacja oferuje funkcje takie jak: przesuwanie profili
              (suwanie), czat, publikowanie postów, system weryfikacji, system
              donacji, zakup waluty wewnętrznej.
            </p>
            <p className="mt-2">1.2. Konto użytkownika:</p>
            <p className="mb-2">
              - Rejestracja wymaga podania podstawowych danych oraz akceptacji
              regulaminu.
              <br />- Konto może zostać zweryfikowane poprzez przesłanie zdjęcia
              twarzy z podpisaną kartką. Po zatwierdzeniu, użytkownik otrzymuje
              status „Profil zweryfikowany”.
              <br />- Tylko osoby powyżej 18. roku życia mogą korzystać z
              aplikacji.
            </p>
            <p className="mt-2 ">1.3. Wersja darmowa i płatna:</p>
            <p className="mb-2">
              - Kobiety mają pełny dostęp do funkcji aplikacji bez opłat, po
              weryfikacji.
              <br />- Mężczyźni mają ograniczony dostęp w wersji darmowej.
              <br />- Subskrypcja płatna odblokowuje pełny dostęp.
            </p>
            <p className="mt-2 ">1.4. Waluta wewnętrzna:</p>
            <p className="mb-2">
              - Użytkownicy mogą kupować walutę wewnętrzną za pomocą systemu
              płatności Stripe.
              <br />- Walutę można wykorzystać do: wysyłania wiadomości bez
              dopasowania i odblokowywania dodatkowych funkcji.
            </p>
            <p className="mt-2">1.5. Treści i publikacje:</p>
            <p className="mb-2">
              - Publikowanie postów jest możliwe po uiszczeniu opłaty.
              <br />- Pierwszy post oraz jeden darmowy post tygodniowo są
              dostępne bezpłatnie.
              <br />- Inni użytkownicy mogą polubić lub skomentować post –
              maksymalnie 10 razy dziennie w wersji darmowej.
            </p>
            <p className="mt-2">1.6. Czat:</p>
            <p className="mb-2">
              - Rozmowa rozpoczyna się po dopasowaniu lub po skorzystaniu z
              płatnej wersji aplikacji.
              <br />- Możliwość wysyłania wiadomości tekstowych, głosowych,
              zdjęć i filmów (do 1 minuty).
              <br />- Wiadomości są oznaczane kolorystycznie (np. mężczyzna –
              niebieski, kobieta – różowy).
              <br />- Zdjęcia i filmy są jednorazowe i automatycznie znikać po
              obejrzeniu.
            </p>
            <p className="mt-2">1.7. Zgłoszenia i moderacja:</p>
            <p className="mb-2">
              - Użytkownik może zgłosić profil, post lub wiadomość naruszającą
              regulamin.
              <br />- Administrator ma prawo zablokować konto użytkownika lub
              usunąć treści.
              <br />- Użytkownik może zostać poinformowany o powodach odrzucenia
              weryfikacji lub zablokowania.
            </p>
            <p className="mb-4 mt-4 font-bold">Polityka prywatności</p>
            <p className="mt-2">2.1. Gromadzone dane:</p>
            <p className="mb-2">
              - Dane podawane dobrowolnie (imię, adres e-mail, zdjęcia, data
              urodzenia, opis profilu).
              <br />- Dane techniczne: adres IP, pliki cookies, dane o
              urządzeniu i lokalizacji.
            </p>
            <p className="mt-2">2.2. Cel przetwarzania:</p>
            <p className="mb-2">
              - Świadczenie usług aplikacji.
              <br />
              - Weryfikacja tożsamości.
              <br />
              - Obsługa płatności.
              <br />
              - Zapewnienie bezpieczeństwa użytkowników.
              <br />
            </p>
            <p className="mt-2">2.3. Prawa użytkownika:</p>
            <p className="mb-2">
              - Prawo dostępu do danych i ich poprawiania.
              <br />
              - Prawo do ograniczenia przetwarzania i przenoszenia danych.
              <br />- Prawo wniesienia sprzeciwu wobec przetwarzania.
            </p>
            <p className="mt-2">2.4. Udostępnianie danych:</p>
            <p className="mb-2">
              - Dane mogą być przekazywane partnerom technologicznym, np. do
              obsługi płatności. <br />- Nie przekazujemy danych osobowych
              osobom trzecim bez podstawy prawnej.
            </p>
            <p className="mt-2">2.5. Ochrona danych:</p>
            <p className="mb-2">
              - Dane są zabezpieczone technicznie i organizacyjnie.
              <br />- Stosujemy szyfrowanie, kontrolę dostępu i inne środki
              bezpieczeństwa.
            </p>
            <p className="mt-2">2.6. Pliki cookies:</p>
            <p className="mb-2">
              - Aplikacja korzysta z plików cookies do analizy statystyk,
              logowania oraz personalizacji treści.
              <br />- Użytkownik może zarządzać plikami cookies w ustawieniach
              przeglądarki.
            </p>
          </>
      </div>
    </div>
  );
}
