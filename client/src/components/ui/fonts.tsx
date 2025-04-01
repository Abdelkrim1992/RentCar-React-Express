import React from 'react';

export function Fonts() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;500;600;700;800&family=Turret+Road:wght@500;700;800&family=Work+Sans:wght@300;400;500;600&display=swap');

      :root {
        --font-darker: 'Darker Grotesque', sans-serif;
        --font-work: 'Work Sans', sans-serif;
        --font-turret: 'Turret Road', sans-serif;
      }

      h1, h2, h3, h4, h5 {
        font-family: var(--font-darker);
      }

      body {
        font-family: var(--font-work);
      }

      .font-darker {
        font-family: var(--font-darker);
      }

      .font-work {
        font-family: var(--font-work);
      }

      .font-turret {
        font-family: var(--font-turret);
      }

      .gradient-text {
        background: linear-gradient(to right, #6843EC, #D2FF3A);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `}</style>
  );
}
