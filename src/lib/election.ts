export const categories = [
  'ANUGERAH SI PALING CERIA DAN SPORTING',
  'ANUGERAH KAKI BORAK',
  'ANUGERAH PENYELESAIAN MASALAH TERBAIK',
  'ANUGERAH IKON WARGA KERJA',
  'ANUGERAH INOVASI DAN INOVATIF',
  'ANUGERAH PALING PROAKTIF',
  'ANUGERAH PEGAWAI CEMERLANG',
].map((name, i) => ({ id: String.fromCharCode(65 + i), name }))
const names = [
  'MUHAMMAD FARHAN BIN ESA',
  'NUR FATIHAH BINTI MOHD IDRIS',
  'SITI NORHUZAILIN BINTI MOHD YAZID',
  'MOHD AFFANDI BIN AB SAMAD',
  'NOOR LYANAH BINTI ABU HASSAN',
  'MOHD ARIFF BIN MOHD SAAT',
  'AHMAD BUKHARI BIN HAMIZAN',
  'MOHD NOOR HALIMY BIN MOHD NAJIB',
  'AMENUDDIN BIN SALAMON',
  'MOHAMAD AIZUWAN BIN ISMAIL',
  'SITI NAJIHAH BINTI ZAINI',
  'THANARAJ A/L PALANIVELU',
  'HAFDZUL RAHMAN BIN ROSKELANA',
  'WAHIDA BINTI BAKAR',
  'ZURAINI BINTI MASRI',
  'ROHANA BINTI ISA',
  'ZETTY HIRLIZA BINTI JAMIL',
  'FARAH NABEELA BINTI JAMAIL',
  'SALASIAH BINTI MHD YUSOP',
  'CHE FAIZAH BINTI CHE MOHD NOOR',
  'NORFARAHIDA BINTI RAMLI',
  'ERRINA ERYANI BINTI AZMAN SHAH',
  'SYAZWANIE BINTI SAFAR',
  'ABDUL MUAZ FAHMI BIN ABDUL HALIM',
  'MUHAMMAD DANISH BIN SABARUDIN',
  'ROSMANI BINTI ABD MANAF',
  'ROSMAN BIN SAAAT',
]
export type Election = {
  title: string
  background: string
  open: boolean
  categories: { id: string; name: string }[]
  participants: { id: string; name: string }[]
}
export const initialElection: Election = {
  title: 'ANUGERAH KHAS KPDN SEGAMAT 2026',
  background: 'emerald',
  open: true,
  categories,
  participants: names.map((name, i) => ({ id: `p${i + 1}`, name })),
}
export type Selection = {
  categoryId: string
  participantId: string
  name: string
}
export type PublicData = { election: Election; version: number; voted: boolean }
