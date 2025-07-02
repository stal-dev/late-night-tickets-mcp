export interface Show {
  name: string;
  url: string;
  defaultStartTime: string;  
  location: string;  
}

export const DEFAULT_SHOWS: Show[] = [  
  {
    name: 'The View',
    url: 'https://1iota.com/show/385/the-view',
    defaultStartTime: '9:30 AM ET',
    location: 'New York City, NY'
  },
  {
    name: 'The Late Show with Stephen Colbert',
    url: 'https://1iota.com/show/536/the-late-show-with-stephen-colbert',
    defaultStartTime: '4:15 PM ET',
    location: 'New York City, NY'
  },
  {
    name: 'The Daily Show',
    url: 'https://1iota.com/show/1248/the-daily-show',
    defaultStartTime: '4:30 PM ET',
    location: 'New York City, NY'
  },
  {
    name: 'The Tonight Show Starring Jimmy Fallon',
    url: 'https://1iota.com/show/353/the-tonight-show-starring-jimmy-fallon',
    defaultStartTime: '3:45 PM ET',
    location: 'New York City, NY'
  },
  {
    name: 'Jimmy Kimmel Live',
    url: 'https://1iota.com/show/1/jimmy-kimmel-live',
    defaultStartTime: '3:15 PM PT',
    location: 'Los Angeles, CA'
  },
  {
    name: 'Late Night with Seth Meyers',
    url: 'https://1iota.com/show/461/late-night-with-seth-meyers',
    defaultStartTime: '2:00 PM ET',
    location: 'New York City, NY'
  }
];