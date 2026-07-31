/** BİST sektör peer grupları — relative valuation için */
export const BIST_SECTOR_PEERS: Record<
  string,
  { sectorTr: string; peers: string[] }
> = {
  'THYAO.IS': {
    sectorTr: 'Ulaştırma / Havacılık',
    peers: ['PGSUS.IS', 'TAVHL.IS', 'CLEBI.IS'],
  },
  'PGSUS.IS': {
    sectorTr: 'Ulaştırma / Havacılık',
    peers: ['THYAO.IS', 'TAVHL.IS'],
  },
  'TAVHL.IS': {
    sectorTr: 'Ulaştırma / Havacılık',
    peers: ['THYAO.IS', 'PGSUS.IS'],
  },
  'GARAN.IS': {
    sectorTr: 'Bankacılık',
    peers: ['AKBNK.IS', 'YKBNK.IS', 'ISCTR.IS', 'HALKB.IS'],
  },
  'AKBNK.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'YKBNK.IS', 'ISCTR.IS'],
  },
  'YKBNK.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'AKBNK.IS', 'ISCTR.IS'],
  },
  'ISCTR.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'AKBNK.IS', 'YKBNK.IS'],
  },
  'ASELS.IS': {
    sectorTr: 'Savunma / Teknoloji',
    peers: ['KONTR.IS', 'ASTOR.IS'],
  },
  'EREGL.IS': {
    sectorTr: 'Metal Ana / Çelik',
    peers: ['KRDMD.IS', 'CEMTS.IS'],
  },
  'KRDMD.IS': {
    sectorTr: 'Metal Ana / Çelik',
    peers: ['EREGL.IS'],
  },
  'BIMAS.IS': {
    sectorTr: 'Perakende',
    peers: ['MGROS.IS', 'SOKM.IS'],
  },
  'TUPRS.IS': {
    sectorTr: 'Enerji / Rafineri',
    peers: ['PETKM.IS', 'AYGAZ.IS'],
  },
  'SISE.IS': {
    sectorTr: 'Holding / Cam',
    peers: ['KCHOL.IS', 'SAHOL.IS'],
  },
  'KCHOL.IS': {
    sectorTr: 'Holding',
    peers: ['SAHOL.IS', 'SISE.IS'],
  },
  'SAHOL.IS': {
    sectorTr: 'Holding',
    peers: ['KCHOL.IS', 'SISE.IS'],
  },
  'TCELL.IS': {
    sectorTr: 'Telekom',
    peers: ['TTKOM.IS'],
  },
  'FROTO.IS': {
    sectorTr: 'Otomotiv',
    peers: ['TOASO.IS', 'DOAS.IS', 'ASUZU.IS'],
  },
  'TOASO.IS': {
    sectorTr: 'Otomotiv',
    peers: ['FROTO.IS', 'DOAS.IS'],
  },
};

export function peersFor(symbol: string) {
  return BIST_SECTOR_PEERS[symbol.toUpperCase()] ?? null;
}
