import SummaryCards from "./components/SummaryCards"
import GrafikMinggu from "./components/GrafikMinggu"
import GrafikBulan from "./components/GrafikBulan"
import GrafikTahun from "./components/GrafikTahun"
import ProgressModal from "./components/ProgressModal"
import ExportPDF from "./components/ExportPDF"

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Laporan & Grafik</h1>
        <p className="text-sm text-gray-400 mt-1">Ringkasan keuangan kantin kamu</p>
      </div>
      <SummaryCards />
      <ProgressModal />
      <ExportPDF />
      <GrafikBulan />
      <GrafikMinggu />
      <GrafikTahun />
    </div>
  )
}