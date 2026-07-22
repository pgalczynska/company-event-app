# PROJECT.md

# Aplikacja na firmowy wyjazd integracyjny

# Nazwa aplikacji: Forte Trip

## Cel projektu

Celem projektu jest stworzenie prostej aplikacji webowej (PWA) dla uczestników firmowego wyjazdu integracyjnego.

Aplikacja ma być dostępna z poziomu telefonu poprzez jeden wspólny link.

Nie planuję publikacji w App Store ani Google Play.

Aplikacja będzie hostowana na GitHub Pages.

---

# Użytkownicy

Aplikacja jest przeznaczona wyłącznie dla uczestników wyjazdu.

Każdy uczestnik powinien widzieć:

- pełną agendę wydarzeń wspólnych i grupowych,

- własną listę aktywności - wydarzeń wspólnych, grupowych na które się zapisał oraz indywidualnych, tylko dla niego

- informacje organizacyjne.

---

# Logowanie

Każdy uczestnik korzysta z tego samego adresu URL.

Po pierwszym wejściu aplikacja wyświetla ekran logowania.

Użytkownik podaje swój firmowy adres e-mail.

Aplikacja sprawdza, czy taki użytkownik istnieje.

Po poprawnym zalogowaniu:

- zapamiętuje użytkownika na urządzeniu,

- przy kolejnych uruchomieniach loguje go automatycznie,

- umożliwia wylogowanie i zmianę użytkownika

- wyświetla komunikat błędu oraz informację z pomocą, w przypadku gdy nie znaleziono uytkownika.

---

# Główne funkcje

## 1. Agenda

Wyświetlenie wszystkich wydarzeń.

Każde wydarzenie powinno zawierać:

- nazwę

- datę

- godzinę rozpoczęcia

- godzinę zakończenia

- lokalizację

- opis

Agenda powinna być posortowana chronologicznie.

Agenda powinna wyświetlać bieżący dzień, zgodnie z kalendarzem systemu operacyjnego

Agenda powinna mieć możliwość przewijania do konkretnego dnia

Wyjazd odbywa się 11-13.09.2026, obejmuje 3 dni: piątek, sobotę i niedzielę.

---

## 2. Moje aktywności

Wyświetlenie wyłącznie aktywności przypisanych zalogowanemu użytkownikowi.

Każda aktywność powinna zawierać:

- nazwę

- datę

- godzinę rozpoczęcia

- godzinę zakończenia

- lokalizację

- opis

Moje aktywności powinny być posortowana chronologicznie.

Moje aktywności powinny wyświetlać bieżący dzień, zgodnie z kalendarzem systemu operacyjnego

Moje aktywności powinny mieć możliwość przewijania do konkretnego dnia

Wyjazd odbywa się 11-13.09.2026, obejmuje 3 dni: piątek, sobotę i niedzielę.

---

## 3. Informacje

Sekcja z informacjami organizacyjnymi.

Przykładowe informacje:

- mapa hotelu

- hasło do WiFi

- kontakt do organizatorów

- ważne komunikaty

---

# Powiadomienia

Aplikacja ma przypominać użytkownikowi:

- 15 minut przed każdym wydarzeniem wspólnym,

- 15 minut przed każdą aktywnością przypisaną użytkownikowi.

Na obecnym etapie nie przewiduję możliwości wyłączenia powiadomień z poziomu aplikacji.

---

# Dane

Dane powinny być możliwie łatwe do aktualizacji przez organizatorów.

Źródłem danych będzie współdzielony plik Excel przechowywany na OneDrive.

Plik będzie zawierał zakładki:

- Agenda

- Uczestnicy

- Aktywności

- Ustawienia

Claude powinien zaproponować najlepszy sposób wykorzystania tych danych przez aplikację.

---

# Wygląd aplikacji

Interfejs powinien być:

- prosty,

- nowoczesny,

- czytelny,

- zabawny i luźny,

- zoptymalizowany pod telefony

- spełniać zasady WCAG AA.

Preferuję jasny motyw.

Kolory oraz identyfikacja wizualna zostaną dostarczone później.

---

# Technologie

Preferowane technologie:

- HTML

- CSS

- JavaScript

Aplikacja powinna działać jako Progressive Web App (PWA).

Hosting:

GitHub Pages.

---


# Priorytety

Najważniejsze są:

1. Prostota obsługi.

2. Łatwa aktualizacja danych.

3. Działanie na telefonach.

4. Możliwość ponownego wykorzystania aplikacji podczas kolejnych wydarzeń.

---

# Uwagi

Jeżeli podczas implementacji okaże się, że któreś z założeń ograniczają funkcjonalność (np. sposób przechowywania danych lub realizacja powiadomień), Claude powinien przedstawić alternatywne rozwiązania wraz z uzasadnieniem.

# Zasady współpracy z Claude

Pracuj iteracyjnie.

Nie implementuj całej aplikacji jednocześnie.

Najpierw zaproponuj architekturę rozwiązania.

Przed rozpoczęciem implementacji przedstaw plan prac.

Po zakończeniu każdego etapu poczekaj na moją akceptację.

Nie usuwaj istniejącego kodu bez uzasadnienia,

Nie zmieniaj struktury plików bez pytania,

Po każdej większej zmianie uruchom analizę projektu i sprawdź, czy nie pojawiły się błędy,

Jeśli istnieje kilka możliwych rozwiązań, wybierz najprostsze,

Zawsze wyjaśnij, dlaczego wybrałeś dane rozwiązanie,

Zachowuj spójny styl kodowania w całym projekcie.