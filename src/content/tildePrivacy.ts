// /tilde/privacy and /pt/tilde/privacy: what Tilde stores and when anything leaves the phone, in
// plain words. Every statement is checked against the app's code and holds for Tilde 1.1; don't add
// one that isn't. Portuguese is European Portuguese (pt-PT), informal "tu", like the /tilde page.
import type { Locale } from '../i18n'

const repo = 'https://github.com/tbutman/tilde'

const en = {
  status: 'privacy · tilde 1.1 for android',
  name: 'Tilde',
  headline: ['Your details', 'stay on your phone.'],
  lede: 'Tilde has no account, no internet and no tracking. This is what it stores, where, and when anything leaves your phone.',
  sections: [
    {
      heading: 'what the app can do',
      points: [
        'Tilde asks for two permissions: NFC and vibration. It has no internet permission, so it can’t send anything anywhere.',
        'No analytics, no ads, no accounts and no tracking. The app writes no logs of your details.',
      ],
    },
    {
      heading: 'what stays on your phone',
      points: [
        'Your card details, your photo and your Met list are stored only on your phone. Tilde opts out of Android’s cloud backup.',
        'Uninstalling Tilde removes everything from the phone.',
      ],
    },
    {
      heading: 'when something leaves your phone',
      points: [
        'Nothing leaves your phone until you share it: when you tap phones, when someone scans your code, or when you use Send.',
        'A tap or the QR code never includes your photo.',
        '**Guest Wi-Fi:** the password is stored only on your phone, but the Wi-Fi code contains it. Anyone who scans it, or taps your phone while you share it, can join your network.',
      ],
    },
    {
      heading: 'how you can check',
      points: [
        `The code is open source under the MIT licence, so anyone can read what the app does: [source on GitHub](${repo}).`,
        'Every release is built from the public code and signed with the same key.',
      ],
    },
    {
      heading: 'this website',
      points: ['0 cookies and 0 trackers.'],
    },
  ],
  ctaText: 'Tilde is free and open source.',
  backLink: { label: 'back to tilde', to: '/tilde' },
  sourceLink: { label: 'source on github', href: repo },
}

export type TildePrivacyText = typeof en

const pt: TildePrivacyText = {
  status: 'privacidade · tilde 1.1 para android',
  name: 'Tilde',
  headline: ['Os teus dados', 'ficam no teu telemóvel.'],
  lede: 'A Tilde não tem conta, nem internet, nem rastreio. Aqui está o que guarda, onde, e quando é que alguma coisa sai do teu telemóvel.',
  sections: [
    {
      heading: 'o que a app pode fazer',
      points: [
        'A Tilde pede duas permissões: NFC e vibração. Não tem permissão de acesso à internet, por isso não consegue enviar nada para lado nenhum.',
        'Sem estatísticas, sem anúncios, sem contas e sem rastreio. A app não guarda registos (logs) dos teus dados.',
      ],
    },
    {
      heading: 'o que fica no teu telemóvel',
      points: [
        'Os dados do teu cartão, a tua fotografia e a tua lista Met ficam guardados apenas no teu telemóvel. A Tilde fica de fora das cópias de segurança na nuvem do Android.',
        'Desinstalar a Tilde apaga tudo do telemóvel.',
      ],
    },
    {
      heading: 'quando alguma coisa sai do teu telemóvel',
      points: [
        'Nada sai do teu telemóvel até o partilhares: quando encostas os telemóveis, quando alguém lê o teu código ou quando usas o Send.',
        'Um toque ou o código QR nunca incluem a tua fotografia.',
        '**Wi-Fi para convidados:** a palavra-passe fica guardada apenas no teu telemóvel, mas o código do Wi-Fi contém-na. Quem o ler, ou encostar ao teu telemóvel enquanto o partilhas, pode ligar-se à tua rede.',
      ],
    },
    {
      heading: 'como podes confirmar',
      points: [
        `O código é aberto, com licença MIT, por isso qualquer pessoa pode ler o que a app faz: [código no GitHub](${repo}).`,
        'Cada versão é compilada a partir do código público e assinada com a mesma chave.',
      ],
    },
    {
      heading: 'este site',
      points: ['0 cookies e 0 rastreadores.'],
    },
  ],
  ctaText: 'A Tilde é grátis e de código aberto.',
  backLink: { label: 'voltar à tilde', to: '/pt/tilde' },
  sourceLink: { label: 'código no github', href: repo },
}

export const tildePrivacyText: Record<Locale, TildePrivacyText> = { en, pt }
