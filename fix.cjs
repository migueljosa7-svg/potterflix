const fs = require('fs')
const path = 'src/components/CategoryRow.tsx'
const l = fs.readFileSync(path, 'utf8').split(/\r?\n/)

// Head: everything up to and including 'track.scrollBy({'
const head = l.slice(0, 107)

const mid = [
  '      left: direction * (CARD_WIDTH + GAP) * 2,',
  "      behavior: 'smooth',",
  '    })',
  '  }',
  '',
  '  return (',
  '    <section',
  '      ref={sectionRef}',
  '      id={id}',
  '      className="group/row relative mb-14 scroll-mt-28 transition-opacity duration-700"',
  '      style={{',
  '        opacity: visible ? 1 : 0,',
  "        transform: visible ? undefined : 'translate3d(0, 28px, 0)',",
  '      }}',
  '    >',
]

// Body: from the header block down to the closing '>' of the <section>
const body = l.slice(108, 227)

const out = head.concat(mid, body)
fs.writeFileSync(path, out.join('\n') + '\n', 'utf8')
console.log('lines=' + out.length)