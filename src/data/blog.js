// blog.js — Blog / daily threads data.
//
// Post fields:
//   id      : unique key (used for the /blog/<id> detail route)
//   date    : displayed timestamp (YYYY-MM-DD)
//   text    : the short preview shown in the feed
//   content : optional longer full version shown on the thread's detail page
//   tag     : optional short category badge
//   rating  : how much I liked it, 0–5 stars
//   images  : optional DIRECT image links, shown as a carousel
//
// Read the instructions in src/components/img/blog/README.md before adding a
// post. Keep the most recent posts first.

export const blogPosts = [
  {
    id: 2,
    date: '2026-09-03',
    text: "Attend to OGA 2026 at KLCC",
    content:
      "I went to OGA 2026 at KLCC, and it was a great experience. I got to see a lot of stuff related to oil and gas industry. \n\n Since it's a Oil and Gas industry exhibition, I'm not really understand their things",
    tag: 'Exhibition',
    rating: 2,
    // Direct image link (extracted from the Google Photos share page).
    images: [
      'https://lh3.googleusercontent.com/pw/AP1GczNrocEMrvSqf5VaH-x0cqdFvoImoZQldrRufub9K3KGiM0m4No6SFssdHBynBMDtjEU44gt18NzQbk9EaW_ga1OeUaRBEfUlpVpgG-cSSnbrNU1Obo',
      'https://lh3.googleusercontent.com/pw/AP1GczOiDYtQk-Y0i1xTNJ_MIrwGa0VljNq8VYy3SCo0cD-relhnr_cj4TwxWPVJCZSCb31Ne7Nb8vAGkj7NzMRqqtIlN5rskmTJTmzg-tnxVIljQ5U-PZ0',
      'https://lh3.googleusercontent.com/pw/AP1GczMC-Qik1inY-_4wYYZsRxbUp-sLujSHX07Ay53ndX-xDT0lPNMSaj6wfNL33BqL-wiHJfGF5ipdKAcDoQK3JOmmIse5iRO4XagnxDEWfmZUik4D3AU',
      'https://lh3.googleusercontent.com/pw/AP1GczOcTOTnn0sj2ChGa_FVGkL4ON-YUF8hVFI4Jd76kI74KhiwkBr2IeuLdK2dnNRnForRC_3Jopt-YjEsqB6GPScayZhIWEbB6Hid1C5AceqD0sp8k5c',
    ],
  },
  {
    id: 1,
    date: '2026-08-23',
    text: "Going out touching some grass ",
    content:
      "Spend my time alone by myself cause I don't have someone special to ask me out. I went to new Ombak KLCC Mall that just launched near KLCC park",
    tag: 'weekend',
    rating: 4,
    // Direct image link (extracted from the Google Photos share page).
    images: [
      'https://lh3.googleusercontent.com/pw/AP1GczOFBHeh3cCY0JMqP_hE9NL56gJEtQ5Sa05yUwGSlp3LsdH4ke4OWF7dWjnsFM3mMrlZlzfKZqQBMd9-oGu_ZPfbszB-ctcsrEKtJTqLrbI2BZIjgk9hQwjRmaGs8ny-AMtX85FpnpUSuhaJG5EvEQvC',
      'https://lh3.googleusercontent.com/pw/AP1GczP6GpZ-19Uobx2cC-JPuhT-uojpHeHWAUxnlvFPiJYG9KzD9QZYwkkzmmOdRyHVEErhFc2Pl-pr5lA4rW6KN4iZHb2Jr6_r56IYaLvDxjep4WKra58',
      'https://lh3.googleusercontent.com/pw/AP1GczPSuniZTv3591KFyMl_r5NDB2hHOXB8GSxty2DM4yxpQBetThcGxVah_nTAeTWsDEK9A77s22bL4rsBWHNyDB2yzhyLZ7NwA7HUhwBChlZYFBeSNTM',
    ],
  },
]