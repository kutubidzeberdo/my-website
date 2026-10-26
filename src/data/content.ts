export type Language = 'ka' | 'en';
export const content = {
  ka: {
    company: 'აჭარის პროექტების მართვის კომპანია', short: 'აჭარის პროექტების', second: 'მართვის კომპანია',
    nav: ['მთავარი', 'კომპანიის შესახებ', 'პროექტები', 'სიახლეები', 'კონტაქტი'],
    contact: 'დაგვიკავშირდით', explore: 'პროექტების ნახვა', eyebrow: 'ინფრასტრუქტურა უკეთესი მომავლისთვის',
    slides: [
      ['ბათუმი არენა', 'სპორტული ინფრასტრუქტურა და სივრცე ახალი შესაძლებლობებისთვის.'],
      ['ჩირუხის ზიპლაინი', 'ტურისტული ინფრასტრუქტურა აჭარის მთიანეთში.'],
      ['დასრულებული ინფრასტრუქტურული პროექტები', 'გაეცანით რეგიონის ინფრასტრუქტურულ პროექტებს.'],
      ['მიმდინარე მშენებლობები', 'პროექტის დაგეგმვიდან განხორციელების თითოეულ ეტაპამდე.'],
    ],
    overview: 'პროექტები, რომლებიც აჭარის მომავალს ქმნის',
    description: 'ინფრასტრუქტურული პროექტების დაგეგმვა, კოორდინაცია და განხორციელების მართვა.',
    demo: 'სადემონსტრაციო ვებგვერდი • ფოტოები საილუსტრაციოა',
    footerText: 'აჭარის ინფრასტრუქტურული პროექტები — ერთ სივრცეში.',
    footerTitles: ['ნავიგაცია', 'ინფორმაცია', 'კონტაქტი'],
    footerLinks: ['შესყიდვები', 'გამჭვირვალობა', 'პარტნიორები და კარიერა'],
    contactNote: 'ლ. გუდიაშვილის ქუჩა. N8',
    rights: 'ყველა უფლება დაცულია.', pause: 'სლაიდების შეჩერება', play: 'სლაიდების გაშვება', next: 'შემდეგი სლაიდი', previous: 'წინა სლაიდი', menu: 'მენიუ',
  },
  en: {
    company: 'Adjara Project Management Company', short: 'Adjara Project', second: 'Management Company',
    nav: ['Home', 'About the company', 'Projects', 'სიახლეები', 'Contact'],
    contact: 'Get in touch', explore: 'Explore projects', eyebrow: 'INFRASTRUCTURE FOR A BETTER FUTURE',
    slides: [
      ['Batumi Arena', 'Sports infrastructure and a space for new possibilities.'],
      ['Chirukhi Zipline', 'Tourism infrastructure in the mountains of Adjara.'],
      ['Completed infrastructure projects', 'Explore infrastructure projects across the region.'],
      ['Ongoing construction', 'From project planning through every stage of delivery.'],
    ],
    overview: 'Projects shaping the future of Adjara', description: 'Planning, coordination and delivery management for infrastructure projects.',
    demo: 'DEMO WEBSITE • PHOTOGRAPHY IS ILLUSTRATIVE', footerText: 'Infrastructure projects in Adjara, brought together.',
    footerTitles: ['Navigation', 'Information', 'Contact'], footerLinks: ['Procurement', 'Transparency', 'Partners & careers'],
    contactNote: 'ლ. გუდიაშვილის ქუჩა. N8', rights: 'All rights reserved.', pause: 'Pause slideshow', play: 'Play slideshow', next: 'Next slide', previous: 'Previous slide', menu: 'Menu',
  },
};
content.en = {...content.ka};
export const slideImages = ['/images/arena.jpg', '/images/mountains.jpg', '/images/infrastructure.jpg', '/images/construction.jpg'];
