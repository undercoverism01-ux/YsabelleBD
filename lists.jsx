// lists.jsx — 5 numbered guest list boards (9 rows × 2 cols = 18 each)

const LIST_BOARDS = [
  {
    key: "roses",
    title: "18's Roses",
    names: [
      "Lolo Edwin", "Jaylord Florentino", "Akiya Kikubo", "Kojiro Matsumoto",
      "Dino Cajurao", "Arvin Alit", "Kearne Alit", "Bryce Alit",
      "Denzel Cajuro", "Yuehann Florentino", "Jefferson Florentino", "Ronielo Valdez",
      "Jairo Rio", "Clarence Mamaril", "Jian Cahanap", "Myles Dizon",
      "Justine Marmita", "Mark Amable",
    ],
  },
  {
    key: "candles",
    title: "18's Candles",
    names: [
      "Mommy Carol", "Aiessa Florentino", "Jennifer Alit", "Schanelle Florentino",
      "Dazzel Cajurao", "Claire Alit", "Shantaye Bactong", "Sophia Bactong",
      "Jana Cajurao", "Jon Florentino", "Gella Fortuno", "Stephanie Florentino",
      "Khelly Devera", "Jeanny Vergara", "Jashlene Palileo", "Rachelle Ulam",
      "Sharmaine Catubig", "Czarina Estrella",
    ],
  },
  {
    key: "delights",
    title: "18's Pink Delights",
    names: [
      "Willrose Cardinez", "Jie Cabiting", "Mavie Balberde", "Soel Saucelo",
      "Mariel Genoza", "Nicole Laborte", "Rosalyn Puod", "Yang Arciaga",
      "Scarlett Gonzales", "Rihanna Caberos", "Julianna Sy", "Paris Icalla",
      "Arielle Dimaguila", "Margaret De guzman", "Rheanne Capitly", "Blaire Abracia",
      "Ashley Cuña", "Rowika Salonga",
    ],
  },
  {
    key: "shots",
    title: "18's Shots",
    names: [
      "Aiessa Florentino", "Kearne Alit", "Bryce Alit", "Sophia Bactong",
      "Shantaye Bactong", "Kana Fujikawa", "Denzel Cajurao", "Myles Dizon",
      "Axel Cañete", "Sandrick Gille", "Raymond Agas", "Ashley Baligod",
      "Kristel Leuterio", "Kim Libo-on", "Hannah Santelices", "Thea Fuñe",
      "Margaret De guzman", "Celine Mamaril",
    ],
  },
  {
    key: "bills",
    title: "18's Bills",
    names: [
      "Helen Villarin", "Amie Mamaril", "Jen Bendaña", "Jocelyn Sorilla",
      "Nida Arago", "Ampie Fuñe", "Jeanny Vergara", "Tita Honey Wayne",
      "Mary Shimizu", "Tita Sia", "Anne Florentino", "Leah Morimoto",
      "Renalou Valdez", "Kuya Ryan", "Ninang Ronafe", "Ate Juvie",
      "Tito Jericho", "Tita Susie",
    ],
  },
];

function ListBoards({ boardYs, paddingX, paddingY, fontSize, bgOpacity, blur, feather, width }) {
  return (
    <>
      {LIST_BOARDS.map((b, i) => (
        <div
          className="lb"
          key={b.key}
          style={{
            top: (boardYs[i] || 0) + "%",
            width: (width ?? 92) + "%",
            paddingLeft: paddingX + "%",
            paddingRight: paddingX + "%",
            paddingTop: paddingY + "%",
            paddingBottom: paddingY + "%",
            fontSize: fontSize + "px",
            "--lb-bg": `rgba(236, 201, 210, ${bgOpacity})`,
            "--lb-blur": `${blur}px`,
            "--lb-feather": `${feather}%`,
          }}
        >
          <ol className="lb__col lb__col--l">
            {b.names.slice(0, 9).map((n, j) => (
              <li key={j}>
                <span className="lb__num">{j + 1}.</span>
                <span className="lb__name">{n}</span>
              </li>
            ))}
          </ol>
          <ol className="lb__col lb__col--r" start={10}>
            {b.names.slice(9, 18).map((n, j) => (
              <li key={j}>
                <span className="lb__num">{j + 10}.</span>
                <span className="lb__name">{n}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <style>{`
        .lb {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 6%;
          z-index: 2;
          pointer-events: none;
          font-family: "Cormorant Garamond", "Playfair Display", serif;
          color: #3a124e;
          isolation: isolate;
        }
        .lb::before {
          content: "";
          position: absolute; inset: -6%;
          background: var(--lb-bg, rgba(236, 201, 210, 0.55));
          -webkit-backdrop-filter: blur(var(--lb-blur, 8px));
                  backdrop-filter: blur(var(--lb-blur, 8px));
          -webkit-mask:
            linear-gradient(to right, transparent 0, #000 var(--lb-feather, 35%), #000 calc(100% - var(--lb-feather, 35%)), transparent 100%),
            linear-gradient(to bottom, transparent 0, #000 var(--lb-feather, 35%), #000 calc(100% - var(--lb-feather, 35%)), transparent 100%);
          -webkit-mask-composite: source-in;
                  mask:
            linear-gradient(to right, transparent 0, #000 var(--lb-feather, 35%), #000 calc(100% - var(--lb-feather, 35%)), transparent 100%),
            linear-gradient(to bottom, transparent 0, #000 var(--lb-feather, 35%), #000 calc(100% - var(--lb-feather, 35%)), transparent 100%);
                  mask-composite: intersect;
          z-index: -1;
          pointer-events: none;
        }
        .lb__col {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lb__col li {
          display: flex;
          align-items: baseline;
          gap: 6px;
          line-height: 1.25;
        }
        .lb__num {
          flex: 0 0 auto;
          font-weight: 600;
          color: #5a2473;
          min-width: 1.6em;
          text-align: right;
        }
        .lb__name {
          flex: 1 1 auto;
          font-style: italic;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
}

window.ListBoards = ListBoards;
