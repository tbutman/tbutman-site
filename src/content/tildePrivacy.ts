// /tilde/privacy and /pt/tilde/privacy: what Tilde stores and when anything leaves the phone, in
// plain words. Every statement is checked against the app's code and holds for Tilde 1.3; don't add
// one that isn't. Portuguese is European Portuguese (pt-PT), informal "tu", like the /tilde page.
import type { Locale } from '../i18n'

const repo = 'https://github.com/tbutman/tilde'

const en = {
  status: 'privacy · tilde 1.3 for android',
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
        'Your cards, their photos and your Met list are stored only on your phone. Tilde opts out of Android’s cloud backup.',
        'A backup is a file saved wherever you choose. It isn’t encrypted, so keep it somewhere private. The Guest Wi-Fi password is only included if you check it.',
        '**Delete all data** (Settings → About, from the gear on the Cards tab) removes everything from the phone, as uninstalling Tilde would.',
      ],
    },
    {
      heading: 'when something leaves your phone',
      points: [
        'Nothing leaves your phone until you share it: when you tap phones, when someone scans your code, or when you use Send.',
        'A contact card you Send includes your photo only if you switch on **Include your photo when you send your contact card** (Settings → Sharing). It’s off by default, and a tap or the code never includes it.',
        '**iPhones and the contact link:** a tap with your contact card also carries a link to taptilde.com/c, with the details on your contact card written into the link after a #. An iPhone opens it to show your contact and save it. Browsers never send the part after the #, so neither Cloudflare nor this website receives your details: the page reads them on the other person’s phone, makes no other requests and stores nothing. Anyone who has the link can read it, as with the contact card itself.',
        'By default, Tilde only answers taps while it’s on screen. **Answer taps when Tilde is closed** (off by default) lets it answer while the phone is unlocked. Taps are never answered from the lock screen.',
        '**Guest Wi-Fi:** the password is stored only on your phone, but the Wi-Fi code contains it. Anyone who scans it, or taps your phone while you share it, can join your network.',
      ],
    },
    {
      heading: 'how you can check',
      points: [
        `The code is open source under the MIT license, so anyone can read what the app does: [source on GitHub](${repo}).`,
        'Every release is built from the public code and signed with the same key.',
      ],
    },
    {
      heading: 'this website',
      points: [
        '0 cookies and 0 trackers.',
        'The contact page (taptilde.com/c) is logged like any page: the time, the visitor’s IP address and browser, never the details in the link.',
      ],
    },
  ],
  ctaText: 'Tilde is free and open source.',
  backLink: { label: 'back to tilde', to: '/tilde' },
  sourceLink: { label: 'source on github', href: repo },
}

export type TildePrivacyText = typeof en

const pt: TildePrivacyText = {
  status: 'privacidade · tilde 1.3 para android',
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
        'Os teus cartões, as fotografias deles e a tua lista Conhecidos ficam guardados apenas no teu telemóvel. A Tilde fica de fora das cópias de segurança na nuvem do Android.',
        'Uma cópia de segurança é um ficheiro guardado onde escolheres. Não é encriptado, por isso guarda-o num sítio privado. A palavra-passe do Wi-Fi para convidados só é incluída se a marcares.',
        '**Apagar todos os dados** (Definições → Acerca de, na roda dentada do separador Cartões) apaga tudo do telemóvel, como se desinstalasses a Tilde.',
      ],
    },
    {
      heading: 'quando alguma coisa sai do teu telemóvel',
      points: [
        'Nada sai do teu telemóvel até o partilhares: quando encostas os telemóveis, quando alguém lê o teu código ou quando usas Enviar.',
        'Um cartão de contacto que envias com Enviar só inclui a tua fotografia se ligares **Incluir a tua fotografia quando envias o teu cartão de contacto** (Definições → Partilha). Está desligado por defeito, e um toque ou o código nunca a incluem.',
        '**iPhones e a ligação de contacto:** um toque com o teu cartão de contacto leva também uma ligação para taptilde.com/c, com os dados do teu cartão de contacto escritos na ligação, depois de um #. Um iPhone abre-a para mostrar o teu contacto e guardá-lo. Os browsers nunca enviam a parte depois do #, por isso nem a Cloudflare nem este site recebem os teus dados: a página lê-os no telemóvel da outra pessoa, não faz mais pedidos e não guarda nada. Quem tiver a ligação pode lê-la, tal como o próprio cartão de contacto.',
        'Por defeito, a Tilde só responde a toques enquanto está no ecrã. **Responder a toques com a Tilde fechada** (desligado por defeito) deixa-a responder enquanto o telemóvel estiver desbloqueado. Os toques nunca são respondidos a partir do ecrã de bloqueio.',
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
      points: [
        '0 cookies e 0 rastreadores.',
        'A página de contacto (taptilde.com/c) fica registada como qualquer página: a hora, o endereço IP e o browser de quem a abre, nunca os dados da ligação.',
      ],
    },
  ],
  ctaText: 'A Tilde é grátis e de código aberto.',
  backLink: { label: 'voltar à tilde', to: '/pt/tilde' },
  sourceLink: { label: 'código no github', href: repo },
}

export const tildePrivacyText: Record<Locale, TildePrivacyText> = { en, pt }
