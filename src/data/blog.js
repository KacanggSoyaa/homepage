// blog.js — Blog / daily threads data.
//
// Post fields:
//   id      : unique key (used for the /blog/<id> detail route)
//   date    : displayed timestamp (YYYY-MM-DD)
//   text    : the short preview shown in the feed
//   content : optional longer full version shown on the thread's detail page
//   tag     : optional short category badge
//   likes   : display like-count
//   images  : optional DIRECT image links, shown as a carousel
//
// Read the instructions in src/components/img/blog/README.md before adding a
// post. Keep the most recent posts first.

export const blogPosts = [
  {
    id: 1,
    date: '2026-09-06',
    text: "Going out touching some grass ",
    content:
      "Spend my time alone by myself cause I don't have someone special to ask me out.",
    tag: 'weekend',
    likes: 24,
    // Direct image link (extracted from the Google Photos share page).
    images: [
      'https://lh3.googleusercontent.com/pw/AP1GczOFBHeh3cCY0JMqP_hE9NL56gJEtQ5Sa05yUwGSlp3LsdH4ke4OWF7dWjnsFM3mMrlZlzfKZqQBMd9-oGu_ZPfbszB-ctcsrEKtJTqLrbI2BZIjgk9hQwjRmaGs8ny-AMtX85FpnpUSuhaJG5EvEQvC',
      'https://lh3.googleusercontent.com/pw/AP1GczP6GpZ-19Uobx2cC-JPuhT-uojpHeHWAUxnlvFPiJYG9KzD9QZYwkkzmmOdRyHVEErhFc2Pl-pr5lA4rW6KN4iZHb2Jr6_r56IYaLvDxjep4WKra58',
      'https://lh3.googleusercontent.com/pw/AP1GczPSuniZTv3591KFyMl_r5NDB2hHOXB8GSxty2DM4yxpQBetThcGxVah_nTAeTWsDEK9A77s22bL4rsBWHNyDB2yzhyLZ7NwA7HUhwBChlZYFBeSNTM',
    ],
  },
]