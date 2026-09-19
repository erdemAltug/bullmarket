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
    peers: ['AKBNK.IS', 'YKBNK.IS', 'ISCTR.IS', 'HALKB.IS', 'VAKBN.IS'],
  },
  'AKBNK.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'YKBNK.IS', 'ISCTR.IS', 'VAKBN.IS'],
  },
  'YKBNK.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'AKBNK.IS', 'ISCTR.IS', 'HALKB.IS'],
  },
  'ISCTR.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'AKBNK.IS', 'YKBNK.IS', 'HALKB.IS'],
  },
  'HALKB.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'VAKBN.IS', 'ISCTR.IS'],
  },
  'VAKBN.IS': {
    sectorTr: 'Bankacılık',
    peers: ['GARAN.IS', 'HALKB.IS', 'AKBNK.IS'],
  },
  'ASELS.IS': {
    sectorTr: 'Savunma / Teknoloji',
    peers: ['KONTR.IS', 'ASTOR.IS'],
  },
  'ASTOR.IS': {
    sectorTr: 'Savunma / Teknoloji',
    peers: ['ASELS.IS', 'KONTR.IS'],
  },
  'KONTR.IS': {
    sectorTr: 'Savunma / Teknoloji',
    peers: ['ASELS.IS', 'ASTOR.IS'],
  },
  'EREGL.IS': {
    sectorTr: 'Metal Ana / Çelik',
    peers: ['KRDMD.IS', 'CEMTS.IS'],
  },
  'KRDMD.IS': {
    sectorTr: 'Metal Ana / Çelik',
    peers: ['EREGL.IS', 'CEMTS.IS'],
  },
  'CEMTS.IS': {
    sectorTr: 'Metal Ana / Çelik',
    peers: ['EREGL.IS', 'KRDMD.IS'],
  },
  'BIMAS.IS': {
    sectorTr: 'Perakende',
    peers: ['MGROS.IS', 'SOKM.IS'],
  },
  'MGROS.IS': {
    sectorTr: 'Perakende',
    peers: ['BIMAS.IS', 'SOKM.IS'],
  },
  'SOKM.IS': {
    sectorTr: 'Perakende',
    peers: ['BIMAS.IS', 'MGROS.IS'],
  },
  'TUPRS.IS': {
    sectorTr: 'Enerji / Rafineri',
    peers: ['PETKM.IS', 'AYGAZ.IS'],
  },
  'PETKM.IS': {
    sectorTr: 'Enerji / Rafineri',
    peers: ['TUPRS.IS', 'AYGAZ.IS'],
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
  'TTKOM.IS': {
    sectorTr: 'Telekom',
    peers: ['TCELL.IS'],
  },
  'FROTO.IS': {
    sectorTr: 'Otomotiv',
    peers: ['TOASO.IS', 'DOAS.IS', 'ASUZU.IS'],
  },
  'TOASO.IS': {
    sectorTr: 'Otomotiv',
    peers: ['FROTO.IS', 'DOAS.IS'],
  },
  'DOAS.IS': {
    sectorTr: 'Otomotiv',
    peers: ['FROTO.IS', 'TOASO.IS'],
  },
  'ENKAI.IS': {
    sectorTr: 'İnşaat',
    peers: ['TKFEN.IS'],
  },
  'TKFEN.IS': {
    sectorTr: 'İnşaat',
    peers: ['ENKAI.IS'],
  },
  'AEFES.IS': {
    sectorTr: 'Gıda / İçecek',
    peers: ['CCOLA.IS', 'ULKER.IS'],
  },
  'CCOLA.IS': {
    sectorTr: 'Gıda / İçecek',
    peers: ['AEFES.IS', 'ULKER.IS'],
  },
  'ULKER.IS': {
    sectorTr: 'Gıda / İçecek',
    peers: ['AEFES.IS', 'CCOLA.IS'],
  },
};

export function peersFor(symbol: string) {
  return BIST_SECTOR_PEERS[symbol.toUpperCase()] ?? null;
}
